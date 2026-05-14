using CounterStrikeSharp.API;
using CounterStrikeSharp.API.Core;
using CounterStrikeSharp.API.Modules.Memory;
using CounterStrikeSharp.API.Modules.Memory.DynamicFunctions;
using FlowServer.Logging;

namespace FlowServer.Paints;

public sealed class PaintApplicationService
{
    private const ulong MinimumCustomItemId = 65578;

    private static readonly MemoryFunctionVoid<nint, string, float> AttributeListSetOrAddAttributeValueByName =
        new(GameData.GetSignature("CAttributeList_SetOrAddAttributeValueByName"));

    private readonly PaintLoadoutStore _loadoutStore;

    private ulong _nextItemId = MinimumCustomItemId;

    public PaintApplicationService(PaintLoadoutStore loadoutStore)
    {
        _loadoutStore = loadoutStore;
    }

    public void ApplyFullLoadout(CCSPlayerController player)
    {
        if (!IsValidHumanPlayer(player))
        {
            return;
        }

        ApplyAgent(player);
        ApplyGloves(player);
        ApplyToCurrentWeapons(player);
    }

    public void ApplyToCurrentWeapons(CCSPlayerController player)
    {
        if (!IsValidHumanPlayer(player))
        {
            return;
        }

        var pawn = player.PlayerPawn.Value;

        if (pawn?.WeaponServices?.MyWeapons is null)
        {
            return;
        }

        foreach (var weaponHandle in pawn.WeaponServices.MyWeapons)
        {
            var weapon = weaponHandle.Value;

            if (weapon is null || !weapon.IsValid)
            {
                continue;
            }

            ApplyToWeapon(player, weapon);
        }
    }

    public void ApplyToWeapon(CCSPlayerController player, CBasePlayerWeapon weapon)
    {
        if (!IsValidHumanPlayer(player))
        {
            return;
        }

        if (!_loadoutStore.TryGet(player, out var loadout))
        {
            return;
        }

        if (!weapon.DesignerName.StartsWith("weapon_", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        try
        {
            if (IsKnife(weapon))
            {
                ApplyKnife(player, weapon, loadout);
                return;
            }

            ApplyGun(player, weapon, loadout);
        }
        catch (Exception error)
        {
            PluginConsole.Error($"Failed to apply cosmetic to {weapon.DesignerName}: {error.Message}");
        }
    }

    public void ApplyGloves(CCSPlayerController player)
    {
        if (!IsValidHumanPlayer(player))
        {
            return;
        }

        if (!_loadoutStore.TryGet(player, out var loadout) || loadout.Gloves is null)
        {
            return;
        }

        var pawn = player.PlayerPawn.Value;

        if (pawn is null || !pawn.IsValid)
        {
            return;
        }

        try
        {
            var gloves = loadout.Gloves;
            var item = pawn.EconGloves;

            item.ItemDefinitionIndex = (ushort)gloves.DefinitionIndex;
            item.EntityQuality = 3;
            item.Initialized = true;

            UpdateEconItemId(item);

            item.AttributeList.Attributes.RemoveAll();
            item.NetworkedDynamicAttributes.Attributes.RemoveAll();

            ApplyPaintAttributes(item, gloves.PaintKit, gloves.Seed, gloves.Wear);

            // These force a visual refresh for gloves.
            player.ExecuteClientCommand("lastinv");
            pawn.AcceptInput("SetBodygroup", value: "first_or_third_person,0");

            Server.NextFrame(() =>
            {
                if (pawn.IsValid)
                {
                    pawn.AcceptInput("SetBodygroup", value: "first_or_third_person,1");
                }
            });
        }
        catch (Exception error)
        {
            PluginConsole.Error($"Failed to apply gloves: {error.Message}");
        }
    }

    public void ApplyAgent(CCSPlayerController player)
    {
        if (!IsValidHumanPlayer(player))
        {
            return;
        }

        if (!_loadoutStore.TryGet(player, out var loadout) || loadout.Agents is null)
        {
            return;
        }

        var pawn = player.PlayerPawn.Value;

        if (pawn is null || !pawn.IsValid)
        {
            return;
        }

        var model = player.TeamNum == 3
            ? loadout.Agents.CounterTerroristModel
            : loadout.Agents.TerroristModel;

        if (string.IsNullOrWhiteSpace(model))
        {
            return;
        }

        try
        {
            var normalizedModel = NormalizeAgentModelPath(model);

            Server.NextFrame(() =>
            {
                if (pawn.IsValid)
                {
                    pawn.SetModel(normalizedModel);
                }
            });
        }
        catch (Exception error)
        {
            PluginConsole.Error($"Failed to apply agent model: {error.Message}");
        }
    }

    private void ApplyGun(
        CCSPlayerController player,
        CBasePlayerWeapon weapon,
        PlayerPaintLoadout loadout)
    {
        var item = weapon.AttributeManager.Item;
        var definitionIndex = item.ItemDefinitionIndex;

        if (!WeaponDefinitionMap.IsSupportedWeapon(definitionIndex))
        {
            return;
        }

        if (!loadout.WeaponsByDefIndex.TryGetValue(definitionIndex, out var paint))
        {
            return;
        }

        ApplyWeaponPaint(player, weapon, paint, entityQuality: 0);
    }

    private void ApplyKnife(
        CCSPlayerController player,
        CBasePlayerWeapon weapon,
        PlayerPaintLoadout loadout)
    {
        if (loadout.Knife is null)
        {
            return;
        }

        var knife = loadout.Knife;
        var item = weapon.AttributeManager.Item;

        if (item.ItemDefinitionIndex != knife.DefinitionIndex)
        {
            weapon.AcceptInput("ChangeSubclass", value: knife.DefinitionIndex.ToString());
        }

        item.ItemDefinitionIndex = (ushort)knife.DefinitionIndex;

        var paint = new WeaponPaint
        {
            PaintKit = knife.PaintKit,
            Seed = knife.Seed,
            Wear = knife.Wear,
            NameTag = knife.NameTag
        };

        ApplyWeaponPaint(player, weapon, paint, entityQuality: 3);
    }

    private void ApplyWeaponPaint(
        CCSPlayerController player,
        CBasePlayerWeapon weapon,
        WeaponPaint paint,
        int entityQuality)
    {
        var item = weapon.AttributeManager.Item;

        item.AccountID = (uint)player.SteamID;
        item.EntityQuality = entityQuality;
        item.CustomName = paint.NameTag;

        UpdateEconItemId(item);

        item.AttributeList.Attributes.RemoveAll();
        item.NetworkedDynamicAttributes.Attributes.RemoveAll();

        weapon.FallbackPaintKit = paint.PaintKit;
        weapon.FallbackSeed = paint.Seed;
        weapon.FallbackWear = paint.Wear;

        ApplyPaintAttributes(item, paint.PaintKit, paint.Seed, paint.Wear);

        UpdateWeaponMeshGroupMask(weapon, paint.LegacyModel);
    }

    private static void UpdateWeaponMeshGroupMask(CBasePlayerWeapon weapon, bool legacyModel)
    {
        weapon.AcceptInput("SetBodygroup", value: $"body,{(legacyModel ? 1 : 0)}");
    }

    private static void ApplyPaintAttributes(
        CEconItemView item,
        int paintKit,
        int seed,
        float wear)
    {
        SetAttribute(
            item.NetworkedDynamicAttributes.Handle,
            "set item texture prefab",
            paintKit);

        SetAttribute(
            item.NetworkedDynamicAttributes.Handle,
            "set item texture seed",
            seed);

        SetAttribute(
            item.NetworkedDynamicAttributes.Handle,
            "set item texture wear",
            wear);

        SetAttribute(
            item.AttributeList.Handle,
            "set item texture prefab",
            paintKit);

        SetAttribute(
            item.AttributeList.Handle,
            "set item texture seed",
            seed);

        SetAttribute(
            item.AttributeList.Handle,
            "set item texture wear",
            wear);
    }

    private static void SetAttribute(nint attributeListHandle, string name, int value)
    {
        AttributeListSetOrAddAttributeValueByName.Invoke(
            attributeListHandle,
            name,
            Convert.ToSingle(value));
    }

    private static void SetAttribute(nint attributeListHandle, string name, float value)
    {
        AttributeListSetOrAddAttributeValueByName.Invoke(
            attributeListHandle,
            name,
            value);
    }

    private void UpdateEconItemId(CEconItemView item)
    {
        var itemId = _nextItemId++;

        item.ItemID = itemId;
        item.ItemIDLow = (uint)itemId & 0xFFFFFFFF;
        item.ItemIDHigh = (uint)(itemId >> 32);
    }

    private static bool IsKnife(CBasePlayerWeapon weapon)
    {
        return weapon.DesignerName.Contains("knife", StringComparison.OrdinalIgnoreCase) ||
               weapon.DesignerName.Contains("bayonet", StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizeAgentModelPath(string model)
    {
        if (model.EndsWith(".vmdl", StringComparison.OrdinalIgnoreCase))
        {
            return model;
        }

        return $"{model}.vmdl";
    }

    private static bool IsValidHumanPlayer(CCSPlayerController? player)
    {
        return player is not null &&
               player.IsValid &&
               !player.IsBot;
    }
}
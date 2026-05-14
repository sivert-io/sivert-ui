using System.Collections.Concurrent;
using CounterStrikeSharp.API;
using CounterStrikeSharp.API.Core;
using FlowServer.Logging;
using CounterStrikeSharp.API.Modules.Memory.DynamicFunctions;

namespace FlowServer.Paints;

public sealed class PaintEventListener
{
    private readonly PaintApiClient _paintApiClient;
    private readonly PaintLoadoutStore _loadoutStore;
    private readonly PaintApplicationService _paintApplicationService;
    private readonly Func<CancellationToken> _getLifetimeToken;

    private readonly ConcurrentDictionary<int, CCSPlayerController> _playersBySlot = new();

    public PaintEventListener(
        PaintApiClient paintApiClient,
        PaintLoadoutStore loadoutStore,
        PaintApplicationService paintApplicationService,
        Func<CancellationToken> getLifetimeToken)
    {
        _paintApiClient = paintApiClient;
        _loadoutStore = loadoutStore;
        _paintApplicationService = paintApplicationService;
        _getLifetimeToken = getLifetimeToken;
    }

    public HookResult OnPlayerConnectFull(EventPlayerConnectFull @event, GameEventInfo info)
    {
        var player = @event.Userid;

        if (!IsValidHumanPlayer(player))
        {
            return HookResult.Continue;
        }

        _playersBySlot[player.Slot] = player;

        _ = LoadPaintsForPlayerAsync(player);

        return HookResult.Continue;
    }

    public HookResult OnPlayerDisconnect(EventPlayerDisconnect @event, GameEventInfo info)
    {
        var player = @event.Userid;

        if (player is not null)
        {
            _loadoutStore.Remove(player);
            _playersBySlot.TryRemove(player.Slot, out _);
        }

        return HookResult.Continue;
    }

    public HookResult OnPlayerSpawn(EventPlayerSpawn @event, GameEventInfo info)
    {
        var player = @event.Userid;

        if (!IsValidHumanPlayer(player))
        {
            return HookResult.Continue;
        }

        _playersBySlot[player.Slot] = player;

        Server.NextFrame(() =>
        {
            _paintApplicationService.ApplyFullLoadout(player);
        });

        return HookResult.Continue;
    }

    public void OnEntityCreated(CEntityInstance entity)
    {
        if (!entity.DesignerName.StartsWith("weapon_", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        Server.NextWorldUpdate(() =>
        {
            var weapon = new CBasePlayerWeapon(entity.Handle);

            if (!weapon.IsValid)
            {
                return;
            }

            var player = TryGetWeaponOwner(weapon);

            if (!IsValidHumanPlayer(player))
            {
                return;
            }

            _paintApplicationService.ApplyToWeapon(player!, weapon);
        });
    }

    private async Task LoadPaintsForPlayerAsync(CCSPlayerController player)
    {
        try
        {
            var steamId = player.SteamID.ToString();

            var loadout = await _paintApiClient.GetLoadoutForPlayerAsync(
                steamId,
                _getLifetimeToken());

            _loadoutStore.Set(player, loadout);

            PluginConsole.Info($"Loaded mock cosmetic loadout for {player.PlayerName} ({steamId}).");

            Server.NextFrame(() =>
            {
                _paintApplicationService.ApplyFullLoadout(player);
            });
        }
        catch (OperationCanceledException)
        {
        }
        catch (Exception error)
        {
            PluginConsole.Error($"Failed to load cosmetic loadout: {error.Message}");
        }
    }

    private CCSPlayerController? TryGetWeaponOwner(CBasePlayerWeapon weapon)
    {
        if (!weapon.OwnerEntity.IsValid)
        {
            return null;
        }

        var ownerIndex = weapon.OwnerEntity.Index;

        foreach (var player in _playersBySlot.Values)
        {
            if (!IsValidHumanPlayer(player))
            {
                continue;
            }

            var pawn = player.PlayerPawn.Value;

            if (pawn is null || !pawn.IsValid)
            {
                continue;
            }

            if (pawn.Index == ownerIndex)
            {
                return player;
            }
        }

        return null;
    }

    private static bool IsValidHumanPlayer(CCSPlayerController? player)
    {
        return player is not null &&
               player.IsValid &&
               !player.IsBot;
    }

    public HookResult OnGiveNamedItemPost(DynamicHook hook)
    {
        try
        {
            var weapon = hook.GetReturn<CBasePlayerWeapon>();

            if (weapon is null || !weapon.IsValid)
            {
                return HookResult.Continue;
            }

            if (!weapon.DesignerName.StartsWith("weapon_", StringComparison.OrdinalIgnoreCase))
            {
                return HookResult.Continue;
            }

            Server.NextFrame(() =>
            {
                var player = TryGetWeaponOwner(weapon);

                if (!IsValidHumanPlayer(player))
                {
                    return;
                }

                _paintApplicationService.ApplyToWeapon(player!, weapon);
            });
        }
        catch (Exception error)
        {
            PluginConsole.Error($"GiveNamedItem paint hook failed: {error.Message}");
        }

        return HookResult.Continue;
    }
}
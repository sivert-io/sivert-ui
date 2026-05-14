namespace FlowServer.Paints;

public sealed class PaintApiClient
{
    public Task<PlayerPaintLoadout> GetLoadoutForPlayerAsync(
        string steamId,
        CancellationToken cancellationToken = default)
    {
        var loadout = new PlayerPaintLoadout
        {
            SteamId = steamId,

            Knives = new SideKnifePaint
            {
                // T side: Karambit, vanilla.
                Terrorist = new KnifePaint
                {
                    DefinitionIndex = 507,
                    DesignerName = "weapon_knife_karambit",
                    PaintKit = 0,
                    Seed = 0,
                    Wear = 0.01f,
                    NameTag = "FLOW Karambit",
                    LegacyModel = true
                },

                // CT side: M9 Bayonet, vanilla.
                CounterTerrorist = new KnifePaint
                {
                    DefinitionIndex = 508,
                    DesignerName = "weapon_knife_m9_bayonet",
                    PaintKit = 0,
                    Seed = 0,
                    Wear = 0.01f,
                    NameTag = "FLOW M9",
                    LegacyModel = true
                }
            },

            Gloves = new SideGlovePaint
            {
                // T side: Specialist Gloves | Pillow Punchers.
                Terrorist = new GlovePaint
                {
                    DefinitionIndex = 5034,
                    PaintKit = 1438,
                    Seed = 0,
                    Wear = 0.06f
                },

                // CT side: Driver Gloves | Brocade Flowers.
                CounterTerrorist = new GlovePaint
                {
                    DefinitionIndex = 5031,
                    PaintKit = 1400,
                    Seed = 0,
                    Wear = 0.06f
                }
            },

            // T: Number K | The Professionals
            // CT: Cmdr. Davida 'Goggles' Fernandez | SEAL Frogman
            Agents = new AgentPaint
            {
                PathType = AgentModelPathType.Agent,
                TerroristModel = "tm_professional/tm_professional_vari",
                CounterTerroristModel = "ctm_diver/ctm_diver_varianta"
            },

            WeaponsByDefIndex = new Dictionary<int, WeaponPaint>()
        };

        return Task.FromResult(loadout);
    }
}
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

            // Butterfly Knife, vanilla.
            Knife = new KnifePaint
            {
                DefinitionIndex = 515,
                DesignerName = "weapon_knife_butterfly",
                PaintKit = 0,
                Seed = 0,
                Wear = 0.01f,
                NameTag = "FLOW Butterfly"
            },

            // Sport Gloves | Pandora's Box example.
            // You can change DefinitionIndex/PaintKit later from your API.
            Gloves = new GlovePaint
            {
                DefinitionIndex = 5030,
                PaintKit = 10037,
                Seed = 0,
                Wear = 0.01f
            },

            // Agent model paths are passed without the "agents/models/" prefix
            // and without the ".vmdl" suffix. The service adds those.
            Agents = null,

            WeaponsByDefIndex = new Dictionary<int, WeaponPaint>
            {
                // AK-47 | Fire Serpent
                [7] = new WeaponPaint
                {
                    PaintKit = 180,
                    Seed = 0,
                    Wear = 0.01f,
                    NameTag = "FLOW AK",
                    LegacyModel = true
                },

                // M4A1-S
                [60] = new WeaponPaint
                {
                    PaintKit = 309,
                    Seed = 0,
                    Wear = 0.01f,
                    NameTag = "FLOW M4A1-S"
                },

                // M4A4
                [16] = new WeaponPaint
                {
                    PaintKit = 309,
                    Seed = 0,
                    Wear = 0.01f,
                    NameTag = "FLOW M4A4"
                },

                // AWP
                [9] = new WeaponPaint
                {
                    PaintKit = 344,
                    Seed = 0,
                    Wear = 0.01f,
                    NameTag = "FLOW AWP"
                },

                // Glock-18
                [4] = new WeaponPaint
                {
                    PaintKit = 38,
                    Seed = 0,
                    Wear = 0.01f,
                    NameTag = "FLOW Glock"
                },

                // USP-S
                [61] = new WeaponPaint
                {
                    PaintKit = 504,
                    Seed = 0,
                    Wear = 0.01f,
                    NameTag = "FLOW USP-S"
                },

                // P2000
                [32] = new WeaponPaint
                {
                    PaintKit = 389,
                    Seed = 0,
                    Wear = 0.01f,
                    NameTag = "FLOW P2000"
                },

                // Desert Eagle
                [1] = new WeaponPaint
                {
                    PaintKit = 37,
                    Seed = 0,
                    Wear = 0.01f,
                    NameTag = "FLOW Deagle"
                }
            }
        };

        return Task.FromResult(loadout);
    }
}
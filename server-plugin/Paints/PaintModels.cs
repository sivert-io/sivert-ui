namespace FlowServer.Paints;

public sealed class PlayerPaintLoadout
{
    public string SteamId { get; set; } = "";

    public Dictionary<int, WeaponPaint> WeaponsByDefIndex { get; set; } = new();

    public SideKnifePaint? Knives { get; set; }

    public SideGlovePaint? Gloves { get; set; }

    public AgentPaint? Agents { get; set; }
}

public sealed class SideKnifePaint
{
    public KnifePaint? Terrorist { get; set; }

    public KnifePaint? CounterTerrorist { get; set; }
}

public sealed class SideGlovePaint
{
    public GlovePaint? Terrorist { get; set; }

    public GlovePaint? CounterTerrorist { get; set; }
}

public sealed class WeaponPaint
{
    public int PaintKit { get; set; }

    public int Seed { get; set; }

    public float Wear { get; set; }

    public string NameTag { get; set; } = "";

    public bool LegacyModel { get; set; }
}

public sealed class KnifePaint
{
    public int DefinitionIndex { get; set; }

    public string DesignerName { get; set; } = "";

    public int PaintKit { get; set; }

    public int Seed { get; set; }

    public float Wear { get; set; }

    public string NameTag { get; set; } = "";

    public bool LegacyModel { get; set; }
}

public sealed class GlovePaint
{
    public int DefinitionIndex { get; set; }

    public int PaintKit { get; set; }

    public int Seed { get; set; }

    public float Wear { get; set; }
}

public sealed class AgentPaint
{
    public string TerroristModel { get; set; } = "";

    public string CounterTerroristModel { get; set; } = "";

    public AgentModelPathType PathType { get; set; } = AgentModelPathType.Agent;
}

public enum AgentModelPathType
{
    Agent,
    Character,
    Full
}
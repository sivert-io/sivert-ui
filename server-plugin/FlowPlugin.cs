using CounterStrikeSharp.API.Core;

namespace FlowServer;

public class FlowPlugin : BasePlugin
{
    public override string ModuleName => "Flow Server Plugin";
    public override string ModuleVersion => "0.0.1";
    public override string ModuleAuthor => "Sivert";
    public override string ModuleDescription => "Basic Flow server plugin";

    public override void Load(bool hotReload)
    {
        Console.ForegroundColor = ConsoleColor.Magenta;

        Console.WriteLine("========================================");
        Console.WriteLine("[FLOW SERVER] Plugin loaded!");
        Console.WriteLine($"[FLOW SERVER] Hot reload: {hotReload}");
        Console.WriteLine("========================================");

        Console.ResetColor();
    }
}
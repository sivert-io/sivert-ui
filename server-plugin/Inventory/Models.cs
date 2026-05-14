namespace FlowServer.Inventory;

public sealed class PluginInventory
{
    public bool IsCompliant { get; set; }

    public int DisallowedPluginCount => DisallowedPlugins.Count;

    public string? PluginRoot { get; set; }

    public List<DisallowedPlugin> DisallowedPlugins { get; set; } = new();

    public DateTimeOffset CheckedAt { get; set; }
}

public sealed class DisallowedPlugin
{
    public string Name { get; set; } = "";

    public string Path { get; set; } = "";

    public string[] Dlls { get; set; } = Array.Empty<string>();
}
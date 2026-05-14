namespace FlowServer.Inventory;

public static class PluginInventoryScanner
{
    public static PluginInventory Scan(string modulePath)
    {
        var ownModulePath = Path.GetFullPath(modulePath);
        var ownPluginDirectory = Path.GetDirectoryName(ownModulePath);

        var pluginRoot = ownPluginDirectory is null
            ? null
            : Directory.GetParent(ownPluginDirectory)?.FullName;

        var disallowedPlugins = new List<DisallowedPlugin>();

        if (pluginRoot is null || !Directory.Exists(pluginRoot))
        {
            return new PluginInventory
            {
                IsCompliant = true,
                PluginRoot = pluginRoot,
                DisallowedPlugins = disallowedPlugins,
                CheckedAt = DateTimeOffset.UtcNow,
            };
        }

        foreach (var directory in Directory.EnumerateDirectories(pluginRoot))
        {
            if (PathsEqual(directory, ownPluginDirectory))
            {
                continue;
            }

            var pluginDlls = Directory
                .EnumerateFiles(directory, "*.dll", SearchOption.TopDirectoryOnly)
                .Select(Path.GetFileName)
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .Select(name => name!)
                .OrderBy(name => name, StringComparer.OrdinalIgnoreCase)
                .ToArray();

            if (pluginDlls.Length == 0)
            {
                continue;
            }

            disallowedPlugins.Add(new DisallowedPlugin
            {
                Name = Path.GetFileName(directory),
                Path = directory,
                Dlls = pluginDlls,
            });
        }

        foreach (var dllPath in Directory.EnumerateFiles(pluginRoot, "*.dll", SearchOption.TopDirectoryOnly))
        {
            if (PathsEqual(dllPath, ownModulePath))
            {
                continue;
            }

            disallowedPlugins.Add(new DisallowedPlugin
            {
                Name = Path.GetFileNameWithoutExtension(dllPath),
                Path = dllPath,
                Dlls = new[] { Path.GetFileName(dllPath) },
            });
        }

        return new PluginInventory
        {
            IsCompliant = disallowedPlugins.Count == 0,
            PluginRoot = pluginRoot,
            DisallowedPlugins = disallowedPlugins,
            CheckedAt = DateTimeOffset.UtcNow,
        };
    }

    private static bool PathsEqual(string? left, string? right)
    {
        if (left is null || right is null)
        {
            return false;
        }

        return string.Equals(
            Path.GetFullPath(left).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar),
            Path.GetFullPath(right).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar),
            StringComparison.OrdinalIgnoreCase);
    }
}
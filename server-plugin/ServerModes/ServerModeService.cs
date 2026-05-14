using CounterStrikeSharp.API;
using FlowServer.Logging;

namespace FlowServer.ServerModes;

public sealed class ServerModeService
{
    private static readonly TimeSpan StartupModeDelay = TimeSpan.FromSeconds(2);

    private static readonly IReadOnlyDictionary<ServerMode, string> ConfigsByMode =
        new Dictionary<ServerMode, string>
        {
            [ServerMode.Warmup] = "flow/warmup.cfg",
            [ServerMode.Live] = "flow/live.cfg",
            [ServerMode.Sleep] = "flow/sleep.cfg"
        };

    private readonly Func<CancellationToken> _getLifetimeToken;

    public ServerModeService(Func<CancellationToken> getLifetimeToken)
    {
        _getLifetimeToken = getLifetimeToken;
    }

    public ServerMode CurrentMode { get; private set; } = ServerMode.Sleep;

    public void ScheduleStartupMode(bool hotReload, string mapName)
    {
        _ = ScheduleStartupModeAsync(hotReload, mapName);
    }

    public void ApplyMode(ServerMode mode)
    {
        if (!ConfigsByMode.TryGetValue(mode, out var configPath))
        {
            PluginConsole.Error($"Server mode failed: unknown mode {mode}.");
            return;
        }

        var previousMode = CurrentMode;
        CurrentMode = mode;

        Server.NextWorldUpdate(() =>
        {
            Server.ExecuteCommand($"exec {configPath}");

            PluginConsole.Line();
            PluginConsole.Success($"Server mode: {previousMode} -> {mode}");
            PluginConsole.Code("Config", configPath);
            PluginConsole.Line();
        });
    }

    private async Task ScheduleStartupModeAsync(bool hotReload, string mapName)
    {
        try
        {
            await Task.Delay(StartupModeDelay, _getLifetimeToken());

            Server.NextWorldUpdate(() =>
            {
                if (hotReload)
                {
                    PluginConsole.Line();
                    PluginConsole.Info("Startup mode skipped: hot reload detected.");
                    PluginConsole.Code("Map", mapName);
                    PluginConsole.Line();
                    return;
                }

                ApplyMode(ServerMode.Warmup);
            });
        }
        catch (OperationCanceledException)
        {
            // Plugin unloaded before startup mode was applied.
        }
        catch (Exception error)
        {
            PluginConsole.Error($"Startup mode failed: {error.Message}");
        }
    }
}
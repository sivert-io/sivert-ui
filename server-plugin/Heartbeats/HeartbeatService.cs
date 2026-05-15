using FlowServer.Api;
using FlowServer.Inventory;
using FlowServer.Logging;
using FlowServer.State;

namespace FlowServer.Heartbeats;

public sealed class HeartbeatService
{
    private readonly FlowApiClient _apiClient;
    private readonly FlowServerStateStore _stateStore;
    private readonly Func<CancellationToken> _getLifetimeToken;

    public HeartbeatService(
        FlowApiClient apiClient,
        FlowServerStateStore stateStore,
        Func<CancellationToken> getLifetimeToken)
    {
        _apiClient = apiClient;
        _stateStore = stateStore;
        _getLifetimeToken = getLifetimeToken;
    }

    public async Task RecordAsync(PluginInventory inventory)
    {
        var identity = _stateStore.State.Identity;

        if (identity is null)
        {
            return;
        }

        try
        {
            await _apiClient.RecordHeartbeatAsync(
                identity,
                inventory,
                _getLifetimeToken());

            PluginConsole.Success("Heartbeat sent.");
        }
        catch (OperationCanceledException)
        {
        }
        catch (FlowServerNotFoundException error)
        {
            PluginConsole.Error("Server no longer exists in FLOW API.");
            PluginConsole.Info("Deleting local server identity. Run css_flow_register to register again.");
            PluginConsole.Info(error.Message);

            try
            {
                _stateStore.Reset();
            }
            catch (Exception resetError)
            {
                PluginConsole.Error($"Failed to delete local server identity: {resetError.Message}");
            }
        }
        catch (Exception error)
        {
            PluginConsole.Error($"Heartbeat failed: {error.Message}");
        }
    }
}
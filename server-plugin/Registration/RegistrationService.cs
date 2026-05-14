using CounterStrikeSharp.API.Modules.Commands;
using FlowServer.Api;
using FlowServer.Commands;
using FlowServer.Heartbeats;
using FlowServer.Inventory;
using FlowServer.Logging;
using FlowServer.State;
using FlowServer.Utilities;

namespace FlowServer.Registration;

public sealed class RegistrationService
{
    private static readonly TimeSpan RegistrationPollInterval = TimeSpan.FromSeconds(5);

    private readonly FlowApiClient _apiClient;
    private readonly FlowServerStateStore _stateStore;
    private readonly HeartbeatService _heartbeatService;
    private readonly string _pluginVersion;
    private readonly Func<string> _getModulePath;
    private readonly Func<CancellationToken> _getLifetimeToken;

    public RegistrationService(
        FlowApiClient apiClient,
        FlowServerStateStore stateStore,
        HeartbeatService heartbeatService,
        string pluginVersion,
        Func<string> getModulePath,
        Func<CancellationToken> getLifetimeToken)
    {
        _apiClient = apiClient;
        _stateStore = stateStore;
        _heartbeatService = heartbeatService;
        _pluginVersion = pluginVersion;
        _getModulePath = getModulePath;
        _getLifetimeToken = getLifetimeToken;
    }

    public bool IsRegistrationRequestInFlight { get; private set; }

    public void CreateAndPrintRegistrationKey(CommandInfo command)
    {
        if (IsRegistrationRequestInFlight)
        {
            command.ReplyToCommand("[FLOW] Registration key request already in progress.");
            return;
        }

        IsRegistrationRequestInFlight = true;

        PluginConsole.Info("Requesting a registration key...");

        _ = CreateAndPrintRegistrationKeyAsync(command);
    }

    public void ResumePendingRegistration(
        PendingRegistration pending,
        CommandInfo? command = null)
    {
        if (IsRegistrationRequestInFlight)
        {
            return;
        }

        IsRegistrationRequestInFlight = true;

        PluginConsole.Code("Resuming pending registration", pending.RegistrationKey);

        _ = PollRegistrationUntilClaimedAsync(pending, command);
    }

    public static bool IsPendingRegistrationActive(PendingRegistration? pendingRegistration)
    {
        return pendingRegistration is not null &&
               pendingRegistration.ExpiresAt > DateTimeOffset.UtcNow &&
               !string.IsNullOrWhiteSpace(pendingRegistration.RegistrationKey) &&
               !string.IsNullOrWhiteSpace(pendingRegistration.PollToken);
    }

    private async Task CreateAndPrintRegistrationKeyAsync(CommandInfo command)
    {
        try
        {
            var registration = await _apiClient.CreateRegistrationKeyAsync(_getLifetimeToken());

            var pending = new PendingRegistration
            {
                RegistrationKey = registration.RegistrationKey,
                PollToken = registration.PollToken,
                ExpiresAt = registration.ExpiresAt,
                CreatedAt = DateTimeOffset.UtcNow,
            };

            _stateStore.SetPendingRegistration(pending);

            PluginConsole.Code("Registration key", pending.RegistrationKey);
            PluginConsole.Info("Waiting for the web app to claim this key...");

            CommandReply.Send(command, $"[FLOW] Registration key: {pending.RegistrationKey}");
            CommandReply.Send(command, $"[FLOW] Paste it into the FLOW web app. Expires at {TimeFormatter.Format(pending.ExpiresAt)}.");

            await PollRegistrationUntilClaimedAsync(pending, command);
        }
        catch (OperationCanceledException)
        {
            PluginConsole.Error("Registration request cancelled.");
            CommandReply.Send(command, "[FLOW] Registration request cancelled.");
            IsRegistrationRequestInFlight = false;
        }
        catch (Exception error)
        {
            PluginConsole.Error($"Failed to generate registration key: {error.Message}");
            System.Console.WriteLine(error);

            CommandReply.Send(command, $"[FLOW] Failed to generate registration key: {error.Message}");
            IsRegistrationRequestInFlight = false;
        }
    }

    private async Task PollRegistrationUntilClaimedAsync(
        PendingRegistration pending,
        CommandInfo? command)
    {
        try
        {
            while (DateTimeOffset.UtcNow < pending.ExpiresAt)
            {
                var status = await _apiClient.GetRegistrationStatusAsync(
                    pending.RegistrationKey,
                    pending.PollToken,
                    _getLifetimeToken());

                if (status.Status == "claimed" && status.Server is not null)
                {
                    var identity = new ServerIdentity
                    {
                        ServerId = status.Server.Id,
                        Token = status.Server.Token,
                        DisplayName = status.Server.DisplayName,
                        IpAddress = status.Server.IpAddress,
                        Port = status.Server.Port,
                        ApiBaseUrl = _apiClient.ApiBaseUrl,
                        PluginVersion = _pluginVersion,
                        RegisteredAt = DateTimeOffset.UtcNow,
                    };

                    _stateStore.SetIdentity(identity);

                    PluginConsole.Success($"Server registered as {identity.DisplayName}.");
                    PluginConsole.Info($"Identity saved to {_stateStore.StateFilePath}.");

                    CommandReply.Send(command, $"[FLOW] Server registered as {identity.DisplayName}.");
                    CommandReply.Send(command, $"[FLOW] Identity saved to {_stateStore.StateFilePath}.");

                    await _heartbeatService.RecordAsync(
                        PluginInventoryScanner.Scan(_getModulePath()));

                    return;
                }

                if (status.Status == "expired")
                {
                    ExpirePendingRegistration(command);
                    return;
                }

                await Task.Delay(RegistrationPollInterval, _getLifetimeToken());
            }

            ExpirePendingRegistration(command);
        }
        catch (OperationCanceledException)
        {
            PluginConsole.Info("Registration polling stopped.");
            CommandReply.Send(command, "[FLOW] Registration polling stopped.");
        }
        catch (Exception error)
        {
            PluginConsole.Error($"Registration polling failed: {error.Message}");
            System.Console.WriteLine(error);

            CommandReply.Send(command, $"[FLOW] Registration polling failed: {error.Message}");
        }
        finally
        {
            IsRegistrationRequestInFlight = false;
        }
    }

    private void ExpirePendingRegistration(CommandInfo? command)
    {
        _stateStore.ClearPendingRegistration();

        PluginConsole.Error("Registration key expired. Run css_flow_register again.");
        CommandReply.Send(command, "[FLOW] Registration key expired. Run css_flow_register again.");
    }
}
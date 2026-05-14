using CounterStrikeSharp.API.Core;
using CounterStrikeSharp.API.Modules.Memory;
using CounterStrikeSharp.API.Modules.Timers;
using FlowServer.Api;
using FlowServer.Commands;
using FlowServer.Events;
using FlowServer.Heartbeats;
using FlowServer.Inventory;
using FlowServer.Logging;
using FlowServer.Paints;
using FlowServer.Presentation;
using FlowServer.Registration;
using FlowServer.State;

namespace FlowServer;

public class FlowPlugin : BasePlugin
{
    private const string DefaultApiBaseUrl = "http://192.168.10.144:4000";

    private FlowApiClient? _apiClient;
    private FlowServerStateStore? _stateStore;
    private CancellationTokenSource? _lifetimeCts;

    private PlayerConnectionListener? _playerConnectionListener;
    private HeartbeatService? _heartbeatService;
    private RegistrationService? _registrationService;
    private CommandHandler? _commandHandler;

    private PaintApiClient? _paintApiClient;
    private PaintLoadoutStore? _paintLoadoutStore;
    private PaintApplicationService? _paintApplicationService;
    private PaintEventListener? _paintEventListener;

    public override string ModuleName => "Flow Server Plugin";
    public override string ModuleVersion => "0.0.1";
    public override string ModuleAuthor => "Sivert";
    public override string ModuleDescription => "Basic Flow server plugin";

    public override void Load(bool hotReload)
    {
        var apiBaseUrl = GetApiBaseUrl();

        _lifetimeCts = new CancellationTokenSource();

        _apiClient = new FlowApiClient(apiBaseUrl, ModuleVersion);
        _stateStore = FlowServerStateStore.FromModulePath(ModulePath);
        _stateStore.Load();

        _heartbeatService = new HeartbeatService(
            _apiClient,
            _stateStore,
            GetLifetimeToken);

        _registrationService = new RegistrationService(
            _apiClient,
            _stateStore,
            _heartbeatService,
            ModuleVersion,
            () => ModulePath,
            GetLifetimeToken);

        var infoPrinter = new InfoPrinter(
            ModuleName,
            ModuleVersion,
            ModuleAuthor,
            ModuleDescription,
            () => _apiClient?.ApiBaseUrl ?? GetApiBaseUrl(),
            () => ModulePath);

        _commandHandler = new CommandHandler(
            _stateStore,
            _registrationService,
            infoPrinter,
            () => ModulePath);

        RegisterCommands(_commandHandler.Commands);

        _playerConnectionListener = new PlayerConnectionListener();

        RegisterEventHandler<EventPlayerConnectFull>(
            _playerConnectionListener.OnPlayerConnectFull);

        _paintApiClient = new PaintApiClient();
        _paintLoadoutStore = new PaintLoadoutStore();

        _paintApplicationService = new PaintApplicationService(
            _paintLoadoutStore);

        _paintEventListener = new PaintEventListener(
            _paintApiClient,
            _paintLoadoutStore,
            _paintApplicationService,
            GetLifetimeToken);

        VirtualFunctions.GiveNamedItemFunc.Hook(
_paintEventListener.OnGiveNamedItemPost,
HookMode.Post);

        RegisterEventHandler<EventPlayerConnectFull>(
            _paintEventListener.OnPlayerConnectFull);

        RegisterEventHandler<EventPlayerDisconnect>(
            _paintEventListener.OnPlayerDisconnect);

        RegisterEventHandler<EventPlayerSpawn>(
            _paintEventListener.OnPlayerSpawn);

        RegisterListener<Listeners.OnEntityCreated>(
            _paintEventListener.OnEntityCreated);

        AddTimer(
            60.0f,
            () => _ = _heartbeatService.RecordAsync(PluginInventoryScanner.Scan(ModulePath)),
            TimerFlags.REPEAT);

        infoPrinter.PrintStartup(
            hotReload,
            apiBaseUrl,
            _stateStore.StateFilePath,
            _commandHandler.Commands);

        var inventory = PluginInventoryScanner.Scan(ModulePath);
        infoPrinter.PrintPluginInventory(inventory);

        if (_stateStore.State.Identity is not null)
        {
            PluginConsole.Success(
                $"Registered as {_stateStore.State.Identity.DisplayName} ({_stateStore.State.Identity.IpAddress}:{_stateStore.State.Identity.Port}, {_stateStore.State.Identity.ServerId}).");

            _ = _heartbeatService.RecordAsync(inventory);
            return;
        }

        var pending = _stateStore.State.PendingRegistration;

        if (pending is not null && RegistrationService.IsPendingRegistrationActive(pending))
        {
            _registrationService.ResumePendingRegistration(pending);
        }
    }

    public override void Unload(bool hotReload)
    {
        _lifetimeCts?.Cancel();
        _lifetimeCts?.Dispose();
        _lifetimeCts = null;

        _apiClient?.Dispose();
        _apiClient = null;

        _stateStore = null;
        _heartbeatService = null;
        _registrationService = null;
        _commandHandler = null;
        _playerConnectionListener = null;

        _paintApiClient = null;
        _paintLoadoutStore = null;
        _paintApplicationService = null;

        if (_paintEventListener is not null)
        {
            VirtualFunctions.GiveNamedItemFunc.Unhook(
                _paintEventListener.OnGiveNamedItemPost,
                HookMode.Post);
        }

        _paintEventListener = null;
    }

    private void RegisterCommands(IReadOnlyList<FlowCommandDefinition> commands)
    {
        foreach (var command in commands)
        {
            AddCommand(command.Name, command.Description, command.Handler);
        }
    }

    private CancellationToken GetLifetimeToken()
    {
        return _lifetimeCts?.Token ?? CancellationToken.None;
    }

    private static string GetApiBaseUrl()
    {
        var value = Environment.GetEnvironmentVariable("FLOW_API_BASE_URL");
        return string.IsNullOrWhiteSpace(value) ? DefaultApiBaseUrl : value;
    }
}
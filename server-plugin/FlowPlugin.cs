using CounterStrikeSharp.API.Core;
using CounterStrikeSharp.API.Modules.Memory;
using CounterStrikeSharp.API.Modules.Memory.DynamicFunctions;
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
using FlowServer.ServerModes;
using FlowServer.State;

namespace FlowServer;

public class FlowPlugin : BasePlugin
{
    private const string DefaultApiBaseUrl = "http://192.168.10.144:4000";
    private const float StartupInfoDelaySeconds = 2.0f;

    private FlowApiClient? _apiClient;
    private FlowServerStateStore? _stateStore;
    private CancellationTokenSource? _lifetimeCts;
    private ServerModeService? _serverModeService;

    private PlayerConnectionListener? _playerConnectionListener;
    private HeartbeatService? _heartbeatService;
    private RegistrationService? _registrationService;
    private CommandHandler? _commandHandler;
    private InfoPrinter? _infoPrinter;

    private PaintApiClient? _paintApiClient;
    private PaintLoadoutStore? _paintLoadoutStore;
    private PaintApplicationService? _paintApplicationService;
    private PaintEventListener? _paintEventListener;

    private bool _startupTasksScheduled;
    private bool _lastLoadWasHotReload;
    private string _lastApiBaseUrl = "";

    public override string ModuleName => "Flow Server Plugin";
    public override string ModuleVersion => "0.0.1";
    public override string ModuleAuthor => "Sivert";
    public override string ModuleDescription => "Basic Flow server plugin";

    public override void Load(bool hotReload)
    {
        var apiBaseUrl = GetApiBaseUrl();

        _lastLoadWasHotReload = hotReload;
        _lastApiBaseUrl = apiBaseUrl;

        _lifetimeCts = new CancellationTokenSource();

        _apiClient = new FlowApiClient(apiBaseUrl, ModuleVersion);
        _stateStore = FlowServerStateStore.FromModulePath(ModulePath);
        _stateStore.Load();

        _serverModeService = new ServerModeService(GetLifetimeToken);

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

        _infoPrinter = new InfoPrinter(
            ModuleName,
            ModuleVersion,
            ModuleAuthor,
            ModuleDescription,
            () => _apiClient?.ApiBaseUrl ?? GetApiBaseUrl(),
            () => ModulePath);

        _commandHandler = new CommandHandler(
            _stateStore,
            _registrationService,
            _infoPrinter,
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

        RegisterListener<Listeners.OnMapStart>(OnMapStart);

        AddTimer(
            60.0f,
            () =>
            {
                if (_heartbeatService is null)
                {
                    return;
                }

                _ = _heartbeatService.RecordAsync(
                    PluginInventoryScanner.Scan(ModulePath));
            },
            TimerFlags.REPEAT);

        PluginConsole.Info("FLOW plugin services initialized. Waiting for map start.");
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
        _infoPrinter = null;
        _playerConnectionListener = null;

        _serverModeService = null;

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

        _startupTasksScheduled = false;
        _lastLoadWasHotReload = false;
        _lastApiBaseUrl = "";
    }

    private void OnMapStart(string mapName)
    {
        if (_startupTasksScheduled)
        {
            return;
        }

        _startupTasksScheduled = true;

        PluginConsole.Info($"Map started: {mapName}");
        PluginConsole.Info("Scheduling FLOW startup tasks.");

        _serverModeService?.ScheduleStartupMode(_lastLoadWasHotReload, mapName);

        AddTimer(
            StartupInfoDelaySeconds,
            () =>
            {
                if (_stateStore is null ||
                    _heartbeatService is null ||
                    _registrationService is null ||
                    _commandHandler is null ||
                    _infoPrinter is null)
                {
                    PluginConsole.Error("Startup info skipped because plugin services are not ready.");
                    return;
                }

                PluginConsole.Logo();

                _infoPrinter.PrintStartup(
                    _lastLoadWasHotReload,
                    _lastApiBaseUrl,
                    _stateStore.StateFilePath,
                    _commandHandler.Commands);

                var inventory = PluginInventoryScanner.Scan(ModulePath);
                _infoPrinter.PrintPluginInventory(inventory);

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
            });
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
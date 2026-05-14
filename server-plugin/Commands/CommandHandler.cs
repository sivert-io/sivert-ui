using CounterStrikeSharp.API.Core;
using CounterStrikeSharp.API.Modules.Commands;
using FlowServer.Inventory;
using FlowServer.Presentation;
using FlowServer.Registration;
using FlowServer.State;
using FlowServer.Utilities;

namespace FlowServer.Commands;

public sealed class CommandHandler
{
    private const string InfoCommand = "css_flow";
    private const string RegistrationCommand = "css_flow_register";
    private const string SecurityCommand = "css_flow_security";

    private readonly FlowServerStateStore _stateStore;
    private readonly RegistrationService _registrationService;
    private readonly InfoPrinter _infoPrinter;
    private readonly Func<string> _getModulePath;

    public CommandHandler(
        FlowServerStateStore stateStore,
        RegistrationService registrationService,
        InfoPrinter infoPrinter,
        Func<string> getModulePath)
    {
        _stateStore = stateStore;
        _registrationService = registrationService;
        _infoPrinter = infoPrinter;
        _getModulePath = getModulePath;

        Commands = new[]
        {
            new FlowCommandDefinition(
                InfoCommand,
                "Displays FLOW plugin info and available commands.",
                OnInfoCommand),

            new FlowCommandDefinition(
                RegistrationCommand,
                "Generates a FLOW server registration key.",
                OnRegisterCommand),

            new FlowCommandDefinition(
                SecurityCommand,
                "Checks whether FLOW is the only CounterStrikeSharp plugin present.",
                OnSecurityCommand),
        };
    }

    public IReadOnlyList<FlowCommandDefinition> Commands { get; }

    private void OnInfoCommand(CCSPlayerController? player, CommandInfo command)
    {
        if (RejectPlayerCommand(player, command))
        {
            return;
        }

        _infoPrinter.PrintInfo(_stateStore.State, Commands);
    }

    private void OnRegisterCommand(CCSPlayerController? player, CommandInfo command)
    {
        if (RejectPlayerCommand(player, command))
        {
            return;
        }

        if (_stateStore.State.Identity is not null)
        {
            command.ReplyToCommand(
                $"[FLOW] Server already registered as {_stateStore.State.Identity.DisplayName}.");
            command.ReplyToCommand($"[FLOW] Server ID: {_stateStore.State.Identity.ServerId}");
            return;
        }

        if (_registrationService.IsRegistrationRequestInFlight)
        {
            command.ReplyToCommand("[FLOW] Registration key request already in progress.");
            return;
        }

        if (RegistrationService.IsPendingRegistrationActive(_stateStore.State.PendingRegistration))
        {
            var pending = _stateStore.State.PendingRegistration!;

            command.ReplyToCommand($"[FLOW] Existing registration key: {pending.RegistrationKey}");
            command.ReplyToCommand(
                $"[FLOW] Paste it into the FLOW web app. Expires at {TimeFormatter.Format(pending.ExpiresAt)}.");

            _registrationService.ResumePendingRegistration(pending, command);
            return;
        }

        command.ReplyToCommand("[FLOW] Requesting a registration key...");
        _registrationService.CreateAndPrintRegistrationKey(command);
    }

    private void OnSecurityCommand(CCSPlayerController? player, CommandInfo command)
    {
        if (RejectPlayerCommand(player, command))
        {
            return;
        }

        var inventory = PluginInventoryScanner.Scan(_getModulePath());

        _infoPrinter.PrintPluginInventory(inventory);

        if (inventory.IsCompliant)
        {
            command.ReplyToCommand("[FLOW] Plugin policy OK: FLOW is the only plugin found.");
            return;
        }

        command.ReplyToCommand(
            $"[FLOW] Plugin policy violation: found {inventory.DisallowedPluginCount} other plugin(s).");

        foreach (var plugin in inventory.DisallowedPlugins)
        {
            command.ReplyToCommand($"[FLOW] Disallowed plugin: {plugin.Name}");
        }
    }

    private static bool RejectPlayerCommand(CCSPlayerController? player, CommandInfo command)
    {
        if (player is null)
        {
            return false;
        }

        command.ReplyToCommand("[FLOW] Run this command from the server console or RCON.");
        return true;
    }
}
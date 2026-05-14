using FlowServer.Commands;
using FlowServer.Inventory;
using FlowServer.Logging;
using FlowServer.State;
using FlowServer.Utilities;

namespace FlowServer.Presentation;

public sealed class InfoPrinter
{
    private readonly string _moduleName;
    private readonly string _moduleVersion;
    private readonly string _moduleAuthor;
    private readonly string _moduleDescription;
    private readonly Func<string> _getApiBaseUrl;
    private readonly Func<string> _getModulePath;

    public InfoPrinter(
        string moduleName,
        string moduleVersion,
        string moduleAuthor,
        string moduleDescription,
        Func<string> getApiBaseUrl,
        Func<string> getModulePath)
    {
        _moduleName = moduleName;
        _moduleVersion = moduleVersion;
        _moduleAuthor = moduleAuthor;
        _moduleDescription = moduleDescription;
        _getApiBaseUrl = getApiBaseUrl;
        _getModulePath = getModulePath;
    }

    public void PrintStartup(
        bool hotReload,
        string apiBaseUrl,
        string stateFilePath,
        IReadOnlyList<FlowCommandDefinition> commands)
    {
        PluginConsole.Line();
        PluginConsole.Info("Plugin loaded!");
        PluginConsole.Info($"Name: {_moduleName}");
        PluginConsole.Info($"Version: {_moduleVersion}");
        PluginConsole.Info($"Author: {_moduleAuthor}");
        PluginConsole.Info($"Hot reload: {hotReload}");
        PluginConsole.Info($"API base URL: {apiBaseUrl}");
        PluginConsole.Info($"State file: {stateFilePath}");
        PluginConsole.Code("Main command", "css_flow");
        PluginConsole.Line();

        PrintAvailableCommands(commands);
    }

    public void PrintInfo(
        ServerState state,
        IReadOnlyList<FlowCommandDefinition> commands)
    {
        PluginConsole.Line();
        PluginConsole.Info(_moduleName);
        PluginConsole.Info($"Version: {_moduleVersion}");
        PluginConsole.Info($"Author: {_moduleAuthor}");
        PluginConsole.Info($"Description: {_moduleDescription}");
        PluginConsole.Info($"API base URL: {_getApiBaseUrl()}");

        if (state.Identity is not null)
        {
            var identity = state.Identity;

            PluginConsole.Success("Registration: registered");
            PluginConsole.Info($"Server: {identity.DisplayName}");
            PluginConsole.Info($"Server ID: {identity.ServerId}");
            PluginConsole.Info($"Address: {identity.IpAddress}:{identity.Port}");
            PluginConsole.Info($"Registered at: {TimeFormatter.Format(identity.RegisteredAt)}");
        }
        else if (Registration.RegistrationService.IsPendingRegistrationActive(state.PendingRegistration))
        {
            var pending = state.PendingRegistration!;

            PluginConsole.Info("Registration: pending");
            PluginConsole.Code("Registration key", pending.RegistrationKey);
            PluginConsole.Info($"Expires at: {TimeFormatter.Format(pending.ExpiresAt)}");
        }
        else
        {
            PluginConsole.Info("Registration: not registered");
        }

        PrintAvailableCommands(commands);
        PluginConsole.Line();
    }

    public void PrintPluginInventory(PluginInventory inventory)
    {
        if (inventory.IsCompliant)
        {
            PluginConsole.Success("Plugin policy OK: no other plugins found.");
            return;
        }

        PluginConsole.Error(
            $"Plugin policy violation: {inventory.DisallowedPluginCount} other plugin(s) found.");

        foreach (var plugin in inventory.DisallowedPlugins)
        {
            PluginConsole.Error($"Disallowed plugin: {plugin.Name} ({plugin.Path})");
        }
    }

    private static void PrintAvailableCommands(IReadOnlyList<FlowCommandDefinition> commands)
    {
        PluginConsole.Info("Available commands:");

        foreach (var command in commands)
        {
            PluginConsole.Code(command.Name, command.Description);
        }
    }
}
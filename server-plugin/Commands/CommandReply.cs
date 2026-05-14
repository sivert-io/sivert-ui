using CounterStrikeSharp.API;
using CounterStrikeSharp.API.Modules.Commands;
using FlowServer.Logging;

namespace FlowServer.Commands;

public static class CommandReply
{
    public static void Send(CommandInfo? command, string message)
    {
        if (command is null)
        {
            PluginConsole.Info(message.Replace("[FLOW] ", ""));
            return;
        }

        Server.NextWorldUpdate(() =>
        {
            command.ReplyToCommand(message);
        });
    }
}
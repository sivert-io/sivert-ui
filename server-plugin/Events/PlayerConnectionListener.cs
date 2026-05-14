using CounterStrikeSharp.API.Core;
using FlowServer.Logging;

namespace FlowServer.Events;

public sealed class PlayerConnectionListener
{
    public HookResult OnPlayerConnectFull(EventPlayerConnectFull @event, GameEventInfo info)
    {
        var player = @event.Userid;

        if (player is null || !player.IsValid)
        {
            return HookResult.Continue;
        }

        PluginConsole.Info($"Player connected: {player.PlayerName}");

        return HookResult.Continue;
    }
}
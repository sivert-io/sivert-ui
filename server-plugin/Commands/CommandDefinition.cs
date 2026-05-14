using CounterStrikeSharp.API.Modules.Commands;

namespace FlowServer.Commands;

public sealed record FlowCommandDefinition(
    string Name,
    string Description,
    CommandInfo.CommandCallback Handler);
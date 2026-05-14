using System.Collections.Concurrent;
using CounterStrikeSharp.API.Core;

namespace FlowServer.Paints;

public sealed class PaintLoadoutStore
{
    private readonly ConcurrentDictionary<int, PlayerPaintLoadout> _loadoutsBySlot = new();

    public void Set(CCSPlayerController player, PlayerPaintLoadout loadout)
    {
        _loadoutsBySlot[player.Slot] = loadout;
    }

    public bool TryGet(CCSPlayerController player, out PlayerPaintLoadout loadout)
    {
        return _loadoutsBySlot.TryGetValue(player.Slot, out loadout!);
    }

    public void Remove(CCSPlayerController player)
    {
        _loadoutsBySlot.TryRemove(player.Slot, out _);
    }

    public void RemoveBySlot(int slot)
    {
        _loadoutsBySlot.TryRemove(slot, out _);
    }
}
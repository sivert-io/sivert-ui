using System.Text.Json;

namespace FlowServer.State;

public sealed class FlowServerStateStore
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
    };

    public FlowServerStateStore(string stateFilePath)
    {
        StateFilePath = stateFilePath;
    }

    public string StateFilePath { get; }

    public ServerState State { get; private set; } = new();

    public static FlowServerStateStore FromModulePath(string modulePath)
    {
        var pluginDirectory =
            Path.GetDirectoryName(modulePath) ?? AppContext.BaseDirectory;

        var stateFilePath = Path.Combine(pluginDirectory, "flow-server.json");

        return new FlowServerStateStore(stateFilePath);
    }

    public void Load()
    {
        if (!File.Exists(StateFilePath))
        {
            State = new ServerState();
            return;
        }

        var json = File.ReadAllText(StateFilePath);

        State = JsonSerializer.Deserialize<ServerState>(json, JsonOptions)
                ?? new ServerState();
    }

    public void Save()
    {
        var directory = Path.GetDirectoryName(StateFilePath);

        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        var json = JsonSerializer.Serialize(State, JsonOptions);
        File.WriteAllText(StateFilePath, json);
    }

    public void SetPendingRegistration(PendingRegistration pendingRegistration)
    {
        State.PendingRegistration = pendingRegistration;
        Save();
    }

    public void ClearPendingRegistration()
    {
        State.PendingRegistration = null;
        Save();
    }

    public void SetIdentity(ServerIdentity identity)
    {
        State.Identity = identity;
        State.PendingRegistration = null;
        Save();
    }
}
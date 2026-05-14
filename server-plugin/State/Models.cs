namespace FlowServer.State;

public sealed class ServerState
{
    public ServerIdentity? Identity { get; set; }

    public PendingRegistration? PendingRegistration { get; set; }
}

public sealed class ServerIdentity
{
    public string ServerId { get; set; } = "";

    public string Token { get; set; } = "";

    public string DisplayName { get; set; } = "";

    public string IpAddress { get; set; } = "";

    public int Port { get; set; }

    public string ApiBaseUrl { get; set; } = "";

    public string PluginVersion { get; set; } = "";

    public DateTimeOffset RegisteredAt { get; set; }
}

public sealed class PendingRegistration
{
    public string RegistrationKey { get; set; } = "";

    public string PollToken { get; set; } = "";

    public DateTimeOffset ExpiresAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
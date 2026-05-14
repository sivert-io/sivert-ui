namespace FlowServer.Api;

public sealed record RegistrationKeyResponse(
    string RegistrationKey,
    string PollToken,
    DateTimeOffset ExpiresAt);

public sealed record RegistrationStatusResponse(
    string Status,
    DateTimeOffset ExpiresAt,
    RegisteredServerResponse? Server);

public sealed record RegisteredServerResponse(
    string Id,
    string DisplayName,
    string IpAddress,
    int Port,
    string Token);
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FlowServer.Inventory;
using FlowServer.State;

namespace FlowServer.Api;

public sealed class FlowApiClient : IDisposable
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    private readonly HttpClient _httpClient;
    private readonly string _pluginVersion;

    public FlowApiClient(string apiBaseUrl, string pluginVersion)
    {
        _pluginVersion = pluginVersion;

        _httpClient = new HttpClient
        {
            BaseAddress = new Uri(apiBaseUrl.TrimEnd('/') + "/"),
            Timeout = TimeSpan.FromSeconds(10),
        };

        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd($"FlowServerPlugin/{pluginVersion}");
    }

    public string ApiBaseUrl => _httpClient.BaseAddress?.ToString().TrimEnd('/') ?? "";

    public async Task<RegistrationKeyResponse> CreateRegistrationKeyAsync(
        CancellationToken cancellationToken = default)
    {
        var path =
            $"hosts/plugin/registration-key?pluginVersion={Uri.EscapeDataString(_pluginVersion)}";

        using var response = await _httpClient.GetAsync(path, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new FlowApiException(
                $"FLOW API returned {(int)response.StatusCode}: {responseBody}");
        }

        var registration = JsonSerializer.Deserialize<RegistrationKeyResponse>(
            responseBody,
            JsonOptions);

        if (registration is null ||
            string.IsNullOrWhiteSpace(registration.RegistrationKey) ||
            string.IsNullOrWhiteSpace(registration.PollToken))
        {
            throw new FlowApiException("FLOW API returned an invalid registration key response.");
        }

        return registration;
    }

    public async Task<RegistrationStatusResponse> GetRegistrationStatusAsync(
        string registrationKey,
        string pollToken,
        CancellationToken cancellationToken = default)
    {
        var path =
            "hosts/plugin/registration-key/status" +
            $"?registrationKey={Uri.EscapeDataString(registrationKey)}" +
            $"&pollToken={Uri.EscapeDataString(pollToken)}";

        using var response = await _httpClient.GetAsync(path, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new FlowApiException(
                $"FLOW API returned {(int)response.StatusCode}: {responseBody}");
        }

        var registrationStatus = JsonSerializer.Deserialize<RegistrationStatusResponse>(
            responseBody,
            JsonOptions);

        if (registrationStatus is null || string.IsNullOrWhiteSpace(registrationStatus.Status))
        {
            throw new FlowApiException("FLOW API returned an invalid registration status response.");
        }

        return registrationStatus;
    }

    public async Task RecordHeartbeatAsync(
        ServerIdentity identity,
        PluginInventory pluginInventory,
        CancellationToken cancellationToken = default)
    {
        var body = new
        {
            serverId = identity.ServerId,
            token = identity.Token,
            pluginVersion = _pluginVersion,
            status = "online",
            payload = new
            {
                identity = new
                {
                    serverId = identity.ServerId,
                    ipAddress = identity.IpAddress,
                    port = identity.Port,
                },
                pluginInventory,
            },
        };

        using var response = await _httpClient.PostAsJsonAsync(
            "hosts/heartbeat",
            body,
            JsonOptions,
            cancellationToken);

        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            throw new FlowServerNotFoundException(
                $"FLOW API says this server no longer exists: {responseBody}");
        }

        if (!response.IsSuccessStatusCode)
        {
            throw new FlowApiException(
                $"FLOW API returned {(int)response.StatusCode}: {responseBody}");
        }
    }

    public void Dispose()
    {
        _httpClient.Dispose();
    }
}
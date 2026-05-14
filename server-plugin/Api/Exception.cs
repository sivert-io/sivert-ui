namespace FlowServer.Api;

public sealed class FlowApiException : Exception
{
    public FlowApiException(string message) : base(message)
    {
    }
}
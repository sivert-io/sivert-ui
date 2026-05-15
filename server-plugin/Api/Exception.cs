namespace FlowServer.Api;

public class FlowApiException : Exception
{
    public FlowApiException(string message) : base(message)
    {
    }
}

public sealed class FlowServerNotFoundException : FlowApiException
{
    public FlowServerNotFoundException(string message) : base(message)
    {
    }
}
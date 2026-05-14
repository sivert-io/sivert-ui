namespace FlowServer.Utilities;

public static class TimeFormatter
{
    public static string Format(DateTimeOffset value)
    {
        return value.ToLocalTime().ToString("yyyy-MM-dd HH:mm:ss zzz");
    }
}
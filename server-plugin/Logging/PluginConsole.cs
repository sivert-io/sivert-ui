namespace FlowServer.Logging;

public static class PluginConsole
{
    public static ConsoleColor FlowColor { get; set; } = ConsoleColor.Magenta;
    public static ConsoleColor TextColor { get; set; } = ConsoleColor.Gray;
    public static ConsoleColor CodeColor { get; set; } = ConsoleColor.Yellow;
    public static ConsoleColor ErrorColor { get; set; } = ConsoleColor.Red;
    public static ConsoleColor SuccessColor { get; set; } = ConsoleColor.Green;

    public static void Info(string message)
    {
        WritePrefix();
        WriteLine(message, TextColor);
    }

    public static void Success(string message)
    {
        WritePrefix();
        WriteLine(message, SuccessColor);
    }

    public static void Error(string message)
    {
        WritePrefix();
        WriteLine(message, ErrorColor);
    }

    public static void Code(string label, string code)
    {
        WritePrefix();

        var originalColor = System.Console.ForegroundColor;

        System.Console.ForegroundColor = TextColor;
        System.Console.Write($"{label}: ");

        System.Console.ForegroundColor = CodeColor;
        System.Console.WriteLine(code);

        System.Console.ForegroundColor = originalColor;
    }

    public static void Line()
    {
        var originalColor = System.Console.ForegroundColor;
        System.Console.ForegroundColor = FlowColor;
        System.Console.WriteLine("========================================");
        System.Console.ForegroundColor = originalColor;
    }

    public static void Header(string message)
    {
        Line();
        Info(message);
        Line();
    }

    private static void WritePrefix()
    {
        var originalColor = System.Console.ForegroundColor;

        System.Console.ForegroundColor = FlowColor;
        System.Console.Write("[FLOW] ");

        System.Console.ForegroundColor = originalColor;
    }

    private static void WriteLine(string message, ConsoleColor color)
    {
        var originalColor = System.Console.ForegroundColor;

        System.Console.ForegroundColor = color;
        System.Console.WriteLine(message);

        System.Console.ForegroundColor = originalColor;
    }

    public static void Logo()
    {
        var originalColor = System.Console.ForegroundColor;

        System.Console.ForegroundColor = FlowColor;

        System.Console.WriteLine("""


███████╗██╗      ██████╗ ██╗    ██╗
██╔════╝██║     ██╔═══██╗██║    ██║
█████╗  ██║     ██║   ██║██║ █╗ ██║
██╔══╝  ██║     ██║   ██║██║███╗██║
██║     ███████╗╚██████╔╝╚███╔███╔╝
╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝


""");

        System.Console.ForegroundColor = originalColor;
    }
}
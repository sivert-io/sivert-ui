# FLOW Server Plugin

CounterStrikeSharp plugin for FLOW verified CS2 servers.

The plugin is responsible for registering a CS2 server with the FLOW platform, storing server identity, sending heartbeats, and helping verify that the server is running in a trusted state.

## Requirements

- .NET SDK
- CounterStrikeSharp server setup
- A running CS2 dedicated server
- Access to the FLOW API
- WinSCP or another way to sync files to the server

## Development

From the `server-plugin/` directory:

```bash
dotnet restore
dotnet build
```

For active development, use:

```bash
dotnet watch build
```

This rebuilds the plugin whenever files change.

## Configuration

The plugin reads the FLOW API URL from the `FLOW_API_BASE_URL` environment variable.

Example:

```bash
FLOW_API_BASE_URL="http://192.168.10.144:4000"
```

If no environment variable is set, the plugin uses the default API URL configured in `FlowPlugin.cs`.

When running through `sudo`, pass the variable directly:

```bash
sudo FLOW_API_BASE_URL="http://192.168.10.144:4000" csm debug 1
```

## Deploying to a server

Build the plugin:

```bash
dotnet build
```

Then copy the compiled plugin output to the CS2 server plugin directory.

Example target path:

```text
/home/cs2servermanager/server-1/game/csgo/addons/counterstrikesharp/plugins/FlowServer/
```

Using WinSCP, sync the local build output into that folder.

Typical local output path:

```text
server-plugin/bin/Debug/net8.0/
```

or for release builds:

```text
server-plugin/bin/Release/net8.0/
```

Make sure the server folder contains the plugin DLL and any required dependency files.

## Recommended WinSCP workflow

1. Run `dotnet watch build` locally.
2. Open WinSCP.
3. Connect to the Linux server.
4. Navigate to the FLOW plugin folder:

```text
/home/cs2servermanager/server-1/game/csgo/addons/counterstrikesharp/plugins/FlowServer/
```

5. Sync the build output from:

```text
server-plugin/bin/Debug/net8.0/
```

6. Restart or reload the CS2 server.

## Running the server

Start the server through your CS2 server manager.

Example:

```bash
sudo FLOW_API_BASE_URL="http://192.168.10.144:4000" csm debug 1
```

## Plugin commands

Run these from the server console or RCON.

| Command             | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `css_flow`          | Shows plugin info and available commands                          |
| `css_flow_register` | Generates a FLOW server registration key                          |
| `css_flow_security` | Checks whether FLOW is the only CounterStrikeSharp plugin present |

## Registering a server

1. Start the CS2 server with the plugin installed.
2. Run:

```text
css_flow_register
```

3. Copy the generated registration key.
4. Paste it into the FLOW web app.
5. The plugin will poll the API until the key is claimed.
6. Once claimed, the server identity is saved locally.

The identity file is saved next to the plugin as:

```text
flow-server.json
```

Do not commit this file.

## Checking plugin state

Run:

```text
css_flow
```

This prints:

- Plugin name
- Version
- Author
- API base URL
- Registration state
- Server identity, if registered
- Available commands

## Checking plugin compliance

Run:

```text
css_flow_security
```

This checks whether other CounterStrikeSharp plugins are present.

Official FLOW servers should not run unapproved gameplay-affecting plugins during official matches.

## Notes

The plugin is still early.

Current responsibilities:

- Server registration
- Server identity storage
- Heartbeats
- Basic plugin compliance checks
- Developer-friendly console output

Future responsibilities may include:

- Match assignment
- Match state reporting
- Player verification
- Server performance reporting
- Moderation events
- Cosmetic integration

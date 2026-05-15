# Server hosting

FLOW is based on community-run servers.

The community provides the CS2 servers. FLOW provides the platform, verification system, matchmaking, and server plugin.

## Official FLOW servers

A server can become part of the official FLOW matchmaking pool if it passes verification.

A verified server should:

- Run the FLOW server plugin.
- Identify itself to the FLOW platform.
- Send regular heartbeat data.
- Report health and compliance data.
- Run the expected server configuration.
- Avoid unsupported or unapproved plugins.
- Meet minimum performance requirements.

The goal is to let the community provide server capacity without making official matches untrusted.

## Server plugin

Official FLOW servers must run the FLOW server plugin.

The plugin is responsible for:

- Registering the server with the FLOW platform.
- Saving server identity.
- Sending heartbeats.
- Reporting plugin compliance.
- Helping verify that the server is trusted.
- Supporting future match and moderation features.

Current commands:

| Command             | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `css_flow`          | Shows plugin info and available commands                          |
| `css_flow_register` | Generates a FLOW server registration key                          |
| `css_flow_security` | Checks whether FLOW is the only CounterStrikeSharp plugin present |

## Registration

A server host registers their server by running the FLOW plugin and generating a registration key.

Basic flow:

1. Start the CS2 server with the FLOW plugin installed.
2. Run `css_flow_register` in the server console or RCON.
3. Copy the generated registration key.
4. Paste the key into the FLOW web app.
5. The platform claims the key and assigns the server an identity.
6. The plugin stores the identity locally.
7. The server can start sending heartbeats and become eligible for verification.

## Server identity

After registration, the server receives an identity.

The identity includes things like:

- Server ID
- Server display name
- Server token
- IP address
- Port
- Plugin version
- Registration time

The identity is saved by the plugin and used when the server talks to the FLOW API.

## Verification

A server should not instantly become official just because it registered.

Verification should consider:

- Whether the plugin is installed correctly.
- Whether the server is running the expected setup.
- Whether the server is reachable.
- Whether the server has stable performance.
- Whether the server has suspicious plugins.
- Whether matches can complete normally.
- Whether players have good latency to it.

## Server rating

FLOW should continuously rate servers.

Possible rating factors:

| Metric           | Description                                           |
| ---------------- | ----------------------------------------------------- |
| Latency          | Average and median player ping                        |
| Stability        | Server performance during matches                     |
| Uptime           | How often the server is available                     |
| Match success    | How often matches finish without server-side issues   |
| Region value     | Whether the server helps cover a needed region        |
| Trust/compliance | Whether the server is running the required FLOW setup |
| Player feedback  | Whether players report server-side issues             |

Good servers should naturally get used more often.

Poor servers should be used less, earn less, or be removed from the official pool.

## Host rewards

Server hosts can earn credits when official FLOW matches are played on their servers.

The reward depends on server quality.

| Server result                       |  Credits |
| ----------------------------------- | -------: |
| Completed match hosted              |       40 |
| Excellent performance bonus         |      +25 |
| Good performance bonus              |      +10 |
| Needed region bonus                 |      +20 |
| Low-latency lobby bonus             |      +15 |
| Match cancelled due to server issue |     -100 |
| Severe server issue during match    |      -50 |
| Plugin compliance failure           | 0 reward |

## Server quality multiplier

| Server quality | Reward multiplier |
| -------------- | ----------------: |
| Excellent      |              1.5x |
| Good           |              1.2x |
| Average        |              1.0x |
| Poor           |              0.5x |
| Untrusted      |                0x |

Example:

A completed match on an excellent server:

`40 base credits x 1.5 = 60 credits`

If the server also gets a needed region bonus:

`60 + 20 = 80 credits`

The goal is to reward people who provide real value to the platform.

If someone provides excellent servers, they should be able to earn a meaningful amount of credits.

## Plugin compliance

FLOW should know what plugins are running on a server.

Official FLOW servers should not be allowed to run random gameplay-affecting plugins during official matches.

The FLOW plugin can scan the CounterStrikeSharp plugin directory and report whether other plugins are present.

This is not perfect security by itself, but it is part of the trust system.

## Regions

FLOW should support community servers in different regions.

A server in a region with low capacity may be more valuable than another server in an already-covered region.

Possible region reward factors:

- Number of active players in the region
- Number of available verified servers
- Average queue time
- Average player latency
- Time of day

This can help FLOW reward hosts who provide servers where they are actually needed.

## Removal from the pool

A server may be removed from the official matchmaking pool if it:

- Stops sending heartbeats.
- Fails verification.
- Has poor performance.
- Causes match failures.
- Runs disallowed plugins.
- Receives repeated valid player complaints.
- Abuses the reward system.

Server hosting should be open, but official matches need to stay trusted.

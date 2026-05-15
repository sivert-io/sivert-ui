<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="web/public/logo_white.svg">
    <source media="(prefers-color-scheme: light)" srcset="web/public/logo_black.svg">
    <img src="web/public/logo_black.svg" alt="FLOW" width="320">
  </picture>
</p>

<p align="center">
  A CS2 community-run matchmaking platform.
</p>

> The repository name may change later. The project itself is called FLOW.

FLOW is a CS2 community-run matchmaking platform.

The idea is simple: instead of one central company owning all the servers and rules, the community can run verified servers that become part of the official FLOW matchmaking pool.

FLOW provides the web platform, matchmaking, player profiles, credits, cosmetics, server verification, and moderation tools. The community provides the game servers.

It is basically an open source FACEIT-style platform, but with a stronger focus on community ownership and community-run infrastructure.

## What FLOW is

FLOW is built around a few core ideas:

- Community members can host CS2 servers.
- Verified servers can be used for official FLOW matches.
- Players earn credits by playing, winning, getting positive reputation, and contributing to the platform.
- Server hosts earn credits when matches are played on their servers.
- Better servers should earn more than poor servers.
- Credits can be spent on FLOW-exclusive cosmetics, skin packs, clans, clan battles, tournaments, and other platform features.
- The project is open source, so anyone can fork it and build their own version with their own rules.

FLOW is not trying to replace Steam inventories or create tradeable items. Cosmetics on FLOW are platform access items. You do not own or trade them like Steam skins. You unlock access to them while using the FLOW platform.

## Project structure

| Path             | Description                                                       |
| ---------------- | ----------------------------------------------------------------- |
| `web/`           | The FLOW web app                                                  |
| `api/`           | The backend API                                                   |
| `server-plugin/` | The CounterStrikeSharp server plugin used by verified CS2 servers |
| `docs/`          | Notes and design documents for FLOW systems                       |

## Docs

| Document                                           | Description                                    |
| -------------------------------------------------- | ---------------------------------------------- |
| [`docs/credits.md`](docs/credits.md)               | Credit rewards, penalties, and spending        |
| [`docs/server-hosting.md`](docs/server-hosting.md) | Community server hosting and verification      |
| [`docs/cosmetics.md`](docs/cosmetics.md)           | FLOW cosmetics, skin packs, and cosmetic rules |
| [`docs/moderation.md`](docs/moderation.md)         | Reports, fines, bans, and platform behavior    |
| [`docs/clans.md`](docs/clans.md)                   | Clans, clan banks, and clan battles            |
| [`docs/tournaments.md`](docs/tournaments.md)       | Tournaments, entry fees, and prizes            |

## Community-run servers

FLOW servers are run by the community.

To become part of the official matchmaking pool, a server needs to run the FLOW server plugin and pass verification. The plugin is used to identify the server, report health data, enforce platform rules, and make sure the server is running in a trusted state.

The goal is to make it possible for anyone with good infrastructure to contribute real server capacity to the platform.

Server quality matters. FLOW should be able to rate servers based on things like:

- Player latency
- Server performance
- Tick stability
- Packet loss
- Uptime
- Region coverage
- Match completion rate
- Plugin compliance
- Reports from players

A server with low latency, good performance, and reliable uptime should be rewarded more than a server that performs poorly.

## Credits

Credits are the internal FLOW platform currency.

They are earned by participating in the platform and can be spent on FLOW cosmetics and other platform features.

Credits are not intended to be a real-money currency. They are meant to reward useful activity inside the FLOW ecosystem.

More details are in [`docs/credits.md`](docs/credits.md).

## Cosmetics

FLOW cosmetics are exclusive to the FLOW platform.

They are not Steam items. They are not tradeable. They are not owned outside the platform. They are access-based cosmetics that work while playing on FLOW.

Possible cosmetics include:

- Custom knife skins
- Custom weapon skins
- Skin packs
- Gloves
- Player models
- MVP effects
- Profile cosmetics
- Badges
- Nameplate styles
- Match intro effects
- Server host badges
- Seasonal cosmetics
- Clan cosmetics
- Tournament cosmetics

Some cosmetics may be created specifically for FLOW. For example, knife skins or weapon skins that do not exist in CS2.

Community-made cosmetics may also be added later, but that has not been decided yet.

More details are in [`docs/cosmetics.md`](docs/cosmetics.md).

## Clans and tournaments

FLOW should support clans, clan battles, and tournaments.

Players can spend credits to create clans, build clan identity, challenge other clans, and enter tournaments.

Tournaments can be played by clans or ad-hoc teams. Prizes can include credits, exclusive cosmetics, badges, trophies, or other platform rewards.

More details are in [`docs/clans.md`](docs/clans.md) and [`docs/tournaments.md`](docs/tournaments.md).

## Open source

FLOW is open source.

You can fork the repo and build your own version of the platform.

That means you can change:

- Matchmaking rules
- Credit rewards
- Server requirements
- Moderation rules
- Cosmetic systems
- Regions
- Ranking systems
- Queue types
- Platform branding

The main FLOW platform has its own rules and official server pool, but the code is open so other communities can run their own version if they want.

## Current status

FLOW is still early.

The current focus is on:

- Building the web platform
- Building the server plugin
- Registering and verifying game servers
- Tracking server identity
- Tracking server health
- Designing the credit economy
- Designing the cosmetics system
- Creating a fair way to reward players and server hosts
- Planning clans, clan battles, and tournaments

The credit numbers in the docs are draft values. They should be tested and adjusted before the economy is treated as final.

## Server plugin

Official FLOW servers must run the FLOW server plugin.

The plugin is responsible for:

- Registering the server with the FLOW platform
- Saving server identity
- Sending heartbeat data
- Reporting plugin compliance
- Helping verify that the server is trusted
- Supporting future match and moderation features

Example commands:

| Command             | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `css_flow`          | Shows plugin info and available commands                          |
| `css_flow_register` | Generates a FLOW server registration key                          |
| `css_flow_security` | Checks whether FLOW is the only CounterStrikeSharp plugin present |

More details are in [`docs/server-hosting.md`](docs/server-hosting.md).

## Philosophy

FLOW should reward the people who make the platform better.

Players who play matches, behave well, and help create good games should earn credits.

Server hosts who provide stable, low-latency servers should earn credits.

Toxic players, griefers, and people who waste other players' time should lose credits or be removed from matchmaking.

The platform should be open enough that communities can adapt it, but strict enough that official FLOW matches stay fair and trusted.

## License

MIT

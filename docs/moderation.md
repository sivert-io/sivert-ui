# Moderation

FLOW needs moderation because official matches should be fair and playable.

The goal is not to punish every mistake. The goal is to reduce toxic behavior, griefing, match abandonment, and abuse of the platform.

## Goals

Moderation should:

- Protect matches from griefing.
- Reduce toxic behavior.
- Punish repeated bad behavior.
- Avoid punishing normal frustration too harshly.
- Make reports useful.
- Prevent abuse of the reputation system.
- Prevent abuse of the credit system.
- Keep official matches trusted.

## Reports

Players should be able to report others after a match.

Possible report reasons:

- Toxic behavior
- Griefing
- AFK
- Voice abuse
- Text abuse
- Cheating suspicion
- Throwing
- Match abandonment
- Reputation abuse
- Credit farming
- Server abuse

Reports should probably be weighted by trust.

A player with a history of false reports should have less report weight.

## Credit fines

Bad behavior can lead to credit fines.

| Behavior                 | Penalty |
| ------------------------ | ------: |
| Abandon match            |     -75 |
| Repeated AFK             |     -50 |
| Confirmed toxic behavior |     -50 |
| Severe toxic behavior    |    -150 |
| Griefing                 |    -150 |
| Match throwing           |    -200 |
| False reports            |     -50 |
| Reputation abuse         |    -100 |
| Cheating / severe abuse  |     Ban |

The point of fines is to make bad behavior cost something.

## Negative credit balance

If a player cannot pay a fine, their credit balance may go negative.

| Credit state     | Result                                                |
| ---------------- | ----------------------------------------------------- |
| `0` or above     | Player can queue normally                             |
| `-1` to `-99`    | Warning shown before queueing                         |
| `-100` to `-249` | Restricted from ranked, clan, and tournament matches  |
| `-250` or lower  | Matchmaking ban until reviewed or balance is restored |

This creates a simple system:

If you keep damaging the platform, you eventually lose access.

## Bans

Bans can be temporary or permanent.

Possible ban reasons:

- Repeated griefing
- Severe toxicity
- Match manipulation
- Cheating
- Ban evasion
- Server abuse
- Reputation farming
- Credit farming
- Exploiting the credit system

Bans should be logged with a reason and duration.

## Reputation abuse

Reputation is useful, but it can be abused.

Possible abuse cases:

- Friends farming +rep
- Groups mass-reporting players
- Players trading +rep
- Players using alt accounts
- Retaliation reports

Possible protections:

- Limit +rep per day.
- Reduce repeated +rep value between the same players.
- Ignore suspicious reputation clusters.
- Penalize false reports.
- Weight reports by player trust.
- Require match participation before reputation can be given.

## Credit abuse

The credit system can also be abused.

Possible abuse cases:

- Farming matches
- Farming +rep
- Farming server rewards
- Creating fake or low-effort matches
- Abusing low-population bonuses
- Abusing needed-region bonuses
- Farming clan battles
- Farming tournament participation rewards

Possible protections:

- Require completed matches.
- Detect repeated player groups.
- Detect abnormal server reward patterns.
- Limit daily bonuses.
- Reduce rewards from suspicious matches.
- Review high-earning accounts and servers.
- Log all clan bank transactions.

## Server host abuse

Server hosts should also be moderated.

Possible abuse cases:

- Hosting poor servers for credits
- Manipulating matches
- Running disallowed plugins
- Faking heartbeat data
- Creating fake matches
- Farming server rewards
- Kicking players unfairly
- Using server access to gain advantage

Server hosts can lose rewards, lose verification, or be removed from the official pool.

## Clan abuse

Clans can also be abused.

Possible abuse cases:

- Clan battle farming
- Fake clan battles
- Clan bank theft
- Harassment through clan names or logos
- Mass-reporting rival clans
- Throwing matches for another clan

Clan moderation can include:

- Clan warnings
- Clan credit fines
- Clan battle restrictions
- Logo/name removal
- Clan suspension
- Clan deletion

## Moderation actions

Possible moderation actions:

| Action                 | Description                              |
| ---------------------- | ---------------------------------------- |
| Warning                | A light warning for minor behavior       |
| Credit fine            | Removes credits from the player or clan  |
| Queue restriction      | Blocks matchmaking temporarily           |
| Clan restriction       | Blocks clan battles or clan features     |
| Tournament restriction | Blocks tournament entry                  |
| Temporary ban          | Blocks platform access for a period      |
| Permanent ban          | Removes access permanently               |
| Server unverification  | Removes a server from the official pool  |
| Reward removal         | Removes abused or wrongly earned credits |

## Appeals

FLOW may need an appeal system later.

For now, moderation should at least keep enough data to explain decisions.

Useful data:

- Match ID
- Player ID
- Clan ID
- Server ID
- Report reason
- Chat logs if available
- Voice abuse metadata if available
- Disconnect history
- Reputation activity
- Credit activity
- Server reward activity
- Clan bank activity
- Admin notes

## Notes

Moderation should be strict enough to protect matches, but not so strict that normal players are afraid to play.

The goal is to make FLOW better to play on than open public matchmaking.

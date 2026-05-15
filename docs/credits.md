# Credits

Credits are the internal FLOW platform currency.

They are used to reward players, server hosts, clans, and other useful activity inside the FLOW ecosystem.

These numbers are draft values. They are meant to give FLOW a starting economy, not a final economy.

## Goals

The credit system should:

- Reward people for playing matches.
- Reward people a little more for winning.
- Reward good behavior.
- Reward players who are good to play with.
- Reward server hosts who provide useful infrastructure.
- Give players something useful to spend credits on.
- Penalize toxic behavior, griefing, and match disruption.
- Keep the platform healthy without turning credits into a real-money market.

Credits are not meant to be a cash-out system.

## Earning credits as a player

Players earn credits by playing official FLOW matches.

| Action                                 | Credits |
| -------------------------------------- | ------: |
| Complete a match                       |      25 |
| Win a match                            |     +10 |
| Lose a match                           |      +0 |
| Match MVP / highest impact player      |      +5 |
| Receive a valid +rep                   |      +5 |
| Complete 5 matches in a day            |     +25 |
| Complete 20 matches in a week          |    +100 |
| Play during low-population queue hours |     +10 |
| Help fill a server in a needed region  |     +10 |

Example payouts:

| Result                      | Credits |
| --------------------------- | ------: |
| Loss with no extras         |      25 |
| Win with no extras          |      35 |
| Win with MVP bonus          |      40 |
| Win with MVP bonus and +rep |      45 |
| Loss with +rep              |      30 |

Winning should matter, but it should not be the only thing that matters.

FLOW should reward players who play matches, behave well, and help create good games.

## Match completion

Players should earn credits mainly when a match is completed.

This avoids rewarding people for joining and leaving, dodging, or wasting server slots.

Rules:

- No credits for abandoned matches.
- Reduced credits if a player disconnects and does not return.
- Full credits only if the player completed the match.
- Bonus credits only if the match was completed normally.
- No credit rewards for cancelled matches unless the cancellation was caused by server failure or platform failure.

## Winning bonus

Winning gives a small bonus.

The bonus should not be so large that people become toxic or abusive just to win more credits.

Current draft:

| Result          | Credits |
| --------------- | ------: |
| Match completed |      25 |
| Win bonus       |     +10 |

The goal is to reward competition without making losses feel worthless.

## Reputation rewards

Players can earn credits from +rep.

A +rep should mean that another player thought you were good to play with.

| Action             | Credits |
| ------------------ | ------: |
| Receive valid +rep |      +5 |

Possible +rep reasons:

- Good communication
- Good teammate
- Fair opponent
- Positive attitude
- Helpful to new players
- Calm under pressure

Reputation should have limits so people cannot farm credits with friends.

Possible restrictions:

- Limited number of +reps per day.
- Reduced value from repeated +reps between the same players.
- No +rep farming from private groups.
- Suspicious reputation patterns can be ignored or penalized.
- +rep only counts if both players completed the match.

## Losing credits

Credits can also be lost.

FLOW should be able to issue fines for behavior that damages matches or other players.

| Action                   | Credit penalty |
| ------------------------ | -------------: |
| Abandon match            |            -75 |
| Repeated AFK             |            -50 |
| Confirmed toxic behavior |            -50 |
| Severe toxic behavior    |           -150 |
| Griefing                 |           -150 |
| Match throwing           |           -200 |
| False reports            |            -50 |
| Reputation abuse         |           -100 |
| Cheating / severe abuse  |            Ban |

The goal is not to punish people for every small mistake. The goal is to make repeated bad behavior expensive.

## Fines and bans

If a player does not have enough credits to pay a fine, their balance can go negative.

| Credit balance   | Result                                                |
| ---------------- | ----------------------------------------------------- |
| `0` or above     | Can queue normally                                    |
| `-1` to `-99`    | Warning shown before queueing                         |
| `-100` to `-249` | Restricted from ranked, clan, and tournament matches  |
| `-250` or lower  | Matchmaking ban until reviewed or balance is restored |

This creates a simple rule:

If you keep damaging the platform, you eventually lose access to it.

## Earning credits as a server host

Server hosts earn credits when official FLOW matches are completed on their servers.

The better the server, the more it should earn.

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

A high-quality server in a needed region should earn more than a server that is unstable, overloaded, or has bad routing for players.

## Server quality multiplier

Server host rewards should use a multiplier based on server quality.

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

Possible quality factors:

- Average player latency
- Tick stability
- Packet loss
- Server FPS/performance
- Match completion rate
- Uptime
- Region demand
- Player feedback
- Plugin compliance

The goal is to make good infrastructure valuable.

If someone can provide excellent servers, they should be able to earn a lot of credits from hosting.

## Spending credits

Credits can be spent on FLOW platform items and features.

| Item                        |                      Cost |
| --------------------------- | ------------------------: |
| Common profile badge        |                       250 |
| Common weapon skin          |                       500 |
| Uncommon weapon skin        |                       900 |
| Rare weapon skin            |                     1,500 |
| Epic weapon skin            |                     2,500 |
| Custom knife skin           |                     5,000 |
| MVP effect                  |                     1,500 |
| Nameplate style             |                     1,000 |
| Player model                |                     3,000 |
| Seasonal cosmetic           |                     2,000 |
| Starter skin pack           |                       750 |
| Standard skin pack          |                     1,500 |
| Premium skin pack           |                     3,000 |
| Knife skin pack             |                     5,500 |
| Create clan                 |                     2,500 |
| Rename clan                 |                     1,000 |
| Change clan tag             |                       750 |
| Upload/change clan logo     |                       500 |
| Clan badge                  |   1,500 from clan balance |
| Clan nameplate style        |   2,500 from clan balance |
| Clan profile theme          |   2,000 from clan balance |
| Low-stake clan battle       | 100 locked from each clan |
| Standard clan battle        | 250 locked from each clan |
| High-stake clan battle      | 500 locked from each clan |
| Small open tournament entry |              250 per team |
| Clan cup entry              |              500 per clan |
| Weekend tournament entry    |            1,000 per team |
| Seasonal tournament entry   |            2,500 per team |

The main credit sinks should probably be cosmetics, skin packs, clans, and tournaments.

## Clan balances

Clans have their own public credit balance.

Members can transfer personal credits into the clan bank. Once credits are transferred, they belong to the clan.

Clan battle rewards go to the clan balance, not directly to the players who played the match.

Only the clan owner can transfer credits out of the clan bank or spend clan credits on restricted clan actions.

All clan balance changes should be logged.

Possible clan balance sources:

| Source                 | Result                                                    |
| ---------------------- | --------------------------------------------------------- |
| Member donation        | Adds credits to clan balance                              |
| Clan battle win        | Adds locked battle stake to clan balance                  |
| Tournament prize       | Adds prize to clan balance, depending on tournament rules |
| Admin grant            | Adds credits manually                                     |
| Clan battle loss       | Removes locked stake                                      |
| Clan cosmetic purchase | Removes credits                                           |
| Clan tournament entry  | Removes credits                                           |

## What credits should not be

Credits should not be:

- A crypto token
- A cash-out currency
- A gambling system
- A replacement for Steam items
- A tradeable marketplace asset at launch

Credits should stay inside FLOW.

## Notes

These values are draft values.

They should be tested before being finalized.

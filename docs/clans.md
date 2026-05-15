# Clans

Clans are player-created groups on FLOW.

They can be used for clan battles, tournaments, rankings, shared identity, and team-based progression.

## Goals

Clans should:

- Give players a reason to form long-term groups.
- Give credits more uses.
- Support clan battles.
- Support tournaments.
- Create community identity.
- Give players something to build together.
- Support future clan cosmetics and clan pages.

## Creating a clan

Creating a clan costs credits.

This prevents spam and makes clans feel more intentional.

| Action                        |  Cost |
| ----------------------------- | ----: |
| Create clan                   | 2,500 |
| Rename clan                   | 1,000 |
| Change clan tag               |   750 |
| Upload/change clan logo       |   500 |
| Create custom clan page style | 2,000 |
| Increase member limit         |   TBD |

## Clan identity

A clan can have:

- Name
- Tag
- Logo
- Description
- Region
- Members
- Officers
- Clan page
- Clan stats
- Clan match history
- Clan cosmetics
- Clan badges

Clan names, tags, and logos should be moderated.

## Clan roles

Possible clan roles:

| Role    | Description                               |
| ------- | ----------------------------------------- |
| Owner   | Full control over the clan                |
| Officer | Can manage members and some clan settings |
| Member  | Normal clan member                        |
| Trial   | New or temporary member                   |

Permissions can be expanded later.

## Clan bank

Each clan has a public credit balance.

The clan balance represents the clan's shared currency. It can be used for clan battles, tournament entry fees, clan cosmetics, clan profile customization, and other clan-level features.

The clan balance should be visible publicly on the clan profile.

Members can transfer their personal credits into the clan bank. Once credits are transferred to the clan, they belong to the clan.

Only the clan owner can transfer credits out of the clan bank or spend clan credits on owner-restricted actions.

Possible rules:

- Any member can donate credits to the clan bank.
- The clan balance is public.
- Only the clan owner can transfer credits out of the clan.
- Only the clan owner can approve large clan spending.
- Officers may be allowed to create clan battles if the owner gives them permission.
- All clan bank transactions should be logged.
- Clan bank abuse should be reportable.

Example transactions:

| Action                  | Direction                                                      |
| ----------------------- | -------------------------------------------------------------- |
| Member donates credits  | Player balance → clan balance                                  |
| Clan enters battle      | Clan balance locked as stake                                   |
| Clan wins battle        | Opponent stake → clan balance                                  |
| Clan buys cosmetic      | Clan balance → platform                                        |
| Owner withdraws credits | Clan balance → selected player or owner-controlled destination |

## Clan battles

Clan battles are matches between clans.

Clan battles use the clans' existing balances. Before the match, both clans decide how much credit balance they are willing to risk.

This creates a simple wager-style system using platform credits:

1. Clan A challenges Clan B.
2. Clan A proposes a credit stake.
3. Clan B accepts, rejects, or counters.
4. When both clans accept, the stake is locked from both clan balances.
5. The winner receives the locked stake.
6. The credits go to the winning clan balance, not directly to players.

Players do not receive clan battle credits directly.

The clan owner controls how clan credits are later spent or moved.

## Clan battle stakes

Clan battles should allow flexible stakes.

| Stake type     | Description                   |
| -------------- | ----------------------------- |
| Friendly       | No credits at risk            |
| Low stake      | Small credit risk             |
| Standard stake | Normal clan battle            |
| High stake     | Large credit risk             |
| Custom stake   | Both clans agree on an amount |

Draft values:

| Battle type       |                Stake |
| ----------------- | -------------------: |
| Friendly battle   |                    0 |
| Low-stake battle  |                  100 |
| Standard battle   |                  250 |
| High-stake battle |                  500 |
| Custom battle     | Agreed by both clans |

Both clans must have enough balance to cover the stake before the battle starts.

Example:

Clan A and Clan B agree to a 250 credit battle.

- 250 credits are locked from Clan A.
- 250 credits are locked from Clan B.
- The winning clan receives 500 credits into its clan balance.
- Individual players receive 0 credits directly.

## Clan battle formats

Possible formats:

| Format               | Description                     |
| -------------------- | ------------------------------- |
| 5v5                  | Standard competitive CS2 format |
| 2v2                  | Smaller clan battles            |
| Bo1                  | Best of one                     |
| Bo3                  | Best of three                   |
| Ranked clan battle   | Counts toward clan rating       |
| Friendly clan battle | Does not affect rating          |

## Clan battle penalties

Clan battles should have penalties for wasting another clan's time.

| Action              |                        Penalty |
| ------------------- | -----------------------------: |
| No-show             |              Lose locked stake |
| Abandon clan battle |              Lose locked stake |
| Confirmed abuse     | Lose locked stake + extra fine |
| Match manipulation  |        Clan restriction or ban |
| Fake battle farming |   Clan restriction or deletion |

If a clan no-shows or abandons the battle, the opposing clan should receive the locked stake.

## Clan battle rewards

Clan battle rewards go to the clan balance.

They should not automatically be split between members.

This keeps clans as actual organizations instead of just temporary player groups.

The clan owner can later decide what to do with clan credits:

- Save them for future battles.
- Enter tournaments.
- Buy clan cosmetics.
- Upgrade the clan profile.
- Reward members manually.
- Fund community events.

All outgoing transfers should be logged.

## Clan cosmetics

Clans can unlock or buy shared cosmetics using the clan balance.

Possible clan cosmetics:

| Cosmetic               |  Cost |
| ---------------------- | ----: |
| Clan badge             | 1,500 |
| Clan nameplate style   | 2,500 |
| Clan profile theme     | 2,000 |
| Clan weapon skin pack  |   TBD |
| Clan tournament banner |   TBD |

Clan cosmetics should be paid from the clan bank.

## Clan rating

Clans can have their own rating.

Possible rating factors:

- Clan battle wins
- Clan battle losses
- Tournament results
- Match completion rate
- No-show rate
- Reports
- Member behavior
- Activity

A clan with repeated no-shows, griefing, or abuse should lose access to clan battles.

## Clan restrictions

A clan may be restricted if it:

- Farms credits.
- Abuses clan battles.
- Uses offensive names, tags, or logos.
- Repeatedly no-shows.
- Harasses other clans.
- Manipulates match results.

Possible actions:

- Warning
- Credit fine
- Clan battle restriction
- Tournament restriction
- Logo/name removal
- Clan suspension
- Clan deletion

## Notes

Clans are a strong fit for FLOW because the whole platform is based on community-run competition.

They also give credits a useful purpose beyond individual cosmetics.

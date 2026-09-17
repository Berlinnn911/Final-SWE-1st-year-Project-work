# Database reference

A guide to the MongoDB collections used by the platform, the Mongoose schemas, the relationships between them and the indexes.

Author: Zawal (Backend Architecture, Database and DevOps). The User schema is owned by Zawal, the Team schema is owned by Usman Zulfiqar and the Tournament schema is owned by Awais.

---

## 1. Collections at a glance

| Collection     | Source file              | Owner            | What it stores                          |
|----------------|--------------------------|------------------|-----------------------------------------|
| `users`        | `models/User.js`         | Zawal            | Player, organizer and admin accounts    |
| `teams`        | `models/Team.js`         | Usman Zulfiqar   | Teams with captain, players and join requests |
| `tournaments`  | `models/Tournament.js`   | Awais            | Tournaments with registered teams       |
| `sessions`     | (created by connect-mongo) | (auto)         | Active login sessions                   |

The `sessions` collection is created and managed by `connect-mongo`. The application code never reads it directly.

---

## 2. User schema (`models/User.js`)

```
name           String     required, 2-80 chars
email          String     required, unique, lowercase, trimmed, indexed
password       String     required, min 8 (stored as bcrypt hash)
role           String     enum: 'player' | 'organizer' | 'admin', default 'player'
age            Number     optional, 13-100
location       String     optional, up to 80 chars
bio            String     optional, up to 500 chars
profileImage   String     optional, URL or empty
teams          [ObjectId] references Team
tournaments    [ObjectId] references Tournament
createdAt      Date       auto (timestamps)
updatedAt      Date       auto (timestamps)
```

### Notable behaviour

- **Password hash hook.** `userSchema.pre('save', async function () { ... })` runs before every save. If the password field is dirty, the value is replaced with a bcrypt hash (cost 12). This means controllers can write `user.password = newValue; await user.save()` without ever calling bcrypt themselves.
- **`verifyPassword(plain)` method.** A thin wrapper around `bcrypt.compare`. Returns a Promise of boolean.
- **`toSession()` method.** Returns a small object (`_id`, `name`, `email`, `role`) safe to store in a session if we ever decide to.

### Indexes
- `email` is unique.
- `email` also has an explicit index (Mongoose builds it from `unique: true`).

---

## 3. Team schema (`models/Team.js`)

```
name              String      required, unique, 2-60 chars, indexed
logo              String      optional URL
description       String      optional, up to 800 chars
region            String      required, up to 80 chars
captain           ObjectId    required, references User, indexed
players           [ObjectId]  references User
joinRequests      [JoinRequest subdocument]
tournaments       [ObjectId]  references Tournament
wins              Number      default 0
losses            Number      default 0
createdAt         Date        auto
updatedAt         Date        auto
```

The `joinRequest` subdocument looks like:

```
user        ObjectId  required, references User
message     String    up to 300 chars
createdAt   Date      default now
_id         ObjectId  auto (so we can target individual requests via /requests/:id)
```

### Notable behaviour

- **`initials` virtual.** Returns the team name's first letters (up to two). Used by the avatar circles in the UI.
- **JSON output includes virtuals.** Both `toJSON` and `toObject` have `virtuals: true` so the EJS templates can use `team.initials`.

### Indexes
- `name` is unique.
- `captain` is indexed for quick "teams I captain" queries.

---

## 4. Tournament schema (`models/Tournament.js`)

```
title                  String       required, 3-120 chars, indexed
description            String       optional, up to 2000 chars
organizer              ObjectId     required, references User, indexed
location               String       required, up to 120 chars
bannerImage            String       optional URL
format                 String       enum: single-elimination | double-elimination | round-robin | group-stage
startDate              Date         required
endDate                Date         required
registrationDeadline   Date         required
maxTeams               Number       required, 2-64
registeredTeams        [ObjectId]   references Team
rules                  String       optional, up to 4000 chars
entryFee               Number       default 0
status                 String       enum: Open | Closing Soon | Closed | Cancelled
createdAt              Date         auto
updatedAt              Date         auto
```

### Notable behaviour

- **`teamsCount` virtual.** Returns `registeredTeams.length`.
- **`isFull` virtual.** Returns `teamsCount >= maxTeams`.
- **`formattedDate` virtual.** Returns the start date formatted as e.g. "12 Jun 2026". Saves work in the view.
- **`updateAutoStatus()` method.** Decides the new status based on the current state:
  - If status is already `Cancelled` or `Closed`, do nothing.
  - If full, set to `Closed`.
  - If deadline has passed, set to `Closed`.
  - If only a few slots remain (roughly the last 15 percent or last seat), set to `Closing Soon`.
  - Otherwise set to `Open`.

This method is called every time a team registers or unregisters, so the status reflects reality without needing a background job.

---

## 5. Relationships

```
       +---------+
       |  User   |
       +---------+
        |   |   |
        |   |   +-- organizes -->  +-------------+
        |   |                       | Tournament  |
        |   |                       +-------------+
        |   |                            |
        |   +-- captain of -->           |  registeredTeams[]
        |                                v
        |                          +---------+
        +-- player in (teams[]) -> |  Team   |
                                   +---------+
```

| Relationship             | Cardinality   | Stored where                                  |
|--------------------------|---------------|-----------------------------------------------|
| User to Team             | many to many  | `User.teams[]` and `Team.players[]`           |
| Team to captain (User)   | many to one   | `Team.captain`                                |
| Team to Tournament       | many to many  | `Team.tournaments[]` and `Tournament.registeredTeams[]` |
| Tournament to organizer  | many to one   | `Tournament.organizer`                        |

### Why two arrays for the same relationship?

We store the relation on both sides (`User.teams[]` and `Team.players[]`). This makes the common UI queries fast because we can answer "what teams am I in?" by reading the user document, and "who is on this team?" by reading the team document. The cost is that controllers must update both sides on join, leave, approve and remove. Those updates are done explicitly in `controllers/teamController.js`.

---

## 6. Cross collection cleanup

When a team is deleted (`teamController.delete`):

```
1. Tournament.updateMany({ registeredTeams: team._id }, { $pull: { registeredTeams: team._id } })
2. User.updateMany({ teams: team._id }, { $pull: { teams: team._id } })
3. Team.deleteOne({ _id: team._id })
```

When a tournament is deleted (`tournamentController.delete`):

```
1. Team.updateMany({ tournaments: tournament._id }, { $pull: { tournaments: tournament._id } })
2. Tournament.deleteOne({ _id: tournament._id })
```

These cleanups live in the controllers instead of in Mongoose middleware. The reason is that Mongoose `pre('remove')` hooks only fire on the document version of `.remove()`, not on `deleteOne` and `deleteMany` queries, and we want one consistent pattern.

---

## 7. Seeding

`utils/seed.js` (Zawal) builds a realistic demo dataset:

- 1 organizer (`organizer@finhockey.fi`).
- 4 team captains (`aleksi`, `mikko`, `eero`, `janne`).
- 5 special player accounts named after the project contributors so they are easy to spot in the data.
- 55 Finnish players (real Finnish first and last names from a built in list).
- 4 teams, each with exactly 16 players including a captain.
- 3 tournaments with varied formats, capacities and registered teams.

All passwords are `password123`. The seed script wipes the database first, so running it twice is safe.

---

## 8. Implementation notes

- All schemas use `timestamps: true`, so `createdAt` and `updatedAt` are filled automatically.
- All ObjectId references use `ref: '...'` so `populate()` can be used to expand them.
- All collections are indexed on the fields most queried (email, captain, organizer and title).
- There are no soft deletes. A deleted document is gone.
- Sessions live in their own collection managed by `connect-mongo` and are not part of the schemas above.


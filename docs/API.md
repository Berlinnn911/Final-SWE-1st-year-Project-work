# API reference

A full list of the HTTP routes the server understands. This is the same table as the README but with more detail (request body, redirect behaviour, who can call it).

Author: Zawal (Backend Architecture, Database and DevOps). Per route ownership is noted in each section heading so the matching controller author is easy to find.

---

## Access levels

| Level     | Meaning                                                                 |
|-----------|-------------------------------------------------------------------------|
| public    | Anyone can call it. No login needed.                                    |
| auth      | The user must be signed in. Anonymous users are redirected to `/signin` (for GET) or get a 401 (for POST). |
| captain   | The user must be signed in and must be the captain of the target team.  |
| organizer | The user must be signed in and must have the role `organizer` or `admin`. |

Role checks are done in `middleware/auth.js` (`requireAuth`, `requireRole`). Ownership checks like "captain of this team" are done inside the controller because they depend on the document.

---

## Public routes (owned by Zawal)

### `GET /`
Home page. Shows the hero, three featured tournaments and four top teams.
Renders `views/pages/home.ejs`.

### `GET /about`
About page. Renders `views/pages/about.ejs`.

---

## Auth routes (owned by Muhammad Abdullah)

### `GET /signin`
Show the sign in form. Renders `views/pages/signin.ejs` (UI by Awais).
Accepts an optional `?next=<url>` query so we can come back after login.

### `POST /signin`
Sign the user in.
Body: `email`, `password`, `next`.
Behaviour:
- On success, sets `req.session.userId` and redirects to `next` (default `/dashboard`).
- On failure, re-renders the sign in page with an error message. We use the same message ("Invalid email or password.") for both "user not found" and "wrong password" so attackers cannot enumerate accounts.

### `GET /signup`
Show the sign up form. Renders `views/pages/signup.ejs` (UI by Awais).

### `POST /signup`
Create a new account.
Body: `name`, `email`, `password`, `confirm`, `age`, `location`, `role`.
Validation:
- All three of name, email and password are required.
- Password must be at least 8 characters.
- `password` and `confirm` must match.
- `role` is forced to either `player` or `organizer` (a malicious user cannot pick `admin`).
On success, the new user is signed in and redirected to `/dashboard`.

### `POST /signout`
Destroy the session and clear the cookie. Redirects to `/`.

---

## User routes (owned by Muhammad Abdullah)

### `GET /dashboard` (auth)
The logged in landing page. Shows the user's teams, the tournaments they have registered teams for, an upcoming count, a join request count and a "Recent activity" panel. Organizers also see a "Create Tournament" button.

### `GET /profile` (auth)
Profile edit page. Shows the form pre-filled with the current user's details.

### `POST /profile` (auth)
Update the current user's profile.
Body: `name`, `email`, `age`, `location`, `bio`.
Behaviour:
- Email is normalised (lowercased and trimmed).
- If the new email is different from the current one, we check no other user has it.
- On success, a flash message is set and the user is redirected back to `/profile`.

---

## Team routes (owned by Usman Zulfiqar)

All `/teams/*` routes require login. The router file mounts `requireAuth` first.

### `GET /teams` (auth)
List of all teams. Sorted by wins descending. Includes a client side search and sort widget.

### `GET /teams/new` (auth)
Create team form.

### `POST /teams` (auth)
Create a team.
Body: `name`, `region`, `description`.
Behaviour:
- Name and region are required.
- Name must be unique across the whole platform.
- The creator becomes the captain and is added to `players[]`.
- The team is also added to `req.user.teams[]`.

### `GET /teams/:id` (auth)
Team detail page with roster, join requests (captain only), team stats and linked tournaments.

### `POST /teams/:id/join` (auth)
Ask to join a team.
Body: `message` (optional).
Behaviour:
- Captains cannot request to join their own team.
- Existing members cannot request again.
- Duplicate pending requests are blocked.

### `POST /teams/:id/leave` (auth)
Leave the team.
Behaviour:
- The captain cannot leave their own team. They have to delete the team instead. (We have not implemented "transfer captaincy" yet.)
- The user is removed from `team.players[]` and the team is removed from `user.teams[]`.

### `POST /teams/:id/requests/:requestId/approve` (captain)
Approve a pending join request. Moves the user from `joinRequests[]` to `players[]`. Also adds the team to that user's `teams[]`.

### `POST /teams/:id/requests/:requestId/reject` (captain)
Reject a pending join request. Removes it from `joinRequests[]`.

### `POST /teams/:id/players/:userId/remove` (captain)
Remove a player from the roster. Cannot be used on the captain themselves.

### `POST /teams/:id/delete` (captain)
Delete the team.
Cleanup:
- Pulls the team out of every tournament's `registeredTeams[]`.
- Pulls the team out of every user's `teams[]`.
- Deletes the team document.

---

## Tournament routes (owned by Awais)

All `/tournaments/*` routes require login.

### `GET /tournaments` (auth)
List of all tournaments. Sorted by start date ascending. Includes a client side search, status filter and sort widget.

### `GET /tournaments/new` (organizer)
Create tournament form. Only visible to organizers and admins.

### `POST /tournaments` (organizer)
Create a tournament.
Body: `title`, `description`, `location`, `format`, `startDate`, `endDate`, `registrationDeadline`, `maxTeams`, `rules`, `entryFee`, `bannerImage`.
Validation:
- Title, location, start, end, deadline and max teams are all required.
- All three dates must parse.
- `endDate` must be on or after `startDate`.
- `registrationDeadline` must be on or before `startDate`.
- `maxTeams` must be between 2 and 64.
- If no banner image is given, a default Unsplash photo is used.

### `GET /tournaments/:id` (auth)
Tournament detail page with rules, registered teams, organizer info and a registration side panel.

### `POST /tournaments/:id/register` (captain)
Register a team for this tournament.
Body: `teamId`.
Validation:
- The team must exist.
- The current user must be the captain of that team.
- The tournament must not be `Closed` or `Cancelled`.
- The registration deadline must not have passed.
- The team must not already be registered.
- The tournament must not be full.

If all checks pass, the team id is pushed into `registeredTeams[]`, the tournament id is added to the team's `tournaments[]`, and `updateAutoStatus()` runs so the tournament can move to `Closing Soon` or `Closed` if needed.

### `POST /tournaments/:id/unregister` (captain)
Remove your team from the tournament.
Body: `teamId`.
Behaviour: reverse of register. The team is pulled out and `updateAutoStatus()` runs again.

### `POST /tournaments/:id/delete` (organizer)
Delete the tournament. Only the original organizer or an admin can do this.
Cleanup: removes the tournament from every registered team's `tournaments[]`, then deletes the document.

---

## Error responses

All non matching URLs hit `middleware/errors.js`:

- `notFound` returns a 404 and renders `views/pages/error.ejs` with `status = 404`.
- `errorHandler` catches any thrown or async error, logs it to the server console, and renders the same error page with the original status (or 500). In production the message is generic; in development the real error message is shown.

---

## Conventions

- All form submissions are `POST` followed by a `redirect` to a `GET` page. This avoids the "resubmit form" prompt on refresh.
- Form-only "DELETE" operations are done as `POST` because HTML forms only support GET and POST. The `method-override` package is loaded in case we want to use `?_method=DELETE` later.
- Flash messages are the only way controllers send a status string to the next page. They live in the session and are cleared after one render.
- Server side validation is done in the controllers. Client side validation in `public/js/validation.js` is a nice to have, never the only check.

# Architecture

This document explains how the Finland Ice Hockey Tournament platform is built. It is meant for anyone new to the project who wants to understand it quickly without reading every file.

Author note: this document was written by Abdullah (Backend Architecture, Database and DevOps). For the full per file ownership see `CONTRIBUTORS.md`.

---

## 1. The big picture

The project is a classic **MVC** web application:

- **Model** is Mongoose schemas talking to MongoDB.
- **View** is EJS templates rendered server side.
- **Controller** is plain JavaScript functions that read the request, call the model and pick a view.

There is no front end framework like React or Vue. Every page is rendered on the server and sent as full HTML. A small amount of vanilla JavaScript runs in the browser for things like the mobile menu and form validation.

```
  Browser           Express (Node.js)            MongoDB
  -------           -----------------            -------
  Request   ----->  Middleware                   Mongoose
                       |                            ^
                       v                            |
                    Route (URL match)               |
                       |                            |
                       v                            |
                    Controller  <----- reads / writes
                       |
                       v
                    EJS view rendered
                       |
  HTML      <----- Response
```

---

## 2. Folder layout and why it looks like this

```
hockey-tournament/
  app.js                 entry point, wires everything together
  config/                external service config (just MongoDB for now)
  models/                Mongoose schemas
  controllers/           one controller file per feature
  routes/                one route file per feature, maps URL to controller
  middleware/            cross cutting concerns (auth, flash, error)
  utils/                 standalone scripts (seed)
  views/
    partials/            shared bits (head, navbar, footer, flash)
    pages/               one ejs file per page
  public/                static assets served unchanged
    css/
    js/
  docs/                  this folder, extra documentation
```

A folder for each layer of MVC keeps things easy to find. A new contributor can guess where to put a file just by reading its purpose.

---

## 3. Request lifecycle, step by step

This is what happens when a logged in captain clicks "Approve" on a join request.

1. The browser sends `POST /teams/64ff.../requests/650a.../approve` with the session cookie.
2. **Express body parsers** read the form body.
3. **express-session** middleware reads the session cookie, looks up the session in MongoDB, attaches `req.session`.
4. **`loadUser` middleware** sees `req.session.userId` and loads the User document. It attaches `req.user` and `res.locals.user`.
5. **`flash` middleware** sets up `req.flash()` and `res.locals.flash`.
6. **The router** matches `/teams` and forwards to `teamRoutes.js`.
7. `teamRoutes.js` has `router.use(requireAuth)` so the request is checked. Since the user is logged in, it continues.
8. The route `POST /:id/requests/:requestId/approve` calls `teamController.approveRequest`.
9. The controller loads the team, checks that the current user is the captain, moves the requester into `team.players[]`, removes the request and saves.
10. The controller calls `req.flash('success', '...')` and redirects to the team page.
11. On the redirect (a fresh GET request), steps 2 to 7 repeat. The flash middleware reads the saved message and exposes it as `res.locals.flash`. The team page renders, and the toast appears.

This pattern is called **Post / Redirect / Get** and it is used everywhere in the project. It avoids "Are you sure you want to resubmit?" prompts on refresh.

---

## 4. Middleware order in `app.js`

Order matters. The middleware chain is set up as follows:

```
express.static          serves /public files first (cheap, no session needed)
express.urlencoded      parse form bodies
express.json            parse JSON bodies
methodOverride          let forms simulate PUT and DELETE
session                 attach req.session (reads cookie, hits Mongo)
loadUser                turn req.session.userId into a real User document
flash                   wire req.flash() and res.locals.flash
[ feature route files ]
notFound                catches anything that did not match a route
errorHandler            catches thrown errors and renders the error page
```

If sessions came after the routes, the routes would have no `req.session`. If `loadUser` came after the routes, no controller would know who the user was. The order above is the minimum that makes the app work.

---

## 5. Authentication and authorization

- Passwords are hashed by `userSchema.pre('save')` in `models/User.js`. The cost factor is 12.
- Sign in calls `user.verifyPassword(plain)` which is just a wrapper around `bcrypt.compare`.
- After a successful sign in the controller writes `req.session.userId = user._id`. Nothing else is stored on the session.
- On every following request, `loadUser` middleware fetches the user from Mongo and attaches it to `req.user`. This means we always have fresh data (if the user changes their name in tab A, tab B sees the new name on the next request).
- Three role gates are provided:
  - `requireAuth` makes the route 401 / redirect when there is no user.
  - `requireRole('organizer', 'admin')` checks `req.user.role`.
  - Resource ownership checks like `String(team.captain) === String(req.user._id)` live inside controllers because they need to read the document first.

---

## 6. Sessions

- Sessions use `express-session`.
- The session store is `connect-mongo`. This means logged in users stay logged in even if the Node process restarts during development.
- The cookie is `httpOnly` (no JavaScript access), `sameSite=lax` (basic CSRF defense) and `secure` only when `NODE_ENV === 'production'`.
- The TTL is seven days.

---

## 7. Data layer

The three top level schemas are in `models/`:

- `User.js` (owner: Zawal)
- `Team.js` (owner: Usman Zulfiqar)
- `Tournament.js` (owner: Awais)

A separate document, `DATABASE.md`, explains the schemas and the relationships in more depth.

References use `mongoose.Schema.Types.ObjectId` with `ref: '...'`. Reads use `.populate('field', 'name email')` to pull only the fields the view needs.

Cross collection cleanup happens in controllers, not in schema hooks. When a team is deleted:
1. `Tournament.updateMany(..., $pull: { registeredTeams: team._id })`
2. `User.updateMany(..., $pull: { teams: team._id })`
3. `Team.deleteOne(...)`

This is simple to read and matches what the user sees in the UI.

---

## 8. Views

Each page is one EJS file in `views/pages/`. Every page includes the same three partials from `views/partials/`:

- `head.ejs` for the `<head>` block.
- `navbar.ejs` at the top of the body.
- `footer.ejs` at the bottom of the body.

The error page (`pages/error.ejs`) does not include the footer because it is meant to look distinct.

Pages do not have a "layout" file. EJS supports layouts via plug ins but the project chose plain `include()` calls to keep the dependency list small and the rendering flow explicit.

---

## 9. Front end assets

Three CSS files, loaded in order:

1. `style.css` defines design tokens and base styles.
2. `components.css` defines the visual components (navbar, hero, buttons, cards, forms, footer and so on).
3. `responsive.css` overrides at six breakpoints. This is mobile first so the desktop versions are the defaults and small screens get fewer columns and a hamburger menu.

Two JavaScript files:

1. `main.js` runs on every page. It powers the hamburger menu, the submit button loading state and fade in on scroll.
2. `validation.js` only loads on the sign in and sign up pages.

All three CSS files and both JS files were written by hand. There is no build step, no bundler and no transpiler.

---

## 10. How a new feature gets added

Pretend we want to add a "comments on a tournament" feature. The steps would be:

1. Define a `Comment` schema in `models/Comment.js` (or as a subdocument in `Tournament.js`).
2. Add `comment` methods to `controllers/tournamentController.js` or a new `commentController.js`.
3. Add routes (`POST /tournaments/:id/comments`, `POST /tournaments/:id/comments/:cid/delete`).
4. Add markup to `views/pages/tournament-detail.ejs` and any new CSS to `components.css`.
5. Update the API table in `README.md` and `docs/API.md`.

Because the layers are isolated, no other file needs to change.

---

## 11. Things that are deliberately out of scope

- No email sending. Sign up does not confirm a real address.
- No payment. The "entry fee" is just a number shown on the tournament page.
- No real time updates. There is no WebSocket or polling. A refresh shows new data.
- No image upload. Banner images are URL strings.
- No automated tests. Test infrastructure was out of scope for this build.

These are documented here so a reader does not waste time looking for them.

---

## 12. Where to read next

- `API.md` for a full list of routes with notes.
- `DATABASE.md` for the schemas and their relationships.
- `SETUP.md` for a deeper setup walkthrough.
- `CONTRIBUTORS.md` for who wrote what.

LLM was used to polish the structure of this document.
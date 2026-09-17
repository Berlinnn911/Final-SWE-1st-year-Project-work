# Contributors and work breakdown

This document explains who did what on the Finland Ice Hockey Tournament project and shows each team member's individual contribution.

The team picked a **feature vertical slice** approach. Two members (Usman and Awais) each own a full feature from database to view. The other three members own a horizontal layer (UI foundation, authentication, infrastructure). This way every member touched real backend and frontend code, and the file counts and code volume are roughly balanced.

Every source file in the project has a comment header at the top that names the author, so the author of any file is visible the moment it is opened.

---

## Quick summary table

| Member             | Layer / domain                                       | Files owned |
|--------------------|------------------------------------------------------|-------------|
| Rayyan Shakeel     | Frontend Designer and UI Foundation                  | 11          |
| Muhammad Abdullah  | Authentication and User Profile and helped with Backend Architecture  | 11 (shared 2 with Awais) |
| Usman Zulfiqar     | Team Module (Full Stack)                             | 6           |
| Awais              | Tournament Module (Full Stack) + Signup/Signin UI    | 6 + 2 shared |
| Zawal              | Backend Architecture, Database and DevOps            | 10          |

Total project files about 44 source files.

---

## Member 1: Rayyan Shakeel

### Role
**Frontend Designer and UI Foundation.** Rayyan owns the look and feel of the entire site. Every page in the project uses Rayyan's design system, navbar, footer and reusable components. This is the most visually obvious part of the demo.

### Files written

| File                              | What it contains                                            |
|-----------------------------------|-------------------------------------------------------------|
| `public/css/style.css`            | Design tokens (colour palette, spacing, font scale), CSS reset, base typography, layout primitives (container, grid, section) |
| `public/css/components.css`       | Buttons (primary, secondary, ghost, danger), navbar styles, hero, cards (tournament, team, feature), forms, footer, page banners, alerts, toolbar, dashboard widgets, profile, error page |
| `public/css/responsive.css`       | Mobile first breakpoints (1440, 1024, 900, 768, 640, 480), hamburger menu logic, reduced motion handling |
| `public/js/main.js`               | Mobile menu toggle, form submit loading spinner, fade in on scroll using IntersectionObserver |
| `views/partials/head.ejs`         | Shared HTML head, fonts (Inter, Montserrat), Font Awesome, favicon and CSS includes |
| `views/partials/navbar.ejs`       | Top navigation bar with conditional rendering for logged in vs logged out users |
| `views/partials/footer.ejs`       | Site footer with brand block, platform links, resources and contact |
| `views/partials/flash.ejs`        | Toast message renderer for success and error alerts          |
| `views/pages/home.ejs`            | Public home page with hero, featured tournaments grid and top teams grid |
| `views/pages/about.ejs`           | Public about page                                            |
| `views/pages/error.ejs`           | Shared 404 / 403 / 500 error page                            |

### What this work shows
- Strong CSS skills (custom properties, modern layout with Grid and Flexbox, mobile first responsive design, accessibility focus rings, prefers-reduced-motion).
- Front end JavaScript without any framework dependency.
- EJS template partials and reuse.
- Visual design language for the Finland theme (blue and white palette, typography scale).

---

## Member 2: Muhammad Abdullah

### Role
**Authentication and User Profile.** Abdullah owns everything related to having an account: sign in, sign up, sign out, sessions, role gates, profile editing and the dashboard. This is the security critical area of the codebase. Abdullah also helped Zawal with Backend Architecture.

The sign up and sign in **page design and UI code** were done by Awais. Abdullah wired those pages to the auth controller and added validation and role handling.

### Files written

| File                              | What it contains                                            |
|-----------------------------------|-------------------------------------------------------------|
| `controllers/authController.js`   | Show and submit sign in, show and submit sign up, sign out logic. Email lookup, bcrypt password verify, session start. |
| `controllers/userController.js`   | Dashboard data (my teams, my tournaments, pending requests count), profile view and profile update |
| `routes/authRoutes.js`            | URL routes for `/signin`, `/signup`, `/signout`              |
| `routes/userRoutes.js`            | URL routes for `/dashboard`, `/profile`                      |
| `middleware/auth.js`              | `loadUser` (attach user to req), `requireAuth` (redirect anonymous users), `requireRole` (role based gate) |
| `middleware/flash.js`             | One time flash message system used across the whole app for success and error toasts |
| `public/js/validation.js`         | Client side form validation (required fields, email format, password length, password match) |
| `views/pages/dashboard.ejs`       | Logged in landing page with stat cards, team list, tournament list, organizer panel and recent activity |
| `views/pages/profile.ejs`         | Profile edit form (name, email, age, location, bio) and sign out section |
| `views/pages/signin.ejs`          | Sign in page (UI code by Awais, form wiring and integration by Abdullah) |
| `views/pages/signup.ejs`          | Sign up page (UI code by Awais, form wiring, role select and integration by Abdullah) |

### What this work shows
- Knowledge of bcrypt password hashing and the salt round cost factor.
- Express session handling with `connect-mongo`.
- Role based access control (player, organizer, admin) via custom middleware.
- Defensive server side validation in the controller plus a layer of client side validation.

---

## Member 3: Usman Zulfiqar

### Role
**Team Module (Full Stack).** Usman owns the whole Team feature end to end. The model, the controller, the routes and all three Team views. This is the largest single controller in the project because of the captain workflow (approve, reject, kick, delete).

### Files written

| File                              | What it contains                                            |
|-----------------------------------|-------------------------------------------------------------|
| `models/Team.js`                  | Mongoose schema for Team, join request subdocument, captain reference, players array, virtual for team initials, indexes |
| `controllers/teamController.js`   | All team logic: `list`, `showCreate`, `create`, `detail`, `requestJoin`, `leave`, `approveRequest`, `rejectRequest`, `removePlayer`, `delete` |
| `routes/teamRoutes.js`            | All `/teams/*` URL routes, including captain only sub routes |
| `views/pages/teams.ejs`           | Team listing page with client side search and sort           |
| `views/pages/team-detail.ejs`     | Team page with stats, join request panel (captain only), full roster and captain controls |
| `views/pages/team-create.ejs`     | Create team form                                             |

### What this work shows
- Full stack ownership of a feature.
- Designing a Mongoose subdocument (join requests) and using `.pull()` / `.addToSet()` for relational updates.
- Captain only routes that check `String(team.captain) === String(req.user._id)` instead of relying on a role.
- Cross collection cleanup (when a team is deleted, also remove it from every player's `teams[]` and from every tournament's `registeredTeams[]`).

---

## Member 4: Awais

### Role
**Tournament Module (Full Stack)** plus **Signup and Signin UI code**. Awais's main responsibility is the Tournament feature end to end, mirroring Usman's split. Awais also designed and coded the visual look of the sign in and sign up pages.

### Files written

| File                                  | What it contains                                        |
|---------------------------------------|---------------------------------------------------------|
| `models/Tournament.js`                | Mongoose schema for Tournament, virtuals for `teamsCount`, `isFull`, `formattedDate`, and the `updateAutoStatus()` method that moves a tournament between Open / Closing Soon / Closed |
| `controllers/tournamentController.js` | All tournament logic: `list`, `showCreate`, `create`, `detail`, `register`, `unregister`, `delete`. Handles deadline checks, capacity checks and status updates. |
| `routes/tournamentRoutes.js`          | All `/tournaments/*` URL routes with role based gates on create and delete |
| `views/pages/tournaments.ejs`         | Tournament listing page with search, status filter and sort |
| `views/pages/tournament-detail.ejs`   | Tournament page with rules, registered teams, organizer info, the registration side panel and unregister button |
| `views/pages/tournament-create.ejs`   | Create tournament form (organizer only)                 |
| `views/pages/signin.ejs` (UI)         | Page layout, two column split, photo side, form styling |
| `views/pages/signup.ejs` (UI)         | Page layout, photo side, form layout with role select   |

### What this work shows
- Full stack ownership of the second major feature.
- Date validation logic (`endDate >= startDate`, `registrationDeadline <= startDate`).
- Auto status transitions (a tournament marks itself "Closing Soon" or "Closed" without needing a cron job).
- Cooperation across the team (worked with Muhammad Abdullah on the auth pages).

---

## Member 5: Zawal

### Role
**Backend Architecture, Database and DevOps.** Zawal owns the glue that holds the whole project together: the Express bootstrap, the MongoDB connection, the User schema (which everyone else depends on), the global error handler, the demo seeder, the public route file, the package configuration, and all written documentation. Abdullah also helped Zawal in backend Architechture. 

### Files written

| File                          | What it contains                                              |
|-------------------------------|---------------------------------------------------------------|
| `app.js`                      | Express setup, view engine, static files, body parsers, method override, sessions backed by MongoDB, middleware chain, route mounting, error handlers, server start |
| `config/db.js`                | MongoDB connection with friendly error messages for common DNS, auth and IP whitelist problems |
| `models/User.js`              | User Mongoose schema, bcrypt `pre('save')` hash hook, `verifyPassword()` method |
| `middleware/errors.js`        | 404 handler and global error handler that render the shared error page |
| `utils/seed.js`               | Demo data seeder. Builds organizer, captains, 5 team member accounts, 55 Finnish players, 4 teams of 16 players and 3 tournaments |
| `routes/pageRoutes.js`        | Public routes for `/` and `/about`                            |
| `package.json`                | Dependencies, npm scripts (`start`, `dev`, `seed`), contributor list |
| `.env.example`                | Template that other members copy to `.env`                    |
| `.gitignore`                  | Standard Node ignore rules                                    |
| `README.md`                   | Project overview, setup instructions, API table, troubleshooting |
| `docs/` folder                | All five extra documentation files                            |



Chatgpt used to correctly structure and formulate this document
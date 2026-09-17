# Finland Ice Hockey Tournament Registration Platform

A web platform where players create teams, organizers create tournaments, and team captains register their teams for those tournaments.

Built with **Node.js, Express, EJS and MongoDB (Mongoose)** following the **MVC** pattern (Model, View, Controller).

Five contributors built this together. The contributor list and "who wrote what" details are at the end of this file and in the `docs/` folder.

---

## Table of contents

1. [What this project does](#what-this-project-does)
2. [Tech stack](#tech-stack)
3. [Quick start](#quick-start)
4. [Full step by step setup](#full-step-by-step-setup)
5. [How to use the app](#how-to-use-the-app)
6. [Project structure](#project-structure)
7. [Features](#features)
8. [API endpoints](#api-endpoints)
9. [Data model](#data-model)
10. [npm scripts](#npm-scripts)
11. [Troubleshooting](#troubleshooting)
12. [Documentation files](#documentation-files)
13. [Team members and credits](#team-members-and-credits)

---

## What this project does

The platform helps Finnish ice hockey teams and event organizers in three simple ways:

1. A player can sign up, create a team, and become its captain.
2. Other players can ask to join a team. The captain approves or rejects them.
3. An organizer can create a tournament. Captains can then register their team for it.

Everything happens through a clean web interface. The backend stores users, teams and tournaments in MongoDB.

---

## Tech stack

| Layer        | Choice                                              |
|--------------|-----------------------------------------------------|
| Runtime      | Node.js (LTS)                                       |
| Web server   | Express.js                                          |
| Database     | MongoDB with Mongoose                               |
| Templates    | EJS                                                 |
| Sessions     | express-session backed by connect-mongo             |
| Passwords    | bcrypt (cost factor 12)                             |
| Front end    | Hand written HTML, CSS and a small amount of JS     |
| Icons        | Font Awesome                                        |
| Fonts        | Inter and Montserrat from Google Fonts              |

There is no front end framework. Everything is server rendered EJS.

---

## Quick start

If you already have MongoDB ready and you only want the short version:

```bash
npm install
copy .env.example .env       # on Windows
# cp .env.example .env       # on macOS or Linux
npm run seed                 # adds demo accounts and tournaments
npm run dev                  # opens on http://localhost:3000
```

If you have never set up a Node project before, follow the full guide below.

---

## Full step by step setup

### Step 1. Install Node.js

1. Go to https://nodejs.org and download the **LTS** installer.
2. Run the installer and accept all defaults.
3. Open a new terminal and run these two commands. Both should print a version number.
   ```
   node -v
   npm -v
   ```

### Step 2. Get a MongoDB database

You have two choices. Option A is the easiest because nothing runs on your computer.

#### Option A. MongoDB Atlas (cloud, recommended)

1. Go to https://www.mongodb.com/cloud/atlas and click **Try Free**.
2. Sign up with your email. No credit card is needed for the free M0 plan.
3. Deploy a database. Pick **M0 Free**, pick the region closest to you, and name the cluster something like `finhockey`. Click Create.
4. In the left side menu open **Database Access**. Click **Add New Database User**. Pick a username and a password. Save these somewhere safe.
5. In the left side menu open **Network Access**. Click **Add IP Address**, then click **Allow Access From Anywhere** (this is `0.0.0.0/0`). For a real production app you would lock this down, but for local development this is fine.
6. In the left side menu open **Database**. Click **Connect** on your cluster, then **Drivers**. Copy the connection string. It looks like this:
   ```
   mongodb+srv://USERNAME:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with the password you set in step 4. Also add the database name `finhockey` before the `?` so it becomes:
   ```
   mongodb+srv://USERNAME:YOURPASS@cluster0.xxxxx.mongodb.net/finhockey?retryWrites=true&w=majority
   ```
8. Paste that string into the `.env` file as the value of `MONGODB_URI`.

#### Option B. Local MongoDB

1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community.
2. Install it. On the installer screen tick **Install MongoDB as a Service** so it starts automatically.
3. Keep the default value of `MONGODB_URI` in the `.env` file:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/finhockey
   ```
4. (Optional) Install MongoDB Compass from the same page. It gives you a visual way to browse your data.

### Step 3. Configure the project

In the project folder run:

```
copy .env.example .env       # Windows
cp .env.example .env         # macOS or Linux
```

Then open `.env` in a text editor and do the following.

1. Set `MONGODB_URI` to your Atlas string (Option A) or leave the default (Option B).
2. Replace `SESSION_SECRET` with a long random string. You can generate one with:
   ```
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   Copy the output and paste it as the value of `SESSION_SECRET`.

### Step 4. Install dependencies and add demo data

```
npm install
npm run seed
```

The seed command wipes the database and creates one organizer, four team captains, fifty five Finnish players and three tournaments. The full list of demo logins is printed in the terminal at the end.

### Step 5. Start the server

```
npm run dev
```

Open http://localhost:3000 in your browser.

---

## How to use the app

Sign in with one of the demo accounts. The password for every demo account is `password123`.

| Email                          | Role        | Notes                              |
|--------------------------------|-------------|------------------------------------|
| `organizer@finhockey.fi`       | organizer   | Can create tournaments             |
| `aleksi@finhockey.fi`          | player      | Captain of Helsinki Frost          |
| `mikko@finhockey.fi`           | player      | Captain of Tampere Wolves          |
| `eero@finhockey.fi`            | player      | Captain of Oulu Glaciers           |
| `janne@finhockey.fi`           | player      | Captain of Espoo Blades            |
| `usman.zulfiqar@finhockey.fi`  | player      | Member of Helsinki Frost           |
| `awais.ali@finhockey.fi`       | player      | Member of Tampere Wolves           |
| `rayyan.shakeel@finhockey.fi`  | player      | Member of Oulu Glaciers            |
| `zawar@finhockey.fi`           | player      | Member of Espoo Blades             |
| `usama@finhockey.fi`           | player      | Member of Helsinki Frost           |

Or click **Sign Up** in the navbar and create your own account.

Things you can do once you are signed in:

- **As a player:** create a team, ask to join other teams, leave a team you are in, edit your profile.
- **As a captain:** approve or reject join requests, remove a player, delete the team, register the team for a tournament.
- **As an organizer:** create a tournament, delete your own tournament.

---

## Project structure

```
hockey-tournament/
|
|-- app.js                  (Express bootstrap, middleware and route mounting)
|-- package.json
|-- .env                    (secrets, not committed)
|-- .env.example            (template you copy from)
|
|-- config/
|   |-- db.js               (MongoDB connection logic and friendly errors)
|
|-- models/                 (Mongoose schemas, the "M" of MVC)
|   |-- User.js
|   |-- Team.js
|   |-- Tournament.js
|
|-- controllers/            (business logic, the "C" of MVC)
|   |-- authController.js
|   |-- userController.js
|   |-- teamController.js
|   |-- tournamentController.js
|
|-- routes/                 (URL to controller mapping)
|   |-- pageRoutes.js
|   |-- authRoutes.js
|   |-- userRoutes.js
|   |-- teamRoutes.js
|   |-- tournamentRoutes.js
|
|-- middleware/
|   |-- auth.js             (loadUser, requireAuth, requireRole)
|   |-- flash.js            (one time success and error messages)
|   |-- errors.js           (404 page and global error handler)
|
|-- utils/
|   |-- seed.js             (demo data seeder, run with npm run seed)
|
|-- views/                  (EJS templates, the "V" of MVC)
|   |-- partials/           (navbar, footer, head, flash)
|   |-- pages/              (one .ejs file per route)
|
|-- public/                 (static assets served by Express)
|   |-- css/                (style.css, components.css, responsive.css)
|   |-- js/                 (main.js, validation.js)
|
|-- docs/                   (extra documentation)
    |-- ARCHITECTURE.md     (how the layers fit together)
    |-- API.md              (full route reference)
    |-- DATABASE.md         (Mongoose schemas and relationships)
    |-- SETUP.md            (longer setup walkthrough)
    |-- CONTRIBUTORS.md     (per member work breakdown)
```

---

## Features

### Authentication

- Register with name, email, password, age, location and role.
- Sign in with email and password (checked with bcrypt).
- Sessions are stored in MongoDB (`connect-mongo`) so they survive a server restart.
- Sign out destroys the session.

### Roles

- **Player.** Default role. Can create teams, join other teams, leave teams.
- **Organizer.** Chosen at signup. Can also create and delete tournaments.
- **Admin.** Set manually in the database. Can do everything an organizer can plus moderate.

### Teams

- Create a team. The creator automatically becomes the captain.
- Browse and search all teams.
- Ask to join a team. The captain approves or rejects.
- The captain can remove players or delete the team.
- A player can leave any team they are in (the captain has to delete the team instead).

### Tournaments

- Organizers create tournaments with title, description, dates, format, max teams, rules and entry fee.
- Anyone signed in can browse and view tournaments.
- A team captain registers their team for a tournament.
- The status updates itself. It moves to **Closing Soon** when capacity is almost full and to **Closed** when full or after the deadline.
- A captain can unregister their team. An organizer can delete their tournament.

### Security

- Passwords are hashed with bcrypt at cost 12.
- Pages that need login redirect anonymous users to `/signin`.
- Routes are gated by role. Only organizers can create tournaments. Only captains can register a team.
- Session cookies are `httpOnly` and `sameSite=lax`. In production they are also `secure`.
- Email uniqueness is enforced by the database (a unique index on `email`).

---

## API endpoints

All routes that need a login will redirect anonymous users to `/signin`.

| Method | Route                                          | Access     | What it does                              |
|--------|------------------------------------------------|------------|-------------------------------------------|
| GET    | `/`                                            | public     | Home page                                 |
| GET    | `/about`                                       | public     | About page                                |
| GET    | `/signin`                                      | public     | Sign in form                              |
| POST   | `/signin`                                      | public     | Submit sign in                            |
| GET    | `/signup`                                      | public     | Sign up form                              |
| POST   | `/signup`                                      | public     | Submit sign up                            |
| POST   | `/signout`                                     | auth       | Destroy session and log out               |
| GET    | `/dashboard`                                   | auth       | Player or organizer dashboard             |
| GET    | `/profile`                                     | auth       | Profile page                              |
| POST   | `/profile`                                     | auth       | Update profile                            |
| GET    | `/teams`                                       | auth       | List of all teams                         |
| GET    | `/teams/new`                                   | auth       | Create team form                          |
| POST   | `/teams`                                       | auth       | Submit new team                           |
| GET    | `/teams/:id`                                   | auth       | Team detail page                          |
| POST   | `/teams/:id/join`                              | auth       | Ask to join this team                     |
| POST   | `/teams/:id/leave`                             | auth       | Leave this team                           |
| POST   | `/teams/:id/requests/:rid/approve`             | captain    | Approve a join request                    |
| POST   | `/teams/:id/requests/:rid/reject`              | captain    | Reject a join request                     |
| POST   | `/teams/:id/players/:uid/remove`               | captain    | Remove a player from the roster           |
| POST   | `/teams/:id/delete`                            | captain    | Delete this team                          |
| GET    | `/tournaments`                                 | auth       | List of all tournaments                   |
| GET    | `/tournaments/new`                             | organizer  | Create tournament form                    |
| POST   | `/tournaments`                                 | organizer  | Submit new tournament                     |
| GET    | `/tournaments/:id`                             | auth       | Tournament detail page                    |
| POST   | `/tournaments/:id/register`                    | captain    | Register a team for the tournament        |
| POST   | `/tournaments/:id/unregister`                  | captain    | Unregister a team                         |
| POST   | `/tournaments/:id/delete`                      | organizer  | Delete this tournament                    |

A longer version of this table with notes and example bodies is in `docs/API.md`.

---

## Data model

### User
`name, email, password (hashed), role (player or organizer or admin), age, location, bio, profileImage, teams[], tournaments[]`

### Team
`name (unique), region, description, logo, captain (User reference), players[] (User references), joinRequests[] (subdocuments), tournaments[] (Tournament references), wins, losses`

### Tournament
`title, description, organizer (User reference), location, bannerImage, format, startDate, endDate, registrationDeadline, maxTeams, registeredTeams[] (Team references), rules, entryFee, status`

### Relationships
- User to Team is many to many. A user can be in many teams. A team has many players.
- Team to Tournament is many to many.
- Tournament to User (organizer) is many to one.

A diagram and longer explanation lives in `docs/DATABASE.md`.

---

## npm scripts

| Command         | What it does                                  |
|-----------------|-----------------------------------------------|
| `npm install`   | Install all dependencies                      |
| `npm run seed`  | Wipe the database and add demo data           |
| `npm run dev`   | Start the server with nodemon (auto reload)   |
| `npm start`     | Start the server without auto reload          |

---

## Troubleshooting

**"MongooseError: Operation `users.findOne()` buffering timed out"**
Your `MONGODB_URI` is wrong, or MongoDB is not running. Check the URI in `.env`.

**Atlas connection fails**
Check that `0.0.0.0/0` is in the Atlas Network Access list. Also check that your database user password is URL encoded if it contains characters like `@ : / # ?`.

**"EADDRINUSE: address already in use :::3000"**
Another program is already using port 3000. Either close it, or change the `PORT` value in `.env`.

**Forgot a demo password**
Run `npm run seed` again. It wipes the database and recreates everything. Every password is reset to `password123`.

More tips and a longer setup walkthrough are in `docs/SETUP.md`.

---

## Documentation files

Because this project is not on GitHub, all the documentation lives inside the repository folder. Open these files for more detail.

| File                          | What it covers                                            |
|-------------------------------|-----------------------------------------------------------|
| `README.md`                   | This file. Quick start, structure, features.              |
| `docs/SETUP.md`               | Longer setup guide and common problems.                   |
| `docs/ARCHITECTURE.md`        | How the layers fit together and the request flow.         |
| `docs/API.md`                 | Full route list with notes and example bodies.            |
| `docs/DATABASE.md`            | Mongoose schemas and how the data is linked.              |
| `docs/CONTRIBUTORS.md`        | Per member work split with file list and role.            |

---

## Team members and credits

This was built by a team of five. The work was split into vertical and horizontal slices so each person owns a real chunk of the codebase.

| Member             | Role on the team                                                    |
|--------------------|---------------------------------------------------------------------|
| Rayyan Shakeel     | Frontend Designer and UI Foundation                                 |
| Muhammad Abdullah  | Authentication and User Profile                                     |
| Usman Zulfiqar     | Team Module (Full Stack)                                            |
| Awais              | Tournament Module (Full Stack), plus Signup and Signin UI code      |
| Zawal              | Backend Architecture, Database and DevOps                           |

Every source file in this project has a comment header at the top that names the author. The full per file breakdown is in `docs/CONTRIBUTORS.md`.

---

ChatGPT was used to properly structure the contents of this document.
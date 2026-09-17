# Detailed setup guide

This is the long version of the setup guide. The README has a shorter version. Use this document if you are setting up the project for the first time on a fresh computer or if the README quick start fails.

Author: Zawal (Backend Architecture, Database and DevOps).

---

## 1. Requirements

You need three things installed on your computer.

| Tool         | Version (or higher) | Where to get it                                       |
|--------------|---------------------|-------------------------------------------------------|
| Node.js      | 18 LTS              | https://nodejs.org                                    |
| npm          | 9 (comes with Node) | bundled with Node, no separate install                |
| MongoDB      | 6.0                 | https://www.mongodb.com/try/download/community OR https://www.mongodb.com/cloud/atlas (cloud, free) |

A modern browser (Chrome, Firefox, Edge or Safari).

---

## 2. Get the project files
Unzip the folder somewhere convenient, for example:

```
C:\Users\<you>\hockey-tournament
```

Open a terminal and `cd` into that folder.

---

## 3. Install dependencies

```
npm install
```

This reads `package.json` and downloads everything into `node_modules/`. It can take a minute or two. You should see no red errors at the end.

---

## 4. Pick a MongoDB option

You have two ways to get a MongoDB database. Atlas is easier because nothing runs on your machine.

### Option A. Atlas (cloud, recommended)

1. Go to https://www.mongodb.com/cloud/atlas. Click **Try Free**.
2. Sign up. No credit card needed for the free M0 tier.
3. Deploy a free **M0** cluster. Pick the region closest to you. You can name it anything; `finhockey` is fine.
4. Once the cluster is ready, open the left side menu.
5. Click **Database Access**. Click **Add New Database User**. Pick a username and a password. Save them somewhere you can find them again.
6. Click **Network Access** (still in the left menu). Click **Add IP Address**. Click **Allow Access From Anywhere**. The CIDR shows as `0.0.0.0/0`. For a real production app this is too open, but for local development this avoids "IP not whitelisted" errors when you work from different networks (home, office, hotspot).
7. Click **Database** in the left menu. On your cluster card click **Connect**, then **Drivers**.
8. Copy the connection string. It looks like this:
   ```
   mongodb+srv://USERNAME:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
9. Replace `<password>` with the password from step 5.
10. Add the database name. Put `finhockey` before the `?`:
    ```
    mongodb+srv://USERNAME:YOURPASSWORD@cluster0.xxxxx.mongodb.net/finhockey?retryWrites=true&w=majority
    ```
11. Keep this string ready; you will paste it into `.env` in the next step.

### Option B. Local MongoDB

1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community.
2. Run the installer. On the install options screen, tick **Install MongoDB as a Service**. This makes the database start automatically with Windows.
3. Optionally install MongoDB Compass from the same page. It is a desktop app that lets you browse the data in a GUI.
4. The default connection string is:
   ```
   mongodb://127.0.0.1:27017/finhockey
   ```
   You do not need to do anything else.

---

## 5. Create the `.env` file

The project reads its settings from a file called `.env` in the project root. A template is included.

Copy the template:

```
copy .env.example .env       # Windows
cp .env.example .env         # macOS or Linux
```

Open `.env` in any text editor (Notepad, VS Code, anything). You will see something like:

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/finhockey
SESSION_SECRET=change-me-to-a-long-random-string
```

Update two values.

### MONGODB_URI

If you picked Atlas (Option A), replace the value with the connection string from step 10 above.

If you picked Local (Option B), leave it alone.

### SESSION_SECRET

This is the secret used to sign your session cookies. It must be long and random. You can generate one with:

```
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the printed value (a long hex string) and paste it as the value of `SESSION_SECRET`. It should look like:

```
SESSION_SECRET=a8c1b9d5e0f47b8c... (90 or so characters)
```

Save and close the file.

---

## 6. Add demo data

```
npm run seed
```

This wipes the database (so do not run it on a real production DB) and creates:

- 1 organizer
- 4 team captains
- 5 team-member player accounts named after the project group
- 55 Finnish player accounts
- 4 teams of 16 players each
- 3 tournaments

The seed command prints all the demo logins at the end. Every password is `password123`.

---

## 7. Start the development server

```
npm run dev
```

This runs the app with `nodemon`. Nodemon watches all `.js`, `.ejs` and `.css` files and restarts the server automatically when you save a change.

You should see:

```
MongoDB connected: <host> / finhockey
Finland Ice Hockey platform running on http://localhost:3000
```

Open http://localhost:3000 in your browser. The home page should appear.

---

## 8. Sign in and try it out

Click **Sign In** in the navbar. Use one of the demo accounts:

| Email                          | Role        |
|--------------------------------|-------------|
| `organizer@finhockey.fi`       | organizer   |
| `aleksi@finhockey.fi`          | captain of Helsinki Frost |
| `mikko@finhockey.fi`           | captain of Tampere Wolves |
| `eero@finhockey.fi`            | captain of Oulu Glaciers |
| `janne@finhockey.fi`           | captain of Espoo Blades |
| `usman.zulfiqar@finhockey.fi`  | player on Helsinki Frost |
| `awais.ali@finhockey.fi`       | player on Tampere Wolves |
| `rayyan.shakeel@finhockey.fi`  | player on Oulu Glaciers |
| `zawar@finhockey.fi`           | player on Espoo Blades |

Password for all of them is `password123`.

Or click **Sign Up** to create a brand new account.

---

## 9. Common problems

### "MongooseError: Operation `users.findOne()` buffering timed out"
The app could not reach MongoDB.

- Atlas: re-check the connection string. Did you replace `<password>`? Did you add `/finhockey` before the `?` so the app knows which database to use?
- Local: open Services on Windows (`services.msc`) and check that "MongoDB" is running.

### "MongoServerError: bad auth"
The username or password in your `MONGODB_URI` is wrong. Reset the password in Atlas under **Database Access** if you forgot it. Remember that special characters (like `@`, `:`, `/`, `#`, `?`) in a password must be URL encoded.

### "EADDRINUSE: address already in use :::3000"
Another program is already using port 3000.

- Either close that program. On Windows you can find the offender with `netstat -ano | findstr 3000`.
- Or change the port in `.env`: `PORT=3001`.

### "ECONNREFUSED 127.0.0.1:27017"
You picked Option B (Local) but MongoDB is not actually running. Either start the service or switch to Atlas (Option A).

### Atlas connection works on one network but not on another
You probably set Network Access to only your IP address. Either add the new IP, or set Network Access to `0.0.0.0/0` for school use.

### Forgot a demo password
Run `npm run seed` again. It resets everything to the demo state and every password becomes `password123`.

### The CSS looks broken
Check the browser dev tools network tab. If the three CSS files return 404, your Express static file middleware is not finding the `public/` folder. Make sure you started the server from the project root.

---

## 10. Stopping the server

In the terminal where the server is running, press **Ctrl + C**. Confirm with **Y** if asked. The server shuts down. Sessions stay in MongoDB so you will still be logged in next time you start it.

---

## 11. Cleaning up

If you want to remove everything:

```
1. Stop the server (Ctrl+C).
2. Delete the .env file (it has your secrets).
3. Delete node_modules/.
4. (Optional) Delete the finhockey database in MongoDB Atlas or via Compass.
```

You can always start fresh with `npm install` again.

Chatgpt was used to correctly structure the contents of this document.
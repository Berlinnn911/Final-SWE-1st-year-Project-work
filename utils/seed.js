/*
 * Finland Ice Hockey Tournament Platform
 * File: utils/seed.js
 * Purpose: Demo data seeder. Wipes the database and creates an organizer,
 *          four team captains, five team-member accounts for the project group,
 *          fifty-five Finnish players, four teams and three tournaments.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');

const BANNER_1 = 'https://images.unsplash.com/photo-1735728779121-7a00e40d598f?w=1200&q=80&auto=format&fit=crop';
const BANNER_2 = 'https://images.unsplash.com/photo-1514511719-9f5849dc16d0?w=1200&q=80&auto=format&fit=crop';
const BANNER_3 = 'https://images.unsplash.com/photo-1701361172842-b132f9b09948?w=1200&q=80&auto=format&fit=crop';

const PASSWORD = 'password123';

const FIRST_NAMES = [
  'Mikael','Joonas','Sami','Otto','Vesa','Antti','Juhani','Petri','Pasi','Marko',
  'Henrik','Lauri','Tuomas','Niko','Ville','Toni','Olli','Veikko','Aki','Esa',
  'Tero','Hannu','Risto','Timo','Kari','Pekka','Heikki','Reijo','Seppo','Ari',
  'Erkki','Ilkka','Juha','Jukka','Kimmo','Pertti','Tapani','Tommi','Kalle','Eemil',
  'Onni','Aatu','Leevi','Eetu','Niilo','Akseli','Roope','Veeti','Elias','Joel',
  'Daniel','Topias','Aaro','Eemeli','Anton'
];

const LAST_NAMES = [
  'Mäkinen','Nieminen','Mäkelä','Hämäläinen','Laine','Heikkinen','Koskinen','Järvinen','Lehtonen','Lehtinen',
  'Saarinen','Salminen','Heinonen','Heikkilä','Kinnunen','Salonen','Turunen','Salo','Laitinen','Tuominen',
  'Rantanen','Karjalainen','Jokinen','Mattila','Savolainen','Lahtinen','Ahonen','Ojala','Leinonen','Kallio',
  'Hiltunen','Anttila','Manninen','Pitkänen','Leppänen','Kettunen','Aaltonen','Toivonen','Aalto','Hakala',
  'Vainio','Pesonen','Niemelä','Peltonen','Hyvönen','Aho','Lehto','Mäenpää','Kärki','Saari',
  'Kuusela','Tiainen','Räsänen','Suomalainen','Suominen'
];

function normalizeEmailPart(s) {
  return s
    .toLowerCase()
    .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/å/g, 'a')
    .replace(/[^a-z0-9]/g, '');
}

function randAge() {
  return 18 + Math.floor(Math.random() * 15);
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected. Wiping existing data...');

  await Promise.all([
    User.deleteMany({}),
    Team.deleteMany({}),
    Tournament.deleteMany({})
  ]);

  console.log('Creating organizer + 4 captains...');
  const organizer = await User.create({
    name: 'Finnish Hockey Federation',
    email: 'organizer@finhockey.fi',
    password: PASSWORD,
    role: 'organizer',
    location: 'Helsinki'
  });

  const captains = await User.create([
    { name: 'Aleksi Virtanen', email: 'aleksi@finhockey.fi', password: PASSWORD, role: 'player', location: 'Helsinki', age: 28 },
    { name: 'Mikko Lahti',     email: 'mikko@finhockey.fi',  password: PASSWORD, role: 'player', location: 'Tampere',  age: 31 },
    { name: 'Eero Niemi',      email: 'eero@finhockey.fi',   password: PASSWORD, role: 'player', location: 'Oulu',     age: 25 },
    { name: 'Janne Korhonen',  email: 'janne@finhockey.fi',  password: PASSWORD, role: 'player', location: 'Espoo',    age: 27 }
  ]);

  console.log('Creating 5 special player accounts...');
  const specialPlayers = await User.create([
    { name: 'Usman Zulfiqar', email: 'usman.zulfiqar@finhockey.fi', password: PASSWORD, role: 'player', location: 'Helsinki', age: 23 },
    { name: 'Awais Ali',      email: 'awais.ali@finhockey.fi',      password: PASSWORD, role: 'player', location: 'Tampere',  age: 24 },
    { name: 'Rayyan Shakeel', email: 'rayyan.shakeel@finhockey.fi', password: PASSWORD, role: 'player', location: 'Oulu',     age: 22 },
    { name: 'Zawar',          email: 'zawar@finhockey.fi',          password: PASSWORD, role: 'player', location: 'Espoo',    age: 25 },
    { name: 'Usama',          email: 'usama@finhockey.fi',          password: PASSWORD, role: 'player', location: 'Helsinki', age: 26 }
  ]);

  console.log('Creating 55 Finnish player accounts...');
  const finnishUserDocs = [];
  for (let i = 0; i < 55; i++) {
    const first = FIRST_NAMES[i];
    const last = LAST_NAMES[i];
    finnishUserDocs.push({
      name: first + ' ' + last,
      email: normalizeEmailPart(first) + '.' + normalizeEmailPart(last) + '@finhockey.fi',
      password: PASSWORD,
      role: 'player',
      age: randAge()
    });
  }
  const finnishPlayers = await User.create(finnishUserDocs);


  const usmanZ      = specialPlayers[0];
  const awais       = specialPlayers[1];
  const rayyan      = specialPlayers[2];
  const zawar       = specialPlayers[3];
  const usama       = specialPlayers[4];

  const rosters = [
    {
      teamSpec: { name: 'Helsinki Frost', region: 'Helsinki', wins: 14, losses: 4, description: 'Founded 2019. Two-time regional champions.' },
      captain: captains[0],
      players: [captains[0], usmanZ, usama, ...finnishPlayers.slice(0, 13)]
    },
    {
      teamSpec: { name: 'Tampere Wolves', region: 'Tampere',  wins: 11, losses: 6, description: 'Hard-hitting team from central Finland.' },
      captain: captains[1],
      players: [captains[1], awais, ...finnishPlayers.slice(13, 27)]
    },
    {
      teamSpec: { name: 'Oulu Glaciers',  region: 'Oulu',     wins: 13, losses: 5, description: "Northern Finland's pride." },
      captain: captains[2],
      players: [captains[2], rayyan, ...finnishPlayers.slice(27, 41)]
    },
    {
      teamSpec: { name: 'Espoo Blades',   region: 'Espoo',    wins: 9,  losses: 8, description: 'Up-and-coming roster with strong defense.' },
      captain: captains[3],
      players: [captains[3], zawar, ...finnishPlayers.slice(41, 55)]
    }
  ];

  console.log('Creating teams with 16-player rosters...');
  const teams = [];
  for (const r of rosters) {
    const team = await Team.create({
      ...r.teamSpec,
      captain: r.captain._id,
      players: r.players.map(p => p._id)
    });

    // Update each player's teams[] array
    await Promise.all(r.players.map(p =>
      User.findByIdAndUpdate(p._id, { $addToSet: { teams: team._id } })
    ));

    teams.push(team);
    console.log(`  ${team.name} -> ${r.players.length} players`);
  }

  console.log('Creating tournaments...');
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;

  const tournaments = await Tournament.create([
    {
      title: 'Helsinki Winter Classic',
      description: "Finland's premier winter ice hockey tournament. 16-team single-elimination bracket over four days.",
      organizer: organizer._id,
      location: 'Helsinki, Finland',
      bannerImage: BANNER_1,
      format: 'single-elimination',
      startDate: new Date(now + 30 * day),
      endDate: new Date(now + 33 * day),
      registrationDeadline: new Date(now + 20 * day),
      maxTeams: 16,
      registeredTeams: [teams[0]._id, teams[1]._id],
      entryFee: 450,
      rules: 'IIHF rulebook applies for all matches.\nEach team must register a captain and an assistant captain.\nPlayers must be registered at least 48 hours before the first match.\nNo substitutions permitted after the quarterfinal round.\nDisciplinary committee decisions are final.',
      status: 'Open'
    },
    {
      title: 'Nordic Champions Cup',
      description: 'Round-robin tournament featuring the best teams from across the Nordic region.',
      organizer: organizer._id,
      location: 'Tampere, Finland',
      bannerImage: BANNER_2,
      format: 'round-robin',
      startDate: new Date(now + 60 * day),
      endDate: new Date(now + 65 * day),
      registrationDeadline: new Date(now + 50 * day),
      maxTeams: 12,
      registeredTeams: [teams[2]._id],
      entryFee: 600,
      rules: 'Standard IIHF rules.\nRound-robin format with playoff finals.',
      status: 'Open'
    },
    {
      title: 'Arctic League Finals',
      description: 'The season-closing championship for the Arctic League.',
      organizer: organizer._id,
      location: 'Oulu, Finland',
      bannerImage: BANNER_3,
      format: 'double-elimination',
      startDate: new Date(now + 100 * day),
      endDate: new Date(now + 105 * day),
      registrationDeadline: new Date(now + 90 * day),
      maxTeams: 16,
      registeredTeams: [teams[0]._id, teams[1]._id, teams[2]._id, teams[3]._id],
      entryFee: 750,
      rules: 'Open to top 16 teams by season standings.\nBest-of-three semifinals and finals.',
      status: 'Open'
    }
  ]);

  for (const t of tournaments) {
    t.updateAutoStatus();
    await t.save();
  }

  for (const team of teams) {
    for (const t of tournaments) {
      if (t.registeredTeams.some(id => String(id) === String(team._id))) {
        team.tournaments.addToSet(t._id);
      }
    }
    await team.save();
  }

  console.log('');
  console.log('========================================');
  console.log('Seed complete. Password for all = ' + PASSWORD);
  console.log('========================================');
  console.log('');
  console.log('Organizer:');
  console.log('  organizer@finhockey.fi');
  console.log('');
  console.log('Team captains (4):');
  console.log('  aleksi@finhockey.fi  -> Helsinki Frost');
  console.log('  mikko@finhockey.fi   -> Tampere Wolves');
  console.log('  eero@finhockey.fi    -> Oulu Glaciers');
  console.log('  janne@finhockey.fi   -> Espoo Blades');
  console.log('');
  console.log('Special player accounts (5):');
  console.log('  usman.zulfiqar@finhockey.fi  -> Helsinki Frost');
  console.log('  usama@finhockey.fi           -> Helsinki Frost');
  console.log('  awais.ali@finhockey.fi       -> Tampere Wolves');
  console.log('  rayyan.shakeel@finhockey.fi  -> Oulu Glaciers');
  console.log('  zawar@finhockey.fi           -> Espoo Blades');
  console.log('');
  console.log('Plus 55 Finnish players distributed across the four teams.');
  console.log('Each team has exactly 16 players.');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

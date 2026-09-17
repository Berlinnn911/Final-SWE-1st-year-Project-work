/*
 * Finland Ice Hockey Tournament Platform
 * File: models/Team.js
 * Author: Usman Zulfiqar (Team Module, Full Stack)
 * Purpose: Team Mongoose schema with join requests subdocument, captain
 *          reference, players list and tournament links.
 */

const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, maxlength: 300, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 60, index: true },
  logo: { type: String, default: '' },
  description: { type: String, maxlength: 800, default: '' },
  region: { type: String, required: true, trim: true, maxlength: 80 },
  captain: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinRequests: [joinRequestSchema],
  tournaments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }],
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 }
}, { timestamps: true });

teamSchema.virtual('initials').get(function () {
  return this.name
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('') || 'T';
});

teamSchema.set('toJSON', { virtuals: true });
teamSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Team', teamSchema);

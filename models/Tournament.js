/*
 * Finland Ice Hockey Tournament Platform
 * File: models/Tournament.js
 * Author: Awais (Tournament Module, Full Stack)
 * Purpose: Tournament Mongoose schema with format, dates, max teams,
 *          status logic (Open, Closing Soon, Closed, Cancelled) and auto status helper.
 */

const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120, index: true },
  description: { type: String, maxlength: 2000, default: '' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  location: { type: String, required: true, trim: true, maxlength: 120 },
  bannerImage: { type: String, default: '' },
  format: { type: String, enum: ['single-elimination', 'double-elimination', 'round-robin', 'group-stage'], default: 'single-elimination' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  maxTeams: { type: Number, required: true, min: 2, max: 64 },
  registeredTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  rules: { type: String, maxlength: 4000, default: '' },
  entryFee: { type: Number, default: 0 },
  status: { type: String, enum: ['Open', 'Closing Soon', 'Closed', 'Cancelled'], default: 'Open' }
}, { timestamps: true });

tournamentSchema.virtual('teamsCount').get(function () {
  return Array.isArray(this.registeredTeams) ? this.registeredTeams.length : 0;
});

tournamentSchema.virtual('isFull').get(function () {
  return this.teamsCount >= this.maxTeams;
});

tournamentSchema.virtual('formattedDate').get(function () {
  if (!this.startDate) return '';
  return this.startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
});

tournamentSchema.set('toJSON', { virtuals: true });
tournamentSchema.set('toObject', { virtuals: true });

tournamentSchema.methods.updateAutoStatus = function () {
  if (this.status === 'Cancelled' || this.status === 'Closed') return;
  if (this.isFull) {
    this.status = 'Closed';
    return;
  }
  if (this.registrationDeadline && this.registrationDeadline.getTime() < Date.now()) {
    this.status = 'Closed';
    return;
  }
  const remainingSlots = this.maxTeams - this.teamsCount;
  if (remainingSlots <= Math.max(1, Math.floor(this.maxTeams * 0.15))) {
    this.status = 'Closing Soon';
  } else {
    this.status = 'Open';
  }
};

module.exports = mongoose.model('Tournament', tournamentSchema);

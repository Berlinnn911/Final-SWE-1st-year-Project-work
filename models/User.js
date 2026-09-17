/*
 * Finland Ice Hockey Tournament Platform
 * File: models/User.js
 * Author: Zawal and Abdullah (Backend Architecture, Database and DevOps)
 * Purpose: User Mongoose schema with bcrypt password hashing and role support
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['player', 'organizer', 'admin'], default: 'player' },
  age: { type: Number, min: 13, max: 100 },
  location: { type: String, trim: true, maxlength: 80 },
  bio: { type: String, maxlength: 500, default: '' },
  profileImage: { type: String, default: '' },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  tournaments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }]
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSession = function () {
  return { _id: this._id, name: this.name, email: this.email, role: this.role };
};

module.exports = mongoose.model('User', userSchema);

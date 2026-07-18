'use strict';
const mongoose = require('mongoose');

const articleSnapshotSchema = new mongoose.Schema({
  articleId: { type: String, required: true },
  title: String,
  url: String,
  source: String,
  publishedAt: String,
  at: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  preferences: { type: [String], default: [] },
  readArticles: { type: [articleSnapshotSchema], default: [] },
  favorites: { type: [articleSnapshotSchema], default: [] },
}, { timestamps: true });

userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);

"use strict";
const mongoose = require("mongoose");
const Note = require("../note/note.model");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, unique: true },
    password: { type: String },
    avatar: { type: String, trim: true }, // stored path or URL to avatar image
  },
  { timestamps: true, versionKey: false }
);

// Cascade delete notes when user is removed
userSchema.pre("findOneAndDelete", async function (next) {
  try {
    const doc = await this.model.findOne(this.getFilter());
    if (doc) {
      await Note.deleteMany({ owner: doc._id });
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", userSchema);

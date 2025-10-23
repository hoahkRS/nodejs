const mongoose = require("mongoose");

("use strict");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    body: {
      type: String,
      default: "",
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Note", noteSchema);

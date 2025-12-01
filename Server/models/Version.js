const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const versionSchema = new Schema({
  note: { type: Schema.Types.ObjectId, ref: "Note", required: true },
  content: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Version", versionSchema);

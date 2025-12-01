const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      default: "Untitled Note",
    },
    content: {
      type: String,
      default: "",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["viewer", "editor"], default: "viewer" },
      },
    ],
    versions: [
      { type: Schema.Types.ObjectId, ref: "Version" }
    ],
  },
  { timestamps: true }
);

noteSchema.pre("save", async function () {
  
  this.title = this.title.trim();
  this.content = this.content.trim();
 
});


noteSchema.pre("remove", async function () {
  const Version = require("./Version");
  await Version.deleteMany({ note: this._id });
});

module.exports = mongoose.model("Note", noteSchema);

const Note = require("../models/Notes");
const Version = require("../models/Version");
const User = require("../models/User");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || "adityajainghetal@gmail.com",
    pass: process.env.SMTP_PASS || "your_smtp_password",
  },
});

// Create a new note
exports.createNote = async (req, res) => {
  const { title, content } = req.body;
  try {
    const note = new Note({
      title: title || "Untitled Note",
      content: content || "",
      owner: req.user._id,
      collaborators: [],
    });
    await note.save();
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }
};

// Get all notes of the user (owner or collaborator)
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [{ owner: req.user._id }, { "collaborators.user": req.user._id }],
    })
      .populate("owner", "name email")
      .sort({ updatedAt: -1 })
      .lean();
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }
};

// Get a single note by ID
exports.getNoteById = async (req, res) => {
  const noteId = req.params.id;
  try {
    const note = await Note.findById(noteId)
      .populate({
        path: "versions",
        options: { sort: { createdAt: -1 }, limit: 20 }, // last 20 versions
      })
      .populate("owner collaborators.user")
      .lean();

    if (!note) return res.status(404).json({ message: "Note not found" });

    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }
};

// Update a note (content or title)
exports.updateNote = async (req, res) => {
  const noteId = req.params.id;
  const { content, title } = req.body;

  try {
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Permission check
    const isOwner = note.owner.toString() === req.user._id.toString();
    const collaborator = note.collaborators.find(
      (c) => c.user.toString() === req.user._id.toString()
    );
    const canEdit = isOwner || (collaborator && collaborator.role === "editor");

    if (!canEdit)
      return res
        .status(403)
        .json({ message: "You don't have permission to edit" });

    // Save version
    const version = new Version({
      note: note._id,
      content: content !== undefined ? content : note.content,
      createdBy: req.user._id,
    });
    await version.save();
    note.versions.push(version._id);

    note.content = content !== undefined ? content : note.content;
    note.title = title !== undefined ? title : note.title;
    await note.save();

    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  const noteId = req.params.id;
  try {
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only owner can delete" });

    await Version.deleteMany({ note: note._id });
    await note.deleteOne();

    res.json({ message: "Note deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }
};

// Share a note with another user
exports.shareNote = async (req, res) => {
  const { noteId, email, role } = req.body;
  try {
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only owner can share" });

    const userToShare = await User.findOne({ email });
    if (!userToShare)
      return res.status(404).json({ message: "User to share with not found" });

    const existing = note.collaborators.find(
      (c) => c.user.toString() === userToShare._id.toString()
    );

    if (existing) {
      existing.role = role || existing.role;
    } else {
      note.collaborators.push({
        user: userToShare._id,
        role: role || "viewer",
      });
    }
    await note.save();

    // Send email notification (best-effort)
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: userToShare.email,
        subject: `A note was shared with you: ${note.title}`,
        text: `${req.user.name} shared a note with you. Open your dashboard to view it.`,
      });
    } catch (mailErr) {
      console.warn("Failed to send mail:", mailErr);
    }

    res.json({ message: "Shared" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }
};

// Get all versions of a note
exports.getVersions = async (req, res) => {
  const noteId = req.params.id;
  try {
    const versions = await Version.find({ note: noteId })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(versions);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }
};

// Restore a note to a specific version
exports.restoreVersion = async (req, res) => {
  const noteId = req.params.id;
  const { versionId } = req.body;
  try {
    const note = await Note.findById(noteId);
    const version = await Version.findById(versionId);
    if (!note || !version)
      return res.status(404).json({ message: "Not found" });

    note.content = version.content;
    await note.save();
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }
};

const express = require("express");
const router = express.Router();
const noteController = require("../controllers/notesController");
const { verifyAccessToken } = require("../middleware/authMiddleware");

router.post("/", verifyAccessToken, noteController.createNote);
router.get("/", verifyAccessToken, noteController.getNotes);
router.get("/:id", verifyAccessToken, noteController.getNoteById);
router.put("/:id", verifyAccessToken, noteController.updateNote);
router.delete("/:id", verifyAccessToken, noteController.deleteNote);
router.post("/share", verifyAccessToken, noteController.shareNote);
router.get("/:id/versions", verifyAccessToken, noteController.getVersions);
router.post("/:id/restore", verifyAccessToken, noteController.restoreVersion);

module.exports = router;

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const configuredRoot = process.env.UPLOADS_DIR || "uploads";
const uploadRoot = path.isAbsolute(configuredRoot)
  ? configuredRoot
  : path.join(process.cwd(), configuredRoot);
const avatarDir = path.join(uploadRoot, "avatars");
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const fileName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExts = new Set([".jpg", ".jpeg", ".png", ".gif"]);
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (!allowedExts.has(ext)) {
    return cb(new Error("Chỉ được upload ảnh (.jpg, .jpeg, .png, .gif)!"));
  }
  cb(null, true);
};

const maxSizeMb = Number(
  process.env.MAX_UPLOAD_SIZE_MB || process.env.MAX_AVATAR_SIZE_MB || 2
);
const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeMb * 1024 * 1024 }, // default 2MB
});

module.exports = { uploadImage, avatarDir };

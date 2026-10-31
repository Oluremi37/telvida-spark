const multer = require("multer");
const { MIME_TYPE_MAP } = require("../utils/mediaLimits");

// Files are held in memory and streamed straight to Cloudinary in the
// controller — nothing touches disk.
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (MIME_TYPE_MAP[file.mimetype]) {
    return cb(null, true);
  }
  cb(new Error(`Unsupported file type: ${file.mimetype}`));
}

// Hard ceiling at the multer layer (2GB — Enterprise's video allowance).
// Finer-grained, plan-aware limits per media type are enforced in the
// controller once we know the organization's plan.
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
});

module.exports = upload;

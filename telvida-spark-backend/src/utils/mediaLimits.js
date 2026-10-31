// Maps upload mimetypes to our internal media "type", and to which
// Cloudinary resource_type each should be stored/deleted under.
//
// Covers the PRD's supported formats (Section 6.B: JPG/PNG/WEBP images,
// MP4/AVI/MOV/MKV video, PDF documents, MP3/WAV audio, HTML content) plus
// PPTX/DOCX shown in the Figma "Upload Media" modal's supported-formats list.
const MIME_TYPE_MAP = {
  // images
  "image/jpeg": { type: "image", resourceType: "image" },
  "image/png": { type: "image", resourceType: "image" },
  "image/webp": { type: "image", resourceType: "image" },

  // video
  "video/mp4": { type: "video", resourceType: "video" },
  "video/quicktime": { type: "video", resourceType: "video" }, // .mov
  "video/x-msvideo": { type: "video", resourceType: "video" }, // .avi
  "video/x-matroska": { type: "video", resourceType: "video" }, // .mkv

  // documents
  "application/pdf": { type: "document", resourceType: "raw" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    type: "document",
    resourceType: "raw",
  }, // .pptx
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    type: "document",
    resourceType: "raw",
  }, // .docx
  "text/html": { type: "document", resourceType: "raw" },

  // audio (Cloudinary stores audio under the "video" resource type)
  "audio/mpeg": { type: "audio", resourceType: "video" }, // .mp3
  "audio/wav": { type: "audio", resourceType: "video" },
  "audio/x-wav": { type: "audio", resourceType: "video" },
};

function resolveMediaType(mimetype) {
  return MIME_TYPE_MAP[mimetype] || null;
}

// Bytes. PRD gives hard numbers only for images (10MB) and video
// (500MB, 2GB on Enterprise). Document/audio ceilings aren't specified
// in the PRD — set to sensible defaults pending product input.
function getLimitsForPlan(plan) {
  const MB = 1024 * 1024;
  const GB = 1024 * MB;

  return {
    image: 10 * MB,
    video: plan === "enterprise" ? 2 * GB : 500 * MB,
    document: 20 * MB,
    audio: 50 * MB,
  };
}

function formatBytes(bytes) {
  const MB = 1024 * 1024;
  const GB = 1024 * MB;
  if (bytes >= GB) return `${(bytes / GB).toFixed(1)}GB`;
  return `${Math.round(bytes / MB)}MB`;
}

module.exports = {
  MIME_TYPE_MAP,
  resolveMediaType,
  getLimitsForPlan,
  formatBytes,
};

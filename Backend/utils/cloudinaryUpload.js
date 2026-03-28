const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} fileName - Original file name
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<string>} - Image URL
 */
const uploadToCloudinary = (fileBuffer, fileName, folder = "swasthya-manas/profiles") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: `${Date.now()}-${fileName.split(".")[0]}`,
        resource_type: "auto",
        quality: "auto",
        fetch_format: "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    // Handle stream errors
    uploadStream.on("error", (error) => {
      reject(error);
    });

    // Convert buffer to readable stream and pipe to Cloudinary
    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

module.exports = { uploadToCloudinary };

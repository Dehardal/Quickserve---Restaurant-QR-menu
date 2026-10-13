/**
 * Image storage and processing helper.
 * Since Cloudinary is disabled, this helper handles and stores all images 
 * directly as base64 DataURLs in MongoDB, ensuring a completely self-contained setup.
 */

/**
 * Directly processes base64 images to be stored in the database.
 * @param {string} fileStr - Base64 representation of file
 * @returns {Promise<string>} - The base64 DataURL representation
 */
const uploadImage = async (fileStr) => {
  return fileStr || '';
};

module.exports = { uploadImage };

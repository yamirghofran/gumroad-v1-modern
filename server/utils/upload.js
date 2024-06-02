const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "gumroad-0",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const userId = req.user.userId; // Assuming `authMiddleware` sets `req.user`
      const url = req.body.url; // You need to generate this ID before uploading
      const filePath = `${userId}/${url}/${file.originalname}`;
      cb(null, filePath);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('files', 10); // Allow up to 10 files to be uploaded at once
module.exports = upload;

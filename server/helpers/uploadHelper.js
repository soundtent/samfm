const multer = require("multer");
var mime = require('mime-types');

const uploadMiddleware = function(req, res, next) {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, "public/"+process.env.USER_UPLOAD_DIRECTORY);
        },
        filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '.' + mime.extension(file.mimetype);
          cb(null, uniqueSuffix);
        }
    });

    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 5000000 // 5mb
        }
    }).any('upload');

    // Here call the upload middleware of multer
    upload(req, res, function (err) {

        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            const err = new Error('Multer error');
            next(err)
            } else if (err) {
            // An unknown error occurred when uploading.
            const err = new Error('Server Error')
            next(err)
        }
        // Everything went fine.
        next()
    });

    return upload;
};

module.exports = uploadMiddleware;
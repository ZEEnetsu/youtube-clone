import multer from "multer";
import crypto from "crypto";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, (err, buff) => {
      console.log(buff.toString("hex"));
      cb(null, buff.toString("hex") + file.originalname);
    });
  },
});

export const upload = multer({
  storage,
});

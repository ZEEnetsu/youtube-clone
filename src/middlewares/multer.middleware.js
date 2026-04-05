import multer from "multer";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomBytes(12).toString("hex"); // sync, no callback
    cb(null, uniqueSuffix + "_" + file.originalname);
  },
});

export const upload = multer({ storage });
import multer from "multer";
import crypto from "crypto";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "avatar") {
      cb(null, "./public/temp/avatars");
    } else if (file.fieldname === "coverImage") {
      cb(null, "./public/temp/coverImages");
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomBytes(12).toString("hex");
    cb(null, uniqueSuffix + "_" + file.originalname);
  },
});

export const upload = multer({ storage });
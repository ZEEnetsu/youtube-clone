import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, index: true },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    password: { type: String, required: true },
    avatar: { type: String },
    coverImage:{type:String},
    watchHistory: [{ type: Schema.Types.ObjectId, ref: "video" }],
    watchLater: [{ type: Schema.Types.ObjectId, ref: "video" }],
    likedVideos: [{ type: Schema.Types.ObjectId, ref: "video" }],
    dislikedVideos: [{ type: Schema.Types.ObjectId, ref: "video" }],
    subscribed: [{ type: Schema.Types.ObjectId, ref: "video" }],
    refreshToken: { type: String },
    searchHistory: { type: [String] },
  },
  { timestamps: true },
);

// async/await without next (modern, clean)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      email: this.email,
      name: this.name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
    },
  );
};
userSchema.methods.generateRefreshToken = function () {
  const token =  jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
    },
  );
  return token;
};


export const User = mongoose.model("User", userSchema);

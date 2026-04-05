import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, name, email, password } = req.body;

  if (
    [username, name, email, password].some((fields) => fields?.trim() === "")
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "User with the same username or email already exists",
    });
  }

  if (!req.files || !req.files.avatar) {
    throw res.status(400).json({
      success:false,
      message:"Avatar is required",
    });
  }
  if (!req.files || !req.files.avatar) {
    throw res.status(400).json({
      success:false,
      message:"Avatar is required",
    });
  }

  const avatarLocalPath = req.files.avatar[0].path;
  let coverImageLocalPath = "";
  if (req.files.coverImage && req.files.coverImage[0]) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadToCloudinary(coverImageLocalPath)
    : null;

  const user = await User.create({
    name: req.body.name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    avatar: avatar,
    coverImage: coverImage || "",
  });

  const createdUser = await User
    .findById(user._id)
    .select("-password -refreshToken");
  if (!createdUser) {
    return res.status(500).json({
      success: false,
      message: "Internal server error, user creation failed",
    });
  }
  return res
    .status(201)
    .json(new ApiResponce(200, "User registered successfully", createdUser));
});

export { registerUser };

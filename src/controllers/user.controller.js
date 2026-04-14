import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/apiError.js";

const generateAccessAndRefreshTokens = async (user) => {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    const err = new Error("Token generation failed : " + error.message);
    err.statusCode = 500;
    throw err;
  }
};

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
    return res.status(400).json({
      success: false,
      message: "Avatar is required",
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
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    avatar: avatar,
    coverImage: coverImage || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
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

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!email && !username) {
    return res.status(401).json({
      success: false,
      message: "email or username must be required",
    });
  }

  const userFound = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!userFound) {
    return res.status(404).json({
      success: false,
      message: "User not found, create an account",
    });
  }

  const isPasswordMatch = await userFound.comparePassword(password);
  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(userFound);
  const userData = await User.findById(userFound._id).select(
    "-password -refreshToken",
  );
  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("refereshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponce(200, "User logged in successfully", {
        accessToken,
        user: userData,
      }),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: null } },
    { new: true },
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponce(200, "User Logged out successfully", null));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incommingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incommingRefreshToken) {
      return new ApiError(401, "Unauthorized request - refresh token missing");
    }
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const user = await User.findById(decodedToken._id);
    if (!user) {
      return new ApiError(401, "Unauthorized request - user not found");
    }
    if (incommingRefreshToken !== user?.refreshToken) {
      return new ApiError(401, "Unauthorized request - invalid refresh token");
    }
    const cookieOption = { httpOnly: true, secure: true };
    const { accessToken, newRefreshToken: refreshToken } =
     await generateAccessAndRefreshTokens(user);

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOption)
      .cookie("refreshToken", refreshToken, cookieOption)
      .json(
        new ApiResponce(200, "Access Token refreshed succesfully", {
          accessToken,
          refreshToken,
        }),
      );
  } catch (error) {
    throw new ApiError(
      401,
      "unauthorized request - " + error.message ||
        "unknow request during token refresh",
    );
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };

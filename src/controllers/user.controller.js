import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import uploadToCloudinary from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/apiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
  // Registration logic here

  const { fullName, username, email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  if (
    [fullName, username, email, password].some((field) => !field || field.trim() === '')
  ) {
    throw new ApiError(400, 'All fields are required and must be non-empty strings');
  }

  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Invalid email format');
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new ApiError(400, 'Username already exists, please choose another one');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User already exists with this email, please login');
  }

  const avatarLocalFile = req.files?.avatar?.[0].path;
  const coverImageLocalFile = req.files?.coverImage?.[0].path;

  if (!avatarLocalFile) {
    throw new ApiError(400, 'Avatar image is required');
  }

  const avatarUrl = await uploadToCloudinary(avatarLocalFile);
  const coverImageUrl = coverImageLocalFile
    ? await uploadToCloudinary(coverImageLocalFile)
    : null;

  if (!avatarUrl) {
    throw new ApiError(500, 'Failed to upload avatar image');
   }

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatarUrl.url,
    coverImage: coverImageUrl?.url || "",
  });

  const createdUser = await User.findById(user._id).select('-password -refreshToken');

  if (!createdUser) {
    throw new ApiError(500, 'User creation failed');
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser,'User registered successfully!')
  );
});

export { registerUser };
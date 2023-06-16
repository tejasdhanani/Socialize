const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

//
// @desc       Register new User
// @route      POST  /api/users
// @access     Public
const registerUser = asyncHandler(async (req, res) => {
  // Get user data from the request
  const { name, email, password } = req.body;

  // If all the required fields are not passed
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // If user already exists in the database
  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error("User Already Exists!");
  }

  // If user does not user exists, hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create a user in the database
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // If the user has been successfully created then send response to the request
  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  }
  // If the user has not been created then throw an error
  else {
    res.status(400);
    throw new Error("Could not register the user");
  }
});

//
// @desc       Login User
// @route      POST  /api/users/login
// @access     Public
const loginUser = asyncHandler(async (req, res) => {
  // Get user data from the request
  const { email, password } = req.body;

  // If all the required fields are not passed
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // Finding user in the database
  const user = await User.findOne({ email });

  // If the user is not found in the database
  if (!user) {
    res.status(400);
    throw new Error("User does not exists!");
  }
  // Else user must exists in the database

  // If user supplied correct password
  if (await bcrypt.compare(password, user.password)) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  }
  // Else the user is not in the database or passwords do not match
  else {
    res.status(400);
    throw new Error("Incorrect password supplied!");
  }
});

//
// @desc       Get User Data
// @route      GET  /api/users/me
// @access     Private
const getMe = asyncHandler(async (req, res) => {
  // Get the user from the database by req.user.id params which comes from the token authMiddleware
  const { _id, name, email } = await User.findById(req.user.id);

  // Send the current user data as a response
  res.status(200).json({
    id: _id,
    name,
    email,
  });
});

//
// @desc       Change user password
// @route      POST  /api/users/changepassword
// @access     Private
const changePassword = asyncHandler(async (req, res) => {
  // Get the userId from the token in authMiddleware
  const userId = req.user.id;

  // Get the passwords from request body
  const { currentPassword, newPassword } = req.body;

  // If all the required fields are not passed
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Current password and new password are required feilds.");
  }

  // Retrieve the user from the database
  const user = await User.findById(userId);

  // Authenticate the user by checking if the currentPassword is=to thier stored password
  if (await bcrypt.compare(currentPassword, user.password)) {
    // Hash password the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the new hashedPassword
    await User.updateOne(
      { _id: userId },
      {
        password: hashedPassword,
      }
    );

    res.status(201).json({
      message: "Password changed successfully.",
    });
  } else {
    res.status(400);
    throw new Error("Invalid current password!");
  }
});

//
// @desc       Delete User
// @route      DELETE  /api/users/
// @access     Private
const deleteUser = asyncHandler(async (req, res) => {
  // If the user does not exists
  if (!req.user) {
    res.status(400);
    throw new Error("User does not exists!");
  }

  // Delete the user from the database
  await User.findByIdAndDelete(req.user.id);

  res.status(200).json({
    message: `User ${req.user.email} account deleted successfully.`,
  });
});

// Generate JsonWebToken which expires in 30days
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  changePassword,
  deleteUser,
};

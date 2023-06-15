const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc       Register new User
// @route      POST  /api/users
// @access     Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User Already Exists!");
  }

  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // create a user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error("Could not register the user");
  }

  res.json({
    message: "Register user",
  });
});

// @desc       Authenticate new User
// @route      POST  /api/users/login
// @access     Public
const loginUser = asyncHandler(async (req, res) => {
  res.json({
    message: "Login user",
  });
});

// @desc       Get User Data
// @route      GET  /api/users/me
// @access     Public
const getMe = asyncHandler(async (req, res) => {
  res.json({
    message: "Get user",
  });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
};

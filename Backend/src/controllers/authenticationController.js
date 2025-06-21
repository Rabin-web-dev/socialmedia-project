const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const User = require("../models/user");
const Profile = require("../models/profile");



//Signup Controller
const signup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, isAdmin, gender, name  } = req.body;

    try {
        let user = await User.findOne({ $or: [{ email }, { username: username.toLowerCase() }] });
        if (user) {
            return res.status(400).json({ message: "Email or username already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const adminStatus = isAdmin === "true" || isAdmin === true ;

        user = new User({
            name,
            username: username.toLowerCase(),
            email,
            password: hashedPassword,
            gender,
            isAdmin: adminStatus,
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id ,isAdmin: user.isAdmin || false, username: user.username },
             process.env.JWT_SECRET, 
            { expiresIn: "7d"}
        );

        res.status(201).json({ token, userId: user.id, isAdmin: user.isAdmin, message: "Signup successful" });
    } catch (error) {
        console.error( "Signup Error" ,error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}; 

// Login Controller
const login = async (req, res) => {
    const { identifier, password } = req.body; 
  
    try {
      // Check if input is an email using regex
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  
      // Find user by either email or username
      const user = await User.findOne(
        isEmail ? { email: identifier } : { username: identifier.toLowerCase() }
      );

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid username/email or password" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid username/email or password" });
      }
  
      const token = jwt.sign(
        { userId: user._id,
         username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const profile = await Profile.findOne({ "user._id": user._id });
  
      res.json({
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          gender: user.gender,
          followers: user.followers,
          following: user.following,
          profileCreated: user.profileCreated,
          createdAt: user.createdAt,
        },
        message: "Login successful",
      });
    } catch (error) {
      console.error("Login error:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
module.exports = { signup, login };
const express = require("express");
const { check } = require("express-validator");
const { signup, login } = require("../controllers/authenticationController.js");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const crypto = require("crypto");
require("dotenv").config();

const router = express.Router();

//Signup Route
router.post(
    "/signup",
    [
        check("username", "Username is required").not().isEmpty(),
        check("name", "name is required").not().isEmpty(),
        check("email", "Valid email is required").isEmail(),
        check("password", "Password must be atleast 6 characters").isLength({ min: 6 }),
    ],
    signup
);

//Login Route
router.post("/login", login);

//start Google Authentication
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);    

//Google OAuth Callback
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Authentication failed" });
            }

            if (!req.user._id) {
                return res.status(500).json({ message: "User ID missing. Cannot generate token." });
            }

            // Generate JWT Token
            const token = jwt.sign(
                { userId: req.user._id, isAdmin: req.user.isAdmin || false, username: req.user.username },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.redirect(`http://localhost:3000/dashboard?token=${token}`);
        } catch (error) {
            console.error("Google OAuth Callback Error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);


//Logout
router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.clearCookie("token");
        res.redirect("/");
    });
});


//Email transporter configurations
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP connection Error:", error);
    } else {
        console.log("SMTP connected successfully");
    }
});


//Request password reset route
router.post("/forget-password", async (req, res) => {
    try {
        console.log("Forget password API hit");

        const { email } = req.body;

        if (!email) { 
            return res.status(400).json({ error: "Email is required" });
        }
        console.log("Searching for user with email:", email);
       
        //Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        console.log("User found:", user.email);
        
        const resetToken = crypto.randomBytes(32).toString("hex");
        console.log("Generated Reset Token:", resetToken);
        
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();
        
        //Send reset email
        const resetLink = `http://localhost:5000/api/auth/reset-password/${resetToken}`;
        console.log("Reset Link:", resetLink);

        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: "marteena906@gmail.com",
            //to: email,
            subject: "Password Reset Request",
            html: `<p> Click <a href = "${resetLink}"> here </a> to reset your password.This link is valid for 15 minutes. </p>`,
        });

        console.log("Password reset email sent successfully");
        res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        console.log("forget password error",error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//Reset password Route
router.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        //Find user by reset token and check if it's not expired
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid orexpired token" });
        }

        //Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        //Clear reset token and expiry time after successful reset 
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Error in reset password:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router ;
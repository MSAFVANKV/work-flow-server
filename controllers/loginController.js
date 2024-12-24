import asyncHandler from "../middlewares/asyncHandler.js";
import fs from "fs";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import User from "../models/userModel.js";
import otpCollection from "../models/otp.js";
import wishlistCollection from "../models/wishlist.js";
import mongoose from "mongoose";

import jwt from "jsonwebtoken";

import path, { dirname } from "path";
import { Http2ServerRequest } from "http2";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Path to the data.json file, using __dirname to correctly resolve the path
const filepath = path.join(__dirname, "../services/data.json");

// Read the data from the file
const getDataFromFile = () => {
  const fileContents = fs.readFileSync(filepath, "utf-8");
  return JSON.parse(fileContents);
};

// Save data to the file
const saveDataToFile = (data) => {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
};

// export const loginUser = async (req, res) => {
//   const { email } = req.body;
//   console.log(email,'email');
//     if (!email) {
//     return res.status(400).json({ message: "Email is required" });
//   }
// }

// export const loginUser = async (req, res) => {
//   const { email } = req.body;
//   console.log(email,'email');

//   if (!email) {
//     return res.status(400).json({ message: "Email is required" });
//   }

//   try {
//     // Get the existing data from the file
//     const data = getDataFromFile();

//     // Check if the email already exists in the data file
//     const existingUser = data.find((user) => user.email === email);
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already exists." });
//     }

//     // Generate OTP (6 digits)
//     const tempOTP = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

//     // Save the email and OTP to the data.json file
//     const newUser = {
//       email: email.toLowerCase(),
//       otp: tempOTP,
//     };
//     data.push(newUser);
//     fs.writeFileSync(filepath, JSON.stringify(data));
//     // saveDataToFile(data); // Save the updated data to the file

//     // Set up the Nodemailer transporter
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: process.env.SMTP_PORT,
//       secure: false, // Use true if you're using SSL
//       auth: {
//         user: process.env.SMTP_MAIL,
//         pass: process.env.SMTP_PASSWORD,
//       },
//     });

//     // Set up the email options
//     const mailOptions = {
//       from: process.env.SMTP_MAIL,
//       to: email,
//       subject: "OTP Verification for Signup",
//       html: `<h1>OTP</h1><p>Your OTP for signup is: <strong>${tempOTP}</strong></p><p>Enter the OTP to complete your registration.</p>`,
//     };
//     console.log(process.env.SMTP_HOST,'SMTP_HOST');

//     // Send the email with the OTP
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.log("OTP sending error: ", error);
//         return res.status(500).json({ message: "Failed to send OTP. Please try again later." });
//       } else {
//         console.log("OTP sent successfully to ", email);
//         return res.status(200).json({ message: "OTP sent successfully to your email." });
//       }
//     });
//     const info = await transporter.sendMail(mailOptions);
//     console.log("OTP sent successfully to ", email);
//     return res.status(200).json({ message: "OTP sent successfully to your email." });
//   } catch (error) {
//     console.error("Error: ", error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };
export const loginUser = async (req, res) => {
  const { email } = req.body;

  try {
    // ✅ 1. Check if the user already exists
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      // 🔑 Generate JWT token for existing user
      const token = jwt.sign(
        { email: email, userId: existingUser._id },
        process.env.JWT_SECRET_USER,
        { expiresIn: "30d" }
      );

      // 🔒 Set token in cookie
      res.cookie("wf-tkn", token, {
        secure: process.env.NODE_ENV === "production",
        // httpOnly: true,
        sameSite: "Strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      return res.status(200).json({
        message: "Login successful. Welcome back!",
        token,
        email,
      });
    }

    // ✅ 2. Check if OTP already exists
    const existingOtp = await otpCollection.findOne({ email: email });
    if (existingOtp) {
      return res
        .status(400)
        .json({ message: "OTP already sent to this email. Please check your inbox." });
    }

    // ✅ 3. Generate OTP for new user
    const tempOTP = Math.floor(Math.random() * (99999 - 10000 + 1)) + 25385;

    const newOtp = new otpCollection({
      email: email.toLowerCase(),
      otp: tempOTP,
    });

    await newOtp.save();

    // ✅ 4. Send OTP via Email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: "OTP Verification for Signup",
      html: `<h1>OTP Verification</h1><p>Your OTP is: <strong>${tempOTP}</strong></p><p>Enter this OTP to complete your registration.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("OTP sending error: ", error);
      } else {
        console.log("OTP sent successfully:", tempOTP);
      }
    });

    // ✅ 5. Generate Token for OTP verification
    const token = jwt.sign({ email: email }, process.env.JWT_SECRET_USER, {
      expiresIn: "1h",
    });

    return res.status(201).json({
      message: "OTP sent successfully to your email.",
      token,
    });
  } catch (error) {
    console.error("Login Error: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyOTP = async (req, res) => {
  const { otp, token } = req.body; // Expect both OTP and token from the frontend
  console.log("OTP:", otp);

  try {
    // ✅ 1. Validate Inputs
    if (!otp || !token) {
      return res.status(400).json({ message: "OTP and token are required" });
    }

    // ✅ 2. Decode Email from Token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_USER);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const { email } = decoded;
    console.log("Decoded email from token:", email);

    if (!email) {
      return res.status(400).json({ message: "Invalid token payload" });
    }

    // ✅ 3. Check if the OTP is correct
    const savedOTP = await otpCollection.findOne({ email, otp });

    if (!savedOTP) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // ✅ 4. Save or Update User
    let user = await User.findOne({ email });
    if (!user) {
      // If the user does not exist, create a new user
      user = new User({
        email,
        wishlist: null, // Initialize wishlist
      });
      await user.save();
    }

    // ✅ 5. Create Wishlist if Not Exists
    if (!user.wishlist) {
      const newWishlist = new wishlistCollection({
        customer: new mongoose.Types.ObjectId(user._id),
      });

      await newWishlist.save();

      await User.findByIdAndUpdate(user._id, {
        $set: { wishlist: new mongoose.Types.ObjectId(newWishlist._id) },
      });
    }

    // ✅ 6. Remove the OTP record after successful verification
    await otpCollection.deleteOne({ email });

    const authToken = jwt.sign(
      { email: email, userId: user._id },
      process.env.JWT_SECRET_USER,
      { expiresIn: "30d" }
    );

    res.cookie("wf-tkn", authToken, {
      secure: process.env.NODE_ENV === "production",
      // domain: ".uracca.com",
      // httpOnly: true,
      sameSite: "Strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res
      .status(200)
      .json({ message: "OTP verified and user updated successfully", email });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

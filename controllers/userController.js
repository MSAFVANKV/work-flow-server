// controllers/userController.js

import asyncHandler from "../middlewares/asyncHandler.js";
import User from "../models/userModel.js";

// Controller to get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    // Fetch all users from the User collection
    const users = await User.find();

    if (!users) {
      return res.status(404).json({ message: "No users found." });
    }

    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


export const getLoggedInUser = asyncHandler(async (req, res) => {
    try {
      // The user information is attached to the request by the 'protect' middleware
      const user = req.user;
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      return res.status(200).json({ user,success: true });
    } catch (error) {
      console.error("Error fetching logged-in user:", error);
      return res.status(500).json({ message: "Internal Server Error" , success: false });
    }
  });

  // =================================================================
  export const logoutCurrentUser = asyncHandler(async (req, res) => {
    try {
      res.clearCookie("wf-tkn", {
        path: "/",
        // domain: ".uracca.com",
        secure: process.env.NODE_ENV === "production",
        // httpOnly: true,
        sameSite: "Strict",
      });
  
      res.clearCookie("connect.sid", {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });
  
      res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
      console.error("Error during user logout:", error);
      res.status(500).json({ message: "An error occurred during logout" });
    }
  });
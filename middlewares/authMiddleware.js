import jwt from "jsonwebtoken";
import User from "../models/userModel.js";


const authenticateUser = async (req, res, next) => {
  let token = req.cookies["wf-tkn"] ||(req.headers.authorization && req.headers.authorization.split(" ")[1]);

  console.log("user token:", token);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_USER);
    req.user = await User.findById(decoded.userId);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user not found.",
      });
    }

    if (req.user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "User is blocked.",
      });
    }

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authorized, token failed.",
      error: error.message,
    });
  }
};



export { authenticateUser, };

// Import Mongoose
import mongoose from "mongoose";

const useSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    wishlist: {
      type: mongoose.Types.ObjectId,
      ref: "Wishlist",
    },

    // password: {
    //   type: String,
    //   required: true,
    // },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", useSchema);

export default User;

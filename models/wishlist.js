import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Types.ObjectId,
    ref: "UserDetails",
  },
  products: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Products",
    },
  ],
});

const wishlistCollection = mongoose.model("Wishlist", wishlistSchema);

export default wishlistCollection;

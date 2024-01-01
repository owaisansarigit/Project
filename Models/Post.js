const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",  // Correct the reference to "Comment" here
    },
  ],
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;

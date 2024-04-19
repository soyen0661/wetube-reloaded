import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true, maxLength: 20 },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  createdAt: { type: Date, required: true, default: Date.now },
  video: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Video" },
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;

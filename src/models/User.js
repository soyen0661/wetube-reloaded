import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, unique: true },
  avatarUrl: String,
  SocialOnly: { type: Boolean, default: false },
  username: { type: String, required: true, trim: true, unique: true },
  password: { type: String, trim: true },
  name: { type: String, required: true },
  location: String,
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
    console.log("Hash Password!!!!!!!!!!!!!!!!!!!");
  }
});

const userModel = mongoose.model("User", userSchema);
export default userModel;

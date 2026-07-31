import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "A username is required"],
      trim: true,
      minlength: 2,
      maxlength: 30,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "An email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "That doesn't look like a valid email"],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Poem",
      },
    ],
  },
  { timestamps: true }
);

userSchema.statics.hashPassword = (plain) => bcrypt.hash(plain, 10);

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);

export default User;

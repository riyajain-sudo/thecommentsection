import mongoose from "mongoose";

const poemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "Untitled",
    },
    body: {
      type: String,
      required: [true, "A poem needs some words"],
      trim: true,
      maxlength: 6000,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The poem is always tied to the account that wrote it (so the author
    // can manage it and see it in "My poems"), but isAnonymous controls
    // whether that identity is shown to other readers.
    isAnonymous: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) =>
        tags
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
          .slice(0, 5),
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

poemSchema.index({ title: "text", body: "text" });

// currentUserId is optional — pass it in to get isOwner / likedByMe flags
// relative to whoever is asking.
poemSchema.methods.toPublicJSON = function (currentUserId) {
  const authorDoc = this.author && this.author.username ? this.author : null;

  return {
    id: this._id,
    title: this.title,
    body: this.body,
    isAnonymous: this.isAnonymous,
    authorName: this.isAnonymous ? "" : authorDoc?.username || "",
    tags: this.tags,
    likes: this.likedBy.length,
    likedByMe: currentUserId
      ? this.likedBy.some((id) => id.toString() === currentUserId.toString())
      : false,
    isOwner: currentUserId
      ? (this.author._id || this.author).toString() === currentUserId.toString()
      : false,
    createdAt: this.createdAt,
  };
};

const Poem = mongoose.model("Poem", poemSchema);

export default Poem;

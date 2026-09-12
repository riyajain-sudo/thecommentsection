import app from "./app.js";
import connectDB from "./config/db.js";

connectDB().catch((err) => {
  console.error("Could not start the server:", err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

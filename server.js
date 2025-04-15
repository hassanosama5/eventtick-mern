const app = require("./app");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

// server.js
mongoose
  .connect("mongodb://localhost:27017/online-event-ticketing-system")
  .then(() => {
    console.log(" MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Connection failed:", err);
    process.exit(1);
  });

// mongoose
// .connect(process.env.MONGO_URI || LOCAL_DB)
// .then(() => {
//   console.log("✅ MongoDB connected");
//   app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// })
// .catch((err) => {
//   console.error("❌ MongoDB connection failed:", err.message);
//   process.exit(1); // Exit if DB connection fails
// });

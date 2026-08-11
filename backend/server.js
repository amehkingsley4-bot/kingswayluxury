const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");

const bookingRoutes = require("./routes/bookings");

const app = express();


// ================================
// MIDDLEWARE
// ================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// ================================
// MONGODB CONNECTION
// ================================

mongoose
  .connect("mongodb://127.0.0.1:27017/kingswayluxury")
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });


// ================================
// BOOKING API
// ================================

app.use("/api/bookings", bookingRoutes);


// ================================
// FRONTEND
// ================================

const frontendPath = path.join(__dirname, "..", "frontend");

console.log("Serving frontend from:", frontendPath);

app.use(express.static(frontendPath));


// ================================
// HOMEPAGE
// ================================

app.get("/", (req, res) => {

  res.sendFile(
    path.join(frontendPath, "index.html")
  );

});


// ================================
// START SERVER
// ================================

const PORT = 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on http://127.0.0.1:${PORT}`
  );

});
const express = require("express");
const path = require("path");

const app = express();

// ✅ Serve frontend files (HTML, CSS, JS)
const frontendPath = path.join(__dirname, "..", "frontend");

console.log("Serving frontend from:", frontendPath);

app.use(express.static(frontendPath));

// ✅ Route for homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ✅ Start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
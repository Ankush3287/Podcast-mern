require("dotenv").config();
const express = require("express");
const app = express();
const router = require("./routes");
const dbConnect = require("./database");
const cors = require("cors");
const cookieParser = require("cookie-parser");

/**Cookie-parser */
app.use(cookieParser());

const corsOption = {
  credentials: true,
  origin: ["http://localhost:3000"],
};
app.use(cors(corsOption));

app.use("/storage", express.static("storage")); //Middleware to serve static files from storage folder

const PORT = process.env.PORT || 5000;

/**Database Connection */
dbConnect();

app.use(express.json({ limit: "8mb" }));

app.use(router);

app.get("/", (req, res) => {
  res.send("Hello from expressjs");
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import router from "./routes/index.js";

const { PORT, MONGODB_URL, FRONTEND_URL } = process.env;

const app = express();

if (!PORT || !MONGODB_URL || !FRONTEND_URL) {
  console.error("no env var");
  process.exit();
}

mongoose.connect(MONGODB_URL);

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to MongoDB");
});

app.use(express.json());

app.use(
  cors({
    origin: [FRONTEND_URL],
  }),
);

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`listening at http://localhost:${PORT}`);
});

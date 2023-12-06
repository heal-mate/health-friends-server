import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import bodyParser from "body-parser";
import router from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";

// web push를 위한 Firebase Cloud Message 초기화 시작
import admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import serviceAccount from "../service-account-file.json" assert { type: "json" };
// The requested module 'firebase-admin' is a CommonJS module, which may not support all module.exports as named exports.
// CommonJS modules can always be imported via the default export
const { credential } = admin;
initializeApp({
  credential: credential.cert(serviceAccount),
});
// web push를 위한 Firebase Cloud Message 초기화 끝

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
app.use(cookieParser());

app.use(
  cors({
    origin: [FRONTEND_URL],
    credentials: true,
  }),
);
app.use(bodyParser.json());
app.use("/api", router);

// 오류처리 미들웨어
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`listening at http://localhost:${PORT}`);
});

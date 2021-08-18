import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";

// temporary until implementing config module
dotenv.config();

// App
const app = express();

// Essential middlewares
app.use(express.json()); // parse json body
app.use(cors()); // allowing Cross-Origin Resource Sharing
app.use(helmet()); // setting various header for security purposes

// Health Check
app.get("/healthcheck", (_, res) => res.status(200).end());

const { HOST, PORT } = process.env;
app.listen(PORT, () => {
  console.log(`running on http://${HOST}:${PORT}`);
});

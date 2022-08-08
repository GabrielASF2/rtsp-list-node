import express from "express";
import { router } from "./routes";
import dotenv from "dotenv/config.js";
const bodyParser = require('body-parser');


const app = express();

app.use(router);
app.use(bodyParser.raw())

app.listen (3000, () => console.log("Server is running"));
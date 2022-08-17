import express from "express";
import { router } from "./routes";
var bodyParser = require('body-parser');


const app = express();

app.use(router);


app.listen (3000, () => console.log("Server is running"));
import express, { json } from "express";

import { checking } from "../testcase/test.js";

const app = express();

app.use(express.json());


app.get("/user-detail", checking);

app.get("/", (req, res) => {
    res.send("API is running Perfectally ")
});


export default app;
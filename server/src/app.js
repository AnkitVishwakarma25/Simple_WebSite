import express, { json } from "express";

import { checking, testsavepassword, getallusers, validatepassword } from "../testcase/test.js";  //For test-case

import authroutes from "./routes/auth.routes.js"

const app = express();

app.use(express.json());


//app.get("/user-detail", checking);   //For test-case

app.get("/", (req, res) => {

    res.send("API is running Perfectally ")

});




//app.get("/user-save", testsavepassword); //for testing updated User Model code 

//app.get("/allusers", getallusers);    //for testing 

//app.post("/validatepassword", validatepassword);  //for testing 



app.use("/api/auth", authroutes);




export default app;
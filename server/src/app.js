import express, { json } from "express";

import { checking, testsavepassword, getallusers, validatepassword } from "../testcase/test.js";  //For test-case

import authroutes from "./routes/auth.routes.js"
import protectedRoutes from "./routes/protected.routes.js"

import cookieParser from "cookie-parser"


const app = express();

app.use(express.json());

app.use(cookieParser());


//app.get("/user-detail", checking);   //For test-case

app.get("/", (req, res) => {

    res.send("API is running Perfectally ")

});






//app.get("/user-save", testsavepassword); //for testing updated User Model code 

//app.get("/allusers", getallusers);    //for testing 

//app.post("/validatepassword", validatepassword);  //for testing 



app.use("/api/auth", authroutes);

app.use("/api/protected", protectedRoutes);


export default app;
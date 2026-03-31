import dotenv from "dotenv";
import express from "express";
import connectDB from "./db/index.js";
dotenv.config({ path: "./.env" });
const PORT = process.env.PORT || 8000;
const app = express();

app.get("/",(req,res)=>{
   res.send("welcome to youtube clone backend");
})

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is running at port : ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`mongoDB connection failed : `, err);
  });

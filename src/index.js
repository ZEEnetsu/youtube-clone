import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config({ path: "./.env" });
const PORT = process.env.PORT || 8000;
import {app} from "./app.js"

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

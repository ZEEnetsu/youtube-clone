// index.js
import "dotenv/config"; // ✅ this loads .env immediately as part of the import phase

import connectDB from "./db/index.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("welcome to youtube clone backend");
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is running at port : ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`mongoDB connection failed : `, err);
  });

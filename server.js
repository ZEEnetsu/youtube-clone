import express from 'express'
const app = express();

const PORT = 3000;

app.get("/",(req,res)=>{
    res.send("Hello from server");
})
app.listen(PORT,()=>{
    console.log(`server is running at port - ${PORT}`);
})
import express from "express"

const app = express();


app.get("/", ()=>{
    console.log("This is get methord")
})

app.listen(5000, async()=>{
    console.log("server is running")
})
import express from "express";

const app = express()

app.use(express.json())

app.listen("/",(req , res)=>{
    res.json({status: "ok"})
})

export default app;
const express=require('express');
const cors = require("cors");
require("dotenv").config();
const app=express();
app.use(cors());
app.use(express.json());

// Test API
app.get("/", (req, res) => {
    res.json({
        message: "Autonomous Dependency Patcher Backend is Running!"
    });
});

const PORT= process.env.PORT || 5000;
app.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}`);
})

import express from "express";
import path from "path";
import { client } from "../models/database.js";
import { timeOut } from "../models/data-service.js";

const router = express.Router();
const currentDir = process.cwd();

router.post("/time-out", authenticateUser, async (req, res) => {
    const userId = req.body.userId;

    try {
        await timeOut(client, userId);
        res.status(200).json({message: "Time-out recorded successfully"})
    } catch (e) {
        console.error(e);
        res.status(500).json({message: "Internal Server Error"})
    }
});

router.get("/time-out", authenticateUser, (req, res) => {
    res.sendFile(path.resolve(currentDir, 'views', 'time-out.html'))
})

export default router;
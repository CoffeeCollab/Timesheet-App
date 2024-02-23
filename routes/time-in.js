import express from "express";
import path from "path";
import { client, authenticateUser } from "../models/database.js";
import { timeIn } from "../models/data-service.js";

const router = express.Router();
const currentDir = process.cwd();

router.post("/time-in", authenticateUser, async (req, res) => {
    const userId = req.body.userId;

    try {
        await timeIn(client, userId);
        res.status(200).json({ message: "Time-in recorded successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


router.get("/time-in", authenticateUser, (req, res) => {
    res.sendFile(path.resolve(currentDir, 'views', 'time-in.html'));
});

export default router;
import express from "express";
import path from "path";
import { client } from "../data-services/database.js";
import { timeIn, timeOut } from "../data-services/data-service.js";

const router = express.Router();
const currentDir = process.cwd();

router.post("/time-in", async (req, res) => {
    const userId = req.body.userId;

    try {
        await timeIn(client, userId);
        res.status(200).json({ message: "Time-in recorded successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/time-out", async (req, res) => {
    const userId = req.body.userId;

    try {
        await timeOut(client, userId);
        res.status(200).json({message: "Time-out recorded successfully"})
    } catch (e) {
        console.error(e);
        res.status(500).json({message: "Internal Server Error"})
    }
});

router.get("/time-in", (req, res) => {
    res.sendFile(path.resolve(currentDir, 'views', 'time-in.html'));
});

router.get("/time-out", (req, res) => {
    res.sendFile(path.resolve(currentDir, 'views', 'time-out.html'))
})

router.get('/', (req, res) => {
    res.sendFile(path.resolve(currentDir, 'views', 'index.html'));
});

export default router;

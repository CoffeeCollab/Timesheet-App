import express from "express";
import path from "path";
import { client } from "../modules/database.js";
import { timeIn, timeOut, deleteUserById, createUser } from "../modules/data-service.js";

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

// Route to handle creating a new user
router.post("/create-user", async (req, res) => {
    const newUser = req.body;

    try {
        await createUser(client, newUser);
        res.status(200).json({ message: "User created successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete("/delete/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        console.log(`Deleting user with ID: ${userId}`);
        // Call the deleteUserById function from data-service.js
        await deleteUserById(client, userId);

        res.status(200).json({ message: `User with ID ${userId} deleted successfully` });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal Server Error" });
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

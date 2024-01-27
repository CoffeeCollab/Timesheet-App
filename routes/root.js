import express from "express"
import path from "path"
import Timesheet from "../data-service.js";

const router = express.Router();
const currentDir = process.cwd();

router.post("/time-in", async (req, res) => {
    
});

router.post("/time-out", async (req, res) => {
    
})

router.get('/', (req, res) => {
    res.sendFile(path.resolve(currentDir, 'views', 'index.html'))
})

export default router;
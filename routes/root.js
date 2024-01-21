import express from "express"
import path from "path"
import Timesheet from "../data-service.js";

const router = express.Router();
const currentDir = process.cwd();

router.post("/time-in", async (req, res) => {
    const {userId} = req.body;

    try {
        // Find the user's timesheet record using userId
        let timesheet = await Timesheet.findOne({userId});

        //If the user doesn'texist, create a new timesheet record
        if (!timesheet) {
            timesheet = new Timesheet({userId, entries:[]});

            //Check is the last entr has a time-out, if not, record the last entry as null and create a new entry
            const lastEntry = timesheet.entries[timesheet.entries.length-1];
            if (lastEntry && !lastEntry.timeOut) {
                lastEntry.timeOut = null;
                const newEntry = { date: new Date(), timeIn: new Date() };
                timesheet.entries.push(newEntry);
            } 
            const newEntry = { date: new Date(), timeIn: new Date() };
            timesheet.entries.push(newEntry);
            

            await timesheet.save();
            res.status(200).json({ message: "Time-in recorded successfully", entry: newEntry });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error"})
    }
})

router.post("time-out", async (req, res) => {
    const {userId} = req.body;

    try {
        // Find the user's timesheet record using userId
        let timesheet = await Timesheet.findOne({ userId });

        // If the user doesn't exist or has no time-in entry, return an error
        if (!timesheet || timesheet.entries.length === 0) {
            return res.status(400).json({ message: "No time-in recorded" });
        }

        // Check if the last entry has a time-out, if not, log an error
        const lastEntry = timesheet.entries[timesheet.entries.length - 1];
        if (!lastEntry || lastEntry.timeOut) {
            return res.status(400).json({ message: "No time-in recorded or time-out already recorded" });
        }

        // Update the time-out for the last entry
        lastEntry.timeOut = new Date();

        // Save the timesheet record
        await timesheet.save();

        res.status(200).json({ message: "Time-out recorded successfully", entry: lastEntry });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

router.get('/', (req, res) => {
    res.sendFile(path.resolve(currentDir, 'views', 'index.html'))
})

export default router;
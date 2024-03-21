import express from "express";
import bodyParser from "body-parser";
import { client, authenticateUser } from "../modules/database.js";
import { timeIn, timeOut, checkLastShift, breakIn, breakOut } from "../modules/data-service.js";


const timeRouter = express.Router();

timeRouter.use(bodyParser.urlencoded({ extended: true}));

timeRouter.post("/time-in", authenticateUser, async (req, res) => {
    // const userId = req.body.userId;
    const userId = req.session.user.id

    const lastShift = await checkLastShift(client, userId)
    if (lastShift.workedHours === undefined) {
        return res.status(400).json({ message: "Previous shift time-out hasn't been recorded" });
    }

    try {
        await timeIn(client, userId);
        res.status(200).json({ message: "Time-in recorded successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


timeRouter.post("/break-in", authenticateUser, async (req, res) => {
    const userId = req.session.user.id;

    // const shiftCheck = await checkLastShift(client, userId);
    const lastShift = await checkLastShift(client, userId);
    if(lastShift.timeInNum != undefined && lastShift.workedHours != undefined){
        return res.status(400).json({ message: "You haven't started a shift yet." });
    }

    try{
        await breakIn(client, userId);
        res.status(200).json({message: "Break-in recorded successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }

})

timeRouter.post("/break-out", authenticateUser, async (req, res) => {
    const userId = req.session.user.id;
    const lastShift = await checkLastShift(client, userId);

    if(lastShift.breakInNum === undefined){
        return res.status(400).json({ message: "You haven't started your break yet." });
    }
    else if(lastShift.timeOutNum != undefined){
        return res.status(400).json({ message: "You haven't started your shift yet." });
    }

    try{
        await breakOut(client, userId);
        res.status(200).json({message: "Break-out recorded successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }

})


timeRouter.post("/time-out", authenticateUser, async (req, res) => {
    const userId = req.session.user.id;

    const lastShift = await checkLastShift(client, userId)
    console.log(lastShift)
    if (lastShift.timeInNum === undefined) {
        return res.status(400).json({ message: "You haven't started a shift yet." });
    }
    else if(lastShift.breakInNum != undefined && lastShift.breakOutNum === undefined){
        return res.status(400).json({ message: "You didn't finish your break. Time-out anyway?" });
    }

    try {
        await timeOut(client, userId);
        res.status(200).json({message: "Time-out recorded successfully"})
    } catch (e) {
        console.error(e);
        res.status(500).json({message: "Internal Server Error"})
    }
});

export default timeRouter;
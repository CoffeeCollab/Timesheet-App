import express from "express";
import path from "path";
import bodyParser from "body-parser";
import bcrypt from 'bcrypt';
import { client, authenticateUser } from "../modules/database.js";
import { deleteUserById, addNewUser, timeIn, timeOut, checkLastShift, breakIn, breakOut} from "../modules/data-service.js";
import { createUser, getUserByEmail, getUserByName, getUserBySin } from "../modules/data-service-auth.js";


const router = express.Router();
const currentDir = process.cwd();


router.use(bodyParser.urlencoded({ extended: true}));

router.post("/time-in", authenticateUser, async (req, res) => {
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


router.post("/break-in", authenticateUser, async (req, res) => {
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



router.post("/time-out", authenticateUser, async (req, res) => {
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

// Route to handle creating a new user
router.post("/create-user", async (req, res) => {
    
    const {confirmation, ...newUser} = req.body;
    console.log("Received request body:", newUser);

    try {
        // Check if the email or name already exists
        const emailExists = await getUserByEmail(client, newUser.email);
        const nameExists = await getUserByName(client, newUser.fullname);
        if (emailExists || nameExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const createdUser = await createUser(client, newUser);
        const createdId = createdUser.insertedId;

        await addNewUser(client, createdId);

        res.status(200).json({ message: "User created successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post("/shift-table", async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await getUserByEmail(client, email)
        console.log(user)

        if(!user) {
            res.status(401).json({message: 'Invalid email or password'});
            return;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if(passwordMatch) {
            req.session.user = {
                id: user._id,
                email: user.email,
            }
            res.sendFile(path.resolve(currentDir, 'views', 'shiftTracker.html'))
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }


    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

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

router.get('/', (req, res) => {
    res.sendFile(path.resolve(currentDir, 'views', 'index.html'));
});

router.get('/shift-table', authenticateUser, (req, res) => {
    res.sendFile(path.resolve(currentDir, 'views', 'shiftTable.html'))
})

router.get('/shift-tracker', authenticateUser, (req, res) => {
    res.sendFile(path.resolve(currentDir, 'views', 'shiftTracker.html'))
})

router.get('/about-us', (req, res) => {
    res.sendFile(path.resolve(currentDir, 'views', 'aboutUs.html'))
})

router.get('/create-user', (req, res) => {
    res.sendFile(path.resolve(currentDir, 'views', 'registrationTest.html'))
})



export default router;
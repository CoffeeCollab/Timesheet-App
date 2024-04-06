import express from "express";
import session from "express-session";
import path from "path";
import router from "./routes/root.js";
import { client, connectToDatabase, listDatabases } from "./modules/database.js";
import 'dotenv/config'

const app = express();
const PORT = process.env.PORT || 3000;

//console.log(process.env.NODE_ENV)

app.use(express.json())

// Use process.cwd() to get the current working directory
const currentDir = process.cwd();

app.use(express.static(path.join(currentDir, 'public')))

const sessionSecret = 'htsagara';

//Set up session middleware
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
}))

// Call the connectToDatabase function to establish the connection
connectToDatabase();

listDatabases(client)

app.use('/', router);

//Handle errors
app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(currentDir, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({message: '404 Not Found'})
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));






import express from "express"
import path from "path"

const router = express.Router();
const currentDir = process.cwd();

router.get('/', (req, res) => {
    res.sendFile(path.resolve(currentDir, 'views', 'index.html'))
})

export default router;
import express from "express"
import { landing } from "../controllers/home.controller.js"

const router = express.Router();

router.get("/", landing)

export default router;
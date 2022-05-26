import { currentUser } from "@dptickets_v1/common";
import express from "express";

const router = express.Router();

router.get('/api/users/currentuser', currentUser,  (req, res) => {
    res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
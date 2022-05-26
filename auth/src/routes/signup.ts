import express, { Request, Response} from "express";
import { body } from "express-validator";
import { User } from "../models/user";
import jwt from "jsonwebtoken";
import { BadRequestError, validateRequest } from "@dptickets_v1/common";

const router = express.Router();

router.post('/api/users/signup',
[body('email').isEmail().withMessage('Email must be valid.'),
body('password').trim().isLength({ min: 4, max: 20 })
.withMessage('Password must be between 4 and 20 characters.')],
validateRequest,
async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new BadRequestError('Email in use.');
    }
    const user = User.build({ email, password });
    await user.save();

    // Generate JSON web token and store it on the session object
    const userJwt = jwt.sign({ id: user.id, email: user.email}, process.env.JWT_KEY!);
    // Store it in the session and automatically add a Set-Cookie header
    req.session = { jwt: userJwt };

    res.status(201).send(user);
    
});

export { router as signupRouter };
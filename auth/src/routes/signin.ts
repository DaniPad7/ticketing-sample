import express, {Request, Response} from "express";
import { body } from "express-validator";
import { User } from "../models/user";
import { Password } from "../services/password";
import jwt from "jsonwebtoken";
import { BadRequestError, validateRequest } from "@dptickets_v1/common";

const router = express.Router();

router.post('/api/users/signin', [
    body('email').isEmail().withMessage('Email must be valid.'),
    body('password').trim().notEmpty().withMessage('Password must be valid.'),
], validateRequest, async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        throw new BadRequestError('Login failed.');
    }
    const passwordMatch = await Password.compare(existingUser.password, password);
    if (!passwordMatch) {
        throw new BadRequestError('Invalid credentials.');
    }
    // Generate JSON web token and store it on the session object
    const userJwt = jwt.sign({ id: existingUser.id, email: existingUser.email}, process.env.JWT_KEY!);
    // Store it in the session and automatically add a Set-Cookie header with the value info
    req.session = { jwt: userJwt };

    res.status(200).send(existingUser);

})

export { router as signinRouter };
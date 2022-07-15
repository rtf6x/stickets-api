import * as jwt from "jsonwebtoken";
import settings from "../../../settings";
import { DocumentType } from '@typegoose/typegoose';
import { UserClass } from '../user';

export default function (user: DocumentType<UserClass>) {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);
    return jwt.sign({
        _id: user._id,
        googleId: user.googleId,
        email: user.email,
        exp: expirationDate.getTime() / 1000,
    }, settings.jwtSecret);
};

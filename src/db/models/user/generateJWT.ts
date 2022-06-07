import * as jwt from "jsonwebtoken";
import settings from "../../../settings";

export default function () {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);
    return jwt.sign({
        _id: this._id,
        googleId: this.googleId,
        email: this.email,
        exp: expirationDate.getTime() / 1000,
    }, settings.jwtSecret);
};

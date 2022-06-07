import * as jwt from "jsonwebtoken";
import User from '../src/db/models/user';
import settings from "../src/settings";

(async function(){
    console.log('Started');
    const user = await User.findOne({ email: '' });
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);
    const token = jwt.sign({
        _id: user._id,
        googleId: user.googleId,
        email: user.email,
        exp: expirationDate.getTime() / 1000,
    }, settings.jwtSecret);
    console.log('Finished. token:', token);
    process.exit(0);
})();

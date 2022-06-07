import passport from 'passport';
// @ts-ignore
import { Strategy as GoogleTokenStrategy } from 'passport-google-token';
import settings from "./settings";

passport.use(new GoogleTokenStrategy(settings.google, (accessToken: any, refreshToken: any, profile: any, done: Function) => done(null, {
    accessToken,
    refreshToken,
    profile,
})));

export const authenticateGoogle = (req: any, res: any) => new Promise((resolve, reject) => {
    passport.authenticate('google-token', { session: false }, (err, data, info) => {
        if (err) reject(err);
        resolve({ data, info });
    })(req, res);
});

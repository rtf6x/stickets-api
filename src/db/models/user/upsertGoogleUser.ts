import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { UserClass } from '../user';

export default async function (model: ReturnModelType<typeof UserClass>, { profile }: any): Promise<DocumentType<UserClass>> {
    const user = await model.findOne({ googleId: profile.id });
    // no user was found, lets create a new one
    if (!user) {
        const newUser = await model.create({
            googleId: profile.id,
            name: profile.displayName || `${profile.familyName} ${profile.givenName}`,
            googleProfile: profile,
        });
        if (profile._json && profile._json.email && profile._json.email.length) {
            newUser.email = profile._json.email;
        }
        if (profile._json && profile._json.picture && profile._json.picture.length) {
            newUser.avatar = profile._json.picture;
        }
        return newUser;
    }
    if (profile._json && profile._json.email && profile._json.email.length) {
        user.email = profile._json.email;
    }
    if (profile._json && profile._json.picture && profile._json.picture.length) {
        user.avatar = profile._json.picture;
    }
    await user.save();
    return user;
};

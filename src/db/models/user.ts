import { Document, Model, Schema, model } from "mongoose";
import upsertGoogleUser from "./user/upsertGoogleUser";
import getUserByToken from "./user/getUserByToken";
import generateJWT from "./user/generateJWT";

export interface UserInterface extends Document {
    generateJWT(): any;
}

interface GoogleResponse {
    profile: GoogleProfile,
}

interface GoogleProfile {
    id: String,
    displayName: String,
    familyName: String,
    givenName: String,
    emails: Array<any>,
    photos: Array<any>,
}

interface UserModelInterface extends Model<any> {
    getUserByToken(token: String): any;
    upsertGoogleUser(response: GoogleResponse): any;
}

const schema = new Schema({
    googleId: String,
    name: String,
    email: String,
    avatar: String,
    googleProfile: Object,
}, {
    timestamps: true,
});

schema.methods.generateJWT = generateJWT;
schema.statics.getUserByToken = getUserByToken;
schema.statics.upsertGoogleUser = upsertGoogleUser;

schema.index({ googleId: 1 });

const User: UserModelInterface = model<UserInterface, UserModelInterface>('user', schema);
export default User;

import { Schema, Types } from 'mongoose';
import { DocumentType, getModelForClass, index, prop, ReturnModelType } from '@typegoose/typegoose';
import upsertGoogleUser from "./user/upsertGoogleUser";
import getUserByToken from "./user/getUserByToken";
import generateJWT from "./user/generateJWT";

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

@index({ googleId: 1 })
export class UserClass {
    @prop()
    public _id!: Types.ObjectId;

    @prop()
    public googleId?: string;

    @prop()
    public name?: string;

    @prop()
    public email!: string;

    @prop()
    public avatar?: string;

    @prop()
    public googleProfile?: GoogleProfile;

    // the "this" definition is required to have the correct types
    public generateJWT(this: DocumentType<UserClass>) {
        return generateJWT(this);
    }

    // the "this" definition is required to have the correct types
    public static async getUserByToken(this: ReturnModelType<typeof UserClass>, token: string) {
        return getUserByToken(this, token);
    }

    // the "this" definition is required to have the correct types
    public static async upsertGoogleUser(this: ReturnModelType<typeof UserClass>, googleData: GoogleResponse) {
        return upsertGoogleUser(this, googleData);
    }
}

export const UserModel = getModelForClass(UserClass, { schemaOptions: { timestamps: true, collection: 'users' } });

export default UserModel;

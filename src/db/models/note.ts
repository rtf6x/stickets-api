import { getModelForClass, index, prop, Ref } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { UserClass } from './user';

@index({ url: 1 })
@index({ uid: 1 })
@index({ sharedWith: 1 })
@index({ scope: 1 })
export class NoteClass {
    @prop()
    public _id!: Types.ObjectId;

    @prop({ ref: 'UserClass' })
    public uid!: Ref<UserClass>;

    @prop()
    public url?: string;

    @prop()
    public note?: string;

    @prop()
    public scope!: string;

    @prop({ ref: 'UserClass' })
    public sharedWith?: Ref<UserClass>[];
}

export const NoteModel = getModelForClass(NoteClass, { schemaOptions: { timestamps: true, collection: 'notes' } });

export default NoteModel;

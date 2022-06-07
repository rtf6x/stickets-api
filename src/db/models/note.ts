import { model, Schema } from "mongoose";

const schema = new Schema({
    uid: { type: Schema.Types.ObjectId, ref: 'user' },
    url: String,
    note: String,
    scope: { type: String, default: 'global' },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'user' }],
}, {
    timestamps: true,
});

schema.index({ url: 1 });
schema.index({ uid: 1 });
schema.index({ sharedWith: 1 });
schema.index({ scope: 1 });

export default model('note', schema);

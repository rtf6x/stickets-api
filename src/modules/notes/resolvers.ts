import { ApolloError } from 'apollo-server-errors';
import Note from '../../db/models/note';
import User from '../../db/models/user';
import { Schema } from "mongoose";

const scopes = ['global', 'site', 'page'];

export default {
    Query: {
        allNotes: async (parent: any, args: any, { user }: any) => {
            if (!user || !user._id) {
                return new ApolloError('Not logged in!');
            }
            const notes = await Note.find({ $or: [{ uid: user._id }, { sharedWith: user._id }] })
                .populate('uid sharedWith')
                .lean();
            return notes.map(note => {
                return {
                    ...note,
                    uid: note.uid._id,
                    creator: note.uid,
                    shared: note.uid._id.toString() !== user._id.toString(),
                };
            });
        },
    },
    Mutation: {
        create: async (parent: any, { url, note, scope }: any, { user }: any) => {
            if (!user || !user._id) {
                return new ApolloError('Not logged in!');
            }
            if (!scopes.find(s => s === scope)) {
                return new ApolloError('Scope is not valid!');
            }
            return Note.create({ url, note, uid: user._id, scope })
        },
        update: async (parent: any, { id, note: noteStr }: any, { user }: any) => {
            if (!user || !user._id) {
                return new ApolloError('Not logged in!');
            }
            const note = await Note.findOne({ _id: id, uid: user._id });
            if (!note || !note._id) {
                return { message: 'note not found', code: 105 };
            }
            note.note = noteStr;
            await note.save();
            return id;
        },
        delete: async (parent: any, { id }: any, { user }: any) => {
            if (!user || !user._id) {
                return new ApolloError('Not logged in!');
            }
            const note = await Note.findOne({ _id: id });
            if (!note || !note._id) {
                return { message: 'note not found', code: 105 };
            }
            if (note.uid.toString() !== user._id.toString()) {
                await Note.updateOne({ _id: id }, { $pull: { sharedWith: user._id } });
            } else {
                await Note.deleteOne({ _id: id, uid: user._id });
            }
            return id;
        },
        share: async (parent: any, { id, email }: any, { user }: any) => {
            if (!user || !user._id) {
                return new ApolloError('Not logged in!');
            }
            const shareUser = await User.findOne({ email }).lean();
            if (!shareUser || !shareUser._id) {
                return { message: 'user not registered', code: 104 };
            }
            if (shareUser._id.toString() === user._id.toString()) {
                return { message: 'cannot share with note creator', code: 106 };
            }
            const note = await Note.findOne({ _id: id, uid: user._id });
            if (!note || !note._id) {
                return { message: 'note not found', code: 105 };
            }
            note.sharedWith = (note.sharedWith || []).filter(
                (uid: Schema.Types.ObjectId) => uid.toString() !== shareUser._id.toString()
            );
            note.sharedWith.push(shareUser._id);
            await note.save();
            return { message: 'ok', code: 0 };
        },
        deshare: async (parent: any, { id, email }: any, { user }: any) => {
            if (!user || !user._id) {
                return new ApolloError('Not logged in!');
            }
            const shareUser = await User.findOne({ email }).lean();
            if (!shareUser || !shareUser._id) {
                return { message: 'user not registered', code: 104 };
            }
            if (shareUser._id.toString() === user._id.toString()) {
                return { message: 'cannot deshare note creator', code: 106 };
            }
            const note = await Note.findOne({ _id: id, uid: user._id });
            if (!note || !note._id) {
                return { message: 'note not found', code: 105 };
            }
            note.sharedWith = (note.sharedWith || []).filter(
                (uid: Schema.Types.ObjectId) => uid.toString() !== shareUser._id.toString()
            );
            await note.save();
            return { message: 'ok', code: 0 };
        }
    }
};

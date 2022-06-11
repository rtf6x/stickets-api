import { ApolloError } from 'apollo-server-errors';
import { PubSub, withFilter } from 'graphql-subscriptions';
import Note from '../../db/models/note';
import User from '../../db/models/user';
import formatNote from './helpers/formatNote';

const scopes = ['global', 'site', 'page'];

const pubSub = new PubSub();

const subFilter = (payload: any, variables: any, context: any) => {
  if (!context || !context.user || !context.user._id) {
    return false;
  }
  return !(payload.recepients && payload.recepients.indexOf(context.user._id.toString()) === -1);
}

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
      const newNote = await Note.create({ url, note, uid: user._id, scope });
      newNote.uid = user;
      pubSub.publish('NOTE_CREATED', {
        noteCreated: formatNote(newNote._doc),
        recepients: [user._id.toString()],
      });
      return formatNote(newNote._doc);
    },
    update: async (parent: any, { id, note: noteStr }: any, { user }: any) => {
      if (!user || !user._id) {
        return new ApolloError('Not logged in!');
      }
      const note = await Note.findOne({ _id: id, uid: user._id })
        .populate('uid sharedWith');
      if (!note || !note._id) {
        return { message: 'note not found', code: 105 };
      }
      note.note = noteStr;
      await note.save();
      pubSub.publish('NOTE_UPDATED', {
        noteUpdated: formatNote(note._doc),
        recepients: [
          note.uid._id.toString(),
          ...note.sharedWith.map((share: any) => share._id.toString())
        ],
      });
      return id;
    },
    delete: async (parent: any, { id }: any, { user }: any) => {
      if (!user || !user._id) {
        return new ApolloError('Not logged in!');
      }
      const note = await Note.findOne({ _id: id })
        .populate('uid sharedWith');
      if (!note || !note._id) {
        return { message: 'note not found', code: 105 };
      }
      if (note.uid.toString() !== user._id.toString()) {
        await Note.updateOne({ _id: id }, { $pull: { sharedWith: user._id } });
      } else {
        await Note.deleteOne({ _id: id, uid: user._id });
      }
      pubSub.publish('NOTE_DELETED', {
        noteDeleted: formatNote(note._doc),
        recepients: [
          note.uid._id.toString(),
          ...note.sharedWith.map((share: any) => share._id.toString())
        ],
      });
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
      const note = await Note.findOne({ _id: id, uid: user._id })
        .populate('uid sharedWith');
      if (!note || !note._id) {
        return { message: 'note not found', code: 105 };
      }
      note.sharedWith = (note.sharedWith || []).filter(
        (share: any) => share._id.toString() !== shareUser._id.toString(),
      );
      note.sharedWith.push(shareUser);
      await note.save();
      pubSub.publish('NOTE_SHARED', {
        noteShared: formatNote(note._doc),
        recepients: [
          note.uid._id.toString(),
          ...note.sharedWith.map((share: any) => share._id.toString())
        ],
      });
      return { message: 'ok', code: 0 };
    },
    deShare: async (parent: any, { id, email }: any, { user }: any) => {
      if (!user || !user._id) {
        return new ApolloError('Not logged in!');
      }
      const deShareUser = await User.findOne({ email }).lean();
      if (!deShareUser || !deShareUser._id) {
        return { message: 'user not registered', code: 104 };
      }
      if (deShareUser._id.toString() === user._id.toString()) {
        return { message: 'cannot deshare note creator', code: 106 };
      }
      const note = await Note.findOne({ _id: id, uid: user._id })
        .populate('uid sharedWith');
      if (!note || !note._id) {
        return { message: 'note not found', code: 105 };
      }
      note.sharedWith = (note.sharedWith || []).filter(
        (share: any) => share._id.toString() !== deShareUser._id.toString(),      );
      await note.save();
      pubSub.publish('NOTE_DESHARED', {
        noteDeShared: formatNote(note._doc),
        recepients: [
          note.uid._id.toString(),
          deShareUser._id.toString(),
          ...note.sharedWith.map((share: any) => share._id.toString())
        ],
      });
      return { message: 'ok', code: 0 };
    },
  },

  Subscription: {
    noteCreated: {
      subscribe: withFilter(
        () => pubSub.asyncIterator('NOTE_CREATED'),
        subFilter,
      ),
    },
    noteUpdated: {
      subscribe: withFilter(
        () => pubSub.asyncIterator('NOTE_UPDATED'),
        subFilter,
      ),
    },
    noteDeleted: {
      subscribe: withFilter(
        () => pubSub.asyncIterator('NOTE_DELETED'),
        subFilter,
      ),
    },
    noteShared: {
      subscribe: withFilter(
        () => pubSub.asyncIterator('NOTE_SHARED'),
        subFilter,
      ),
    },
    noteDeShared: {
      subscribe: withFilter(
        () => pubSub.asyncIterator('NOTE_DESHARED'),
        subFilter,
      ),
    },
  },
};

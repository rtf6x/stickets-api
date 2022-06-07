require('dotenv').config();
import { ApolloServer } from 'apollo-server';
import requestLogPlugin from "./plugins/requestLog";
import User from "./db/models/user";
import merge from "lodash.merge";

// Create connection
import './db/mongoose';

import authResolvers from "./modules/auth/resolvers";
import notesResolvers from "./modules/notes/resolvers";

import global from "./modules/global/types";
import auth from "./modules/auth/types";
import notes from "./modules/notes/types";

const PORT = process.env.PORT || 4000;

const apolloConfig: any = {
    typeDefs: [
        global,
        auth,
        notes,
    ],
    resolvers: merge({},
        authResolvers,
        notesResolvers,
    ),
    introspection: true,
    formatError: (err: any) => {
        console.error('formatError', err);
        console.error('formatErrorStack', err.stack);
        return new Error(err.message);
        // if (err.message.startsWith('Database Error: ')) {
        //     return new Error('Internal server error');
        // }
        // if (err.message.startsWith('Not found')) {
        //     return new Error('Not found');
        // }
        // return err;
    },
    context: async ({ req }: any) => {
        const token = req.headers.authorization || '';
        const { user }: any = await User.getUserByToken(token);
        return { user };
    },
    plugins: [
        requestLogPlugin,
    ],
};

const server = new ApolloServer(apolloConfig);

server.listen({ port: PORT }).then((ServerInfo: { url: any; }) => {
    console.log(`[index] Server ready at ${ServerInfo.url}`);
});

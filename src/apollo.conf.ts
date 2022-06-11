import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { WebSocketServer } from 'ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { Config } from 'apollo-server-core/src/types';
import { PubSub } from 'graphql-subscriptions';

import RequestLogPlugin from './plugins/requestLog';
import User from './db/models/user';

import global from './modules/global/types';
import auth from './modules/auth/types';
import notes from './modules/notes/types';
import merge from 'lodash.merge';
import authResolvers from './modules/auth/resolvers';
import notesResolvers from './modules/notes/resolvers';
import { Server } from 'http';
import { getUserResult } from './db/models/user/getUserByToken';
import WSShutdownPlugin from './plugins/wsShutdown';
import initWSHooks from './ws.hooks';

const pubSub = new PubSub();

const schema = makeExecutableSchema({
  typeDefs: [
    global,
    auth,
    notes,
  ],
  resolvers: merge({},
    authResolvers,
    notesResolvers,
  ),
});

class ApolloConfigClass {
  httpServer: Server;
  wsServer: WebSocketServer;
  config: Config;

  constructor(httpServer: Server, wsServer: WebSocketServer) {
    this.httpServer = httpServer;
    this.wsServer = wsServer;
    this.run();
  }

  run() {
    initWSHooks(schema, this.wsServer);
    this.config = {
      schema,
      csrfPrevention: true,
      introspection: true,
      formatError: (err: any) => {
        console.error('App Error:', err);
        if (err.stack) {
          console.error('App Error CallStack:', err.stack);
        }
        return new Error(err.message);
      },
      context: async ({ req }: any) => {
        const token = req.headers.authorization || '';
        const { user }: getUserResult = await User.getUserByToken(token);
        return { user, pubSub };
      },
      plugins: [
        new RequestLogPlugin(),
        ApolloServerPluginDrainHttpServer({ httpServer: this.httpServer }),
        new WSShutdownPlugin(this.wsServer, schema),
      ],
    };
  }
}

export default ApolloConfigClass;

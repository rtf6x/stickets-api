require('dotenv').config();
import { WebSocketServer } from 'ws';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { createServer } from 'http';

import ApolloConfig from './apollo.conf';

// Create connection
import './db/mongoose';

const PORT = process.env.PORT || 4000;

const app = express();
const httpServer = createServer(app);
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/',
});

const apolloConfig = new ApolloConfig(httpServer, wsServer);
const server = new ApolloServer(apolloConfig.config);

(async () => {
  await server.start();
  server.applyMiddleware({ app, path: '/' });
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
})();

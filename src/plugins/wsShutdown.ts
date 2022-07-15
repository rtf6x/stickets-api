import type { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { Disposable } from 'graphql-ws';
import { GraphQLSchema } from 'graphql';

// Proper shutdown for the WebSocket server.
export class WSShutdownPlugin implements ApolloServerPlugin {
    serverCleanup: Disposable;

    constructor(wsServer: WebSocketServer, schema: GraphQLSchema) {
        this.serverCleanup = useServer({ schema }, wsServer);
    }

    async serverWillStart() {
        const that = this;
        return {
            async drainServer() {
                await that.serverCleanup.dispose();
            },
        };
    }
}

export default WSShutdownPlugin;

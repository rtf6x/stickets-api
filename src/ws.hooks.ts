import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import { GraphQLSchema } from 'graphql';
import { Context } from 'graphql-ws';
import { getUserResult } from './db/models/user/getUserByToken';
import User from './db/models/user';

class Forbidden extends Error {
}
interface IContextWithUser extends Context {
  user: Document;
}

async function handleAuth(ctx: IContextWithUser) {
  if (
    !ctx.connectionParams ||
    !ctx.connectionParams.Authorization ||
    typeof ctx.connectionParams.Authorization !== 'string'
  ) {
    console.error('[handleAuth] Auth required [1]');
    throw new Forbidden('Auth required');
  }
  if (ctx.user) {
    console.log('[handleAuth] User is already attached');
    return;
  }
  const { user }: getUserResult = await User.getUserByToken(ctx.connectionParams.Authorization);
  if (!user) {
    console.error('[handleAuth] Auth required [2]');
    throw new Forbidden('Auth required');
  }
  ctx.user = user;
}

export default function (schema: GraphQLSchema, wsServer: WebSocketServer) {
  useServer(
    {
      schema,
      context: async (ctx: any) => {
        if (
          !ctx.connectionParams ||
          !ctx.connectionParams.Authorization ||
          typeof ctx.connectionParams.Authorization !== 'string'
        ) {
          console.error('[handleAuth] Auth required [1]');
          throw new Forbidden('Auth required');
        }
        if (ctx.user) {
          return { user: ctx.user };
        }
        const { user }: getUserResult = await User.getUserByToken(ctx.connectionParams.Authorization);
        return { user };
      },
      onConnect: async (ctx: any) => {
        await handleAuth(ctx);
      },
      onSubscribe: async (ctx: any) => {
        await handleAuth(ctx);
      },
    },
    wsServer,
  );
}

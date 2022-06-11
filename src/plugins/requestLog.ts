import type { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';

export class RequestLogPlugin implements ApolloServerPlugin {
  async requestDidStart(): Promise<GraphQLRequestListener> {
    const start = performance.now();
    let operationName: string;
    return {
      async didResolveOperation(context: any) {
        operationName = context.operationName;
        console.log(`[${new Date().toISOString()}][${operationName}] started...`);
      },
      async willSendResponse(context: any) {
        const stop = performance.now();
        const elapsed = stop - start;
        const size = JSON.stringify(context.response).length * 2;
        console.log(`[${new Date().toISOString()}][${operationName}] ended in ${Math.round(elapsed)}ms (${size} bytes)`);
      },
    };
  }
}

export default RequestLogPlugin;

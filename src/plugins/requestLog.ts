export default {
    requestDidStart() {
        const start = performance.now();
        let op: string;

        return {
            didResolveOperation(context: any) {
                op = context.operationName;
                console.log(`[${new Date().toISOString()}][${op}] started...`);
            },
            willSendResponse(context: any) {
                const stop = performance.now();
                const elapsed = stop - start;
                const size = JSON.stringify(context.response).length * 2;
                console.log(`[${new Date().toISOString()}][${op}] ended in ${Math.round(elapsed)}ms (${size} bytes)`);
            }
        }
    },
};

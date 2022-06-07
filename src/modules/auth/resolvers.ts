import { ApolloError } from 'apollo-server-errors';
import { GraphQLRequestContext } from 'apollo-server-types';

import User from '../../db/models/user';
import { authenticateGoogle } from '../../passport';

export default {
    Query: {
        profile: async (parent: any, args: any, { user }: any) => {
            if (!user || !user._id) {
                return new ApolloError('Not logged in!');
            }
            return user;
        },
    },
    Mutation: {
        login: async (parent: any, { token }: any, { request, response }: GraphQLRequestContext) => {
            const query = request && request.query ? request.query : {};
            const { data, info }: any = await authenticateGoogle({
                    ...request,
                    query,
                    headers: {},
                    body: {
                        access_token: token,
                    },
                },
                response);
            if (data) {
                const user = await User.upsertGoogleUser(data);
                if (user) {
                    return ({
                        token: user.generateJWT(),
                    });
                }
            }

            if (info) {
                console.error('login info', info);
                switch (info.code) {
                    case 'ETIMEDOUT':
                        return (new ApolloError('Failed to reach Google: Try Again'));
                    default:
                        return (new ApolloError('something went wrong'));
                }
            }
            return new ApolloError('server error');
        }
    }
};

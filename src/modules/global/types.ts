import { gql } from 'apollo-server-express';

export default gql`
    type Query {
        _empty: String
    }
    type Mutation {
        _empty: String
    }
    type Subscription {
        _empty: String
    }
    scalar Date
`;

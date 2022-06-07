import { gql } from 'apollo-server';

export default gql`
    type Query {
        _empty: String
    }
    type Mutation {
        _empty: String
    }
    scalar Date
`;

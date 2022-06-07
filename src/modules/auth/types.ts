import { gql } from 'apollo-server';

export default gql`
    type AuthResponse {
        token: String
    }
    
    type Profile {
        _id: ID!
        googleId: String!
        name: String!
        email: String!
        avatar: String
        createdAt: Date!
        updatedAt: Date!
    }

    extend type Query {
        profile: Profile
    }

    extend type Mutation {
        login(token: String!): AuthResponse
    }
`;

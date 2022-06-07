import { gql } from 'apollo-server';

export default gql`
    type NoteUser {
        _id: ID!
        name: String
        email: String
        avatar: String
    }
    
    enum NoteScope {
        global
        site
        page
    }
    
    type Note {
        _id: ID!
        uid: ID
        creator: NoteUser
        shared: Boolean
        url: String!
        note: String!
        scope: NoteScope!
        sharedWith: [NoteUser]
        createdAt: Date!
        updatedAt: Date!
    }

    extend type Query {
        allNotes: [Note]
    }
    
    type ShareResponse {
        message: String!
        code: Int!
    }

    extend type Mutation {
        create(url: String!, note: String!, scope: NoteScope!): Note
        update(id: String!, note: String!): ID
        delete(id: String!): ID
        share(id: String!, email: String!): ShareResponse
        deshare(id: String!, email: String!): ShareResponse
    }
`;

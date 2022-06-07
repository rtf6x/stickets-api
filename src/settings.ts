export default {
    jwtSecret: process.env.JWT_SECRET || '',
    mongoUrl: process.env.MONGO_URL || '',
    google: {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }
};

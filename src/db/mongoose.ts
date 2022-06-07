import mongoose from "mongoose";
import settings from "../settings";

mongoose.connect(settings.mongoUrl);
mongoose.connection.once('open', () => {
    console.log(`[mongoose] Connected to ${settings.mongoUrl}...`);
});

export default mongoose;

require('dotenv').config();
import '../src/db/mongoose';
import Note from '../src/db/models/note';

(async function(){
    console.log('Started');
    const notes = await Note.find();
    for (const note of notes) {
        // delete note.share;
        await note.save();
    }
    console.log('Finished. Docs:', notes.length);
    process.exit(0);
})();

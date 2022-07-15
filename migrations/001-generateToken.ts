require('dotenv').config();
import '../src/db/mongoose';
import User from '../src/db/models/user';

(async function(){
    console.log('Started');
    const user = await User.findOne({ email: 'trapholov@gmail.com' });
    const token = user.generateJWT();
    console.log('Finished. token:', token);
    process.exit(0);
})();

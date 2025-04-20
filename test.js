const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function test() {
    try {
        // Simple password test
        const password = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        
        console.log('Test password:', password);
        console.log('Hashed password:', hash);
        
        // Test comparison
        const match = await bcrypt.compare(password, hash);
        console.log('Password match:', match);
        
    } catch (error) {
        console.error('Error:', error);
    }
    process.exit();
}

test();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function testAuth() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Delete all existing users
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Create a test password
        const password = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('Password hashed:', hashedPassword);

        // Create a test user
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: hashedPassword,
            role: 'standard'
        });
        console.log('User created:', {
            id: user._id,
            email: user.email,
            hashedPassword: user.password
        });

        // Test password comparison
        const foundUser = await User.findOne({ email: 'test@example.com' });
        console.log('Found user:', foundUser ? 'Yes' : 'No');
        console.log('Found user password:', foundUser.password);

        const isMatch = await bcrypt.compare(password, foundUser.password);
        console.log('Password match:', isMatch);

        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

testAuth(); 
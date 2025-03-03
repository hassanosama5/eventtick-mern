const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  profilePicture: { 
    type: String, 
    default: "" 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['standard', 'organizer', 'admin'], 
    default: 'standard' 
  },
}, { timestamps: true });

// Create the User model
const User = mongoose.model('User', userSchema);

// Export the model
module.exports = User;
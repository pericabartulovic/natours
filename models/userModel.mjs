import mongoose from "mongoose";
import validator from 'validator';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please, tell us your name!'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please, provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please, provide a valid email']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please, provide a password'],
    minlength: 8,
    // validate: [validator.isStrongPassword, 'Password has to contain at least one big letter, number and special sign']
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please, confirm your password'],
    // validate: [validator.isStrongPassword, 'Password has to contain at least one big letter, number and special sign']
  },
});

const User = mongoose.model('Tour', userSchema);

export default User;
import mongoose from "mongoose";
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please, provide a password'],
    minlength: 8,
    select: false,
    // validate: [validator.isStrongPassword, 'Password has to contain at least one big letter, number and special sign']
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please, confirm your password'],
    validate: {
      // this only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was acttually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; //sometimes it happens that token is created a bit before change timestamp has actually been created - hence '-1000' miliseconds or 1 sec.!
  }

  next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }

  return false;
}

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
}

const User = mongoose.model('User', userSchema);
export default User;
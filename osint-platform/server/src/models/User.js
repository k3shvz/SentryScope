import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    resetTokenHash: { type: String, default: null, select: false },
    resetTokenExpiresAt: { type: Date, default: null, select: false },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  const { passwordHash, __v, ...rest } = this.toObject();
  return rest;
};

userSchema.statics.hashPassword = function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
};

export default mongoose.models.User || mongoose.model('User', userSchema);

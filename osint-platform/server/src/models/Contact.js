import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

contactSchema.methods.toPublicJSON = function toPublicJSON() {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    name: obj.name,
    email: obj.email,
    message: obj.message,
    createdAt: obj.createdAt,
  };
};

export default mongoose.models.Contact || mongoose.model('Contact', contactSchema);

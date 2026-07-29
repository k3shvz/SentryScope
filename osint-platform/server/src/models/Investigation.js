import mongoose from 'mongoose';

const investigationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, trim: true },
    target: { type: String, required: true, trim: true },
    risk: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    summary: { type: String, trim: true },
    profilesFound: { type: Number, default: 0 },
  },
  { timestamps: true }
);

investigationSchema.methods.toPublicJSON = function toPublicJSON() {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    type: obj.type,
    target: obj.target,
    risk: obj.risk,
    summary: obj.summary,
    profilesFound: obj.profilesFound,
    timestamp: obj.createdAt,
  };
};

export default mongoose.models.Investigation || mongoose.model('Investigation', investigationSchema);

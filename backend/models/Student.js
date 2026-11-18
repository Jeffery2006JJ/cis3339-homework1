import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name must be 100 characters or fewer'],
    },
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      trim: true,
      unique: true,
      match: [/^\d{1,10}$/, 'Student ID must be 1 to 10 digits'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9()+\-.\s]{7,20}$/, 'Phone number may contain digits, spaces, and ( ) + - . only (7-20 characters)'],
    },
    zip: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true,
      match: [/^\d{5}(-\d{4})?$/, 'ZIP code must be 5 digits (or ZIP+4, e.g. 77001-1234)'],
    },
  },
  { timestamps: true },
);

studentSchema.index({ name: 1 });

studentSchema.set('toJSON', { versionKey: false });

export default mongoose.model('Student', studentSchema);

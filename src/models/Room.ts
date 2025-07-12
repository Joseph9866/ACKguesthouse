import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  _id: string;
  name: string;
  description: string;
  price: number;
  bed_only: number;
  bb: number;
  half_board: number;
  full_board: number;
  capacity: number;
  amenities: string[];
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

const RoomSchema = new Schema<IRoom>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  bed_only: {
    type: Number,
    required: true,
    min: 0
  },
  bb: {
    type: Number,
    required: true,
    min: 0
  },
  half_board: {
    type: Number,
    required: true,
    min: 0
  },
  full_board: {
    type: Number,
    required: true,
    min: 0
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  amenities: {
    type: [String],
    default: []
  },
  image_url: {
    type: String,
    trim: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create indexes
RoomSchema.index({ name: 1 });
RoomSchema.index({ price: 1 });
RoomSchema.index({ capacity: 1 });

export const Room = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
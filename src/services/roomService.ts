import { connectToDatabase } from '../lib/mongoose';
import { Room, IRoom } from '../models/Room';
import { Booking } from '../models/Booking';

export interface RoomWithAvailability extends IRoom {
  available: boolean;
}

export class RoomService {
  static async getAllRooms(): Promise<IRoom[]> {
    await connectToDatabase();
    return await Room.find({}).sort({ price: 1 });
  }

  static async getRoomById(id: string): Promise<IRoom | null> {
    await connectToDatabase();
    return await Room.findById(id);
  }

  static async checkRoomAvailability(
    roomId: string,
    checkIn: string,
    checkOut: string
  ): Promise<boolean> {
    await connectToDatabase();
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      room_id: roomId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          check_in_date: { $lte: checkInDate },
          check_out_date: { $gt: checkInDate }
        },
        {
          check_in_date: { $lt: checkOutDate },
          check_out_date: { $gte: checkOutDate }
        },
        {
          check_in_date: { $gte: checkInDate },
          check_out_date: { $lte: checkOutDate }
        }
      ]
    });

    return !overlappingBooking;
  }

  static async getRoomsWithAvailability(
    checkIn?: string,
    checkOut?: string
  ): Promise<RoomWithAvailability[]> {
    await connectToDatabase();
    
    const rooms = await Room.find({}).sort({ price: 1 });
    
    if (!checkIn || !checkOut) {
      return rooms.map(room => ({
        ...room.toObject(),
        available: true
      }));
    }

    const roomsWithAvailability: RoomWithAvailability[] = [];

    for (const room of rooms) {
      const available = await this.checkRoomAvailability(
        room._id.toString(),
        checkIn,
        checkOut
      );
      
      roomsWithAvailability.push({
        ...room.toObject(),
        available
      });
    }

    return roomsWithAvailability;
  }

  static async createRoom(roomData: Partial<IRoom>): Promise<IRoom> {
    await connectToDatabase();
    const room = new Room(roomData);
    return await room.save();
  }

  static async updateRoom(id: string, roomData: Partial<IRoom>): Promise<IRoom | null> {
    await connectToDatabase();
    return await Room.findByIdAndUpdate(id, roomData, { new: true });
  }

  static async deleteRoom(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await Room.findByIdAndDelete(id);
    return !!result;
  }
}
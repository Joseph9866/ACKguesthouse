import { connectToDatabase } from '../lib/mongodb';
import { Booking, IBooking } from '../models/Booking';
import { Room } from '../models/Room';
import { RoomService } from './roomService';

export interface BookingCreateData {
  room_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  special_requests?: string;
  total_amount: number;
}

export class BookingService {
  static calculateDepositAmount(totalAmount: number): number {
    // Calculate 50% deposit, rounded up to nearest 50 KSh
    return Math.ceil((totalAmount * 0.5) / 50) * 50;
  }

  static async createBooking(bookingData: BookingCreateData): Promise<IBooking> {
    await connectToDatabase();

    // Check room availability
    const isAvailable = await RoomService.checkRoomAvailability(
      bookingData.room_id,
      bookingData.check_in_date,
      bookingData.check_out_date
    );

    if (!isAvailable) {
      throw new Error('Room is not available for the selected dates');
    }

    // Calculate deposit and balance amounts
    const depositAmount = this.calculateDepositAmount(bookingData.total_amount);
    const balanceAmount = bookingData.total_amount - depositAmount;

    const booking = new Booking({
      ...bookingData,
      check_in_date: new Date(bookingData.check_in_date),
      check_out_date: new Date(bookingData.check_out_date),
      deposit_amount: depositAmount,
      balance_amount: balanceAmount,
      deposit_paid: false,
      payment_status: 'pending_deposit'
    });

    return await booking.save();
  }

  static async getBookingById(id: string): Promise<IBooking | null> {
    await connectToDatabase();
    return await Booking.findById(id);
  }

  static async getBookingsByRoom(roomId: string): Promise<IBooking[]> {
    await connectToDatabase();
    return await Booking.find({ room_id: roomId }).sort({ created_at: -1 });
  }

  static async getAllBookings(): Promise<IBooking[]> {
    await connectToDatabase();
    return await Booking.find({}).sort({ created_at: -1 });
  }

  static async updateBookingStatus(
    id: string,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ): Promise<IBooking | null> {
    await connectToDatabase();
    return await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }

  static async updatePaymentStatus(
    id: string,
    paymentStatus: 'pending_deposit' | 'deposit_paid' | 'fully_paid',
    depositPaid?: boolean
  ): Promise<IBooking | null> {
    await connectToDatabase();
    
    const updateData: any = { payment_status: paymentStatus };
    if (depositPaid !== undefined) {
      updateData.deposit_paid = depositPaid;
    }

    return await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  static async getBookingsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<IBooking[]> {
    await connectToDatabase();
    
    return await Booking.find({
      $or: [
        {
          check_in_date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        },
        {
          check_out_date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      ]
    }).sort({ check_in_date: 1 });
  }
}
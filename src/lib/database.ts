import { RoomService } from '../services/roomService';
import { BookingService } from '../services/bookingService';
import { PaymentService } from '../services/paymentService';

// Database helper functions for common operations
export class DatabaseService {
  // Room operations
  static async getAllRooms() {
    return await RoomService.getAllRooms();
  }

  static async getRoomById(id: string) {
    return await RoomService.getRoomById(id);
  }

  static async checkRoomAvailability(roomId: string, checkIn: string, checkOut: string) {
    return await RoomService.checkRoomAvailability(roomId, checkIn, checkOut);
  }

  static async getRoomsWithAvailability(checkIn?: string, checkOut?: string) {
    return await RoomService.getRoomsWithAvailability(checkIn, checkOut);
  }

  // Booking operations
  static async createBooking(bookingData: any) {
    return await BookingService.createBooking(bookingData);
  }

  static async getBookingsByRoom(roomId: string) {
    return await BookingService.getBookingsByRoom(roomId);
  }

  static async getAllBookings() {
    return await BookingService.getAllBookings();
  }

  static async updateBookingStatus(bookingId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') {
    return await BookingService.updateBookingStatus(bookingId, status);
  }

  static async getBookingStats() {
    return await BookingService.getBookingStats();
  }

  // Payment operations
  static async createPayment(paymentData: any) {
    return await PaymentService.createPayment(paymentData);
  }

  static async getPaymentsByBooking(bookingId: string) {
    return await PaymentService.getPaymentsByBooking(bookingId);
  }

  static async updatePaymentStatus(paymentId: string, status: 'pending' | 'completed' | 'failed' | 'refunded') {
    return await PaymentService.updatePaymentStatus(paymentId, status);
  }

  static async getPaymentStats() {
    return await PaymentService.getPaymentStats();
  }
}
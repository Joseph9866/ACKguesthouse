import { useState } from 'react';
import { BookingService, BookingCreateData } from '../services/bookingService';
import { testMongoConnection } from '../lib/mongodb';
import type { BookingData, DemoBooking } from '../utils/types';

export const useBookings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = async (bookingData: BookingData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Test MongoDB connection
      const connectionTest = await testMongoConnection();
      
      if (!connectionTest) {
        console.log('MongoDB not available, simulating booking creation:', bookingData);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Store booking in localStorage for demo
        const existingBookings = JSON.parse(localStorage.getItem('demo_bookings') || '[]') as DemoBooking[];
        const newBooking: DemoBooking = {
          id: Date.now().toString(),
          ...bookingData,
          status: 'pending',
          created_at: new Date().toISOString()
        };
        existingBookings.push(newBooking);
        localStorage.setItem('demo_bookings', JSON.stringify(existingBookings));
        
        console.log('Demo booking stored locally:', newBooking);
        return true;
      }

      // Real MongoDB booking logic
      console.log('Creating booking with MongoDB...');

      // Calculate total amount (this would normally come from room data)
      const checkInDate = new Date(bookingData.checkIn);
      const checkOutDate = new Date(bookingData.checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));
      
      // Default pricing - in a real app, you'd fetch this from the room
      const roomPricing: { [key: string]: number } = {
        '1': 3500, // Single room full board
        '2': 4300, // Double room full board
        '3': 6300  // Family room full board
      };
      
      const pricePerNight = roomPricing[bookingData.roomType] || 3500;
      const totalAmount = nights * pricePerNight;

      console.log(`Calculated total: ${nights} nights × KSh ${pricePerNight} = KSh ${totalAmount}`);

      // Create booking data for MongoDB
      const mongoBookingData: BookingCreateData = {
        room_id: bookingData.roomType,
        guest_name: bookingData.name,
        guest_email: bookingData.email,
        guest_phone: bookingData.phone,
        check_in_date: bookingData.checkIn,
        check_out_date: bookingData.checkOut,
        number_of_guests: bookingData.guests,
        special_requests: bookingData.specialRequests || undefined,
        total_amount: totalAmount
      };

      console.log('Creating booking:', mongoBookingData);

      const booking = await BookingService.createBooking(mongoBookingData);

      if (!booking) {
        throw new Error('Failed to create booking');
      }

      console.log('Booking created successfully in MongoDB:', booking._id);
      return true;
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getBookings = async (roomId?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Test MongoDB connection
      const connectionTest = await testMongoConnection();
      
      if (!connectionTest) {
        console.log('Getting demo bookings from localStorage...');
        const demoBookings = JSON.parse(localStorage.getItem('demo_bookings') || '[]') as DemoBooking[];
        
        if (roomId) {
          return demoBookings.filter((booking: DemoBooking) => booking.roomType === roomId);
        }
        
        return demoBookings;
      }

      // Real MongoDB query
      let bookings;
      if (roomId) {
        bookings = await BookingService.getBookingsByRoom(roomId);
      } else {
        bookings = await BookingService.getAllBookings();
      }

      return bookings;
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    createBooking,
    getBookings,
    loading,
    error
  };
};
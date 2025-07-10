import React, { useState } from 'react';
import { Calendar, Users, MessageCircle, AlertCircle, CheckCircle, Database, CreditCard } from 'lucide-react';
import { useRooms } from '../hooks/useRooms';
import { useBookings } from '../hooks/useBookings';
import { usePayments } from '../hooks/usePayments';
import { testSupabaseConnection } from '../lib/supabase';
import PaymentForm from './PaymentForm';
import type { BookingData, PaymentData } from '../utils/types';

interface BookingFormProps {
  selectedRoom?: string;
  onSubmit: (data: BookingData) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ selectedRoom, onSubmit }) => {
  const [formData, setFormData] = useState<BookingData>({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomType: selectedRoom || '',
    specialRequests: ''
  });

  const [errors, setErrors] = useState<Partial<BookingData>>({});
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingTotal, setBookingTotal] = useState(0);
  const { rooms, loading: roomsLoading } = useRooms(formData.checkIn, formData.checkOut);
  const { createBooking, loading: bookingLoading, error: bookingError } = useBookings();
  const { createPayment, loading: paymentLoading } = usePayments();

  // Test Supabase connection on component mount
  React.useEffect(() => {
    const checkConnection = async () => {
      const connected = await testSupabaseConnection();
      setIsSupabaseConnected(connected);
    };
    checkConnection();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingData> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.checkIn) newErrors.checkIn = 'Check-in date is required';
    if (!formData.checkOut) newErrors.checkOut = 'Check-out date is required';
    if (!formData.roomType) newErrors.roomType = 'Please select a room type';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[+]?[\d\s-()]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Validate dates
    if (formData.checkIn && formData.checkOut) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkInDate < today) {
        newErrors.checkIn = 'Check-in date cannot be in the past';
      }

      if (checkOutDate <= checkInDate) {
        newErrors.checkOut = 'Check-out date must be after check-in date';
      }
    }

    // Only check room availability if Supabase is connected
    if (isSupabaseConnected) {
      const selectedRoomData = rooms.find(room => room.id === formData.roomType);
      if (selectedRoomData && !selectedRoomData.available) {
        newErrors.roomType = 'Selected room is not available for these dates';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const bookingResult = await createBooking(formData);
      if (bookingResult) {
        // Calculate total and show payment form
        const total = calculateTotal();
        setBookingTotal(total);
        setBookingId(Date.now().toString()); // In real app, this would come from the booking creation
        setShowPaymentForm(true);
      }
    }
  };

  const handlePaymentSubmit = async (paymentData: PaymentData): Promise<boolean> => {
    const success = await createPayment(paymentData);
    if (success) {
      // Payment successful, complete the booking process
      onSubmit(formData);
      return true;
    }
    return false;
  };

  const calculateDepositAmount = (total: number) => {
    // Calculate 50% deposit, rounded up to nearest 50 KSh
    return Math.ceil((total * 0.5) / 50) * 50;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof BookingData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    return 0;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const selectedRoomData = rooms.find(room => room.id === formData.roomType);
    if (nights > 0 && selectedRoomData) {
      return nights * selectedRoomData.price;
    }
    return 0;
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMinCheckoutDate = () => {
    if (formData.checkIn) {
      const checkInDate = new Date(formData.checkIn);
      checkInDate.setDate(checkInDate.getDate() + 1);
      return checkInDate.toISOString().split('T')[0];
    }
    return getMinDate();
  };

  // Show payment form if booking was created successfully
  if (showPaymentForm && bookingId) {
    const depositAmount = calculateDepositAmount(bookingTotal);
    const balanceAmount = bookingTotal - depositAmount;

    return (
      <div className="space-y-6">
        {/* Booking Summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">Booking Created Successfully!</h3>
          </div>
          <p className="text-green-800 mb-4">
            Your booking request has been created. To confirm your reservation, please pay the required deposit.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium">Guest:</span> {formData.name}</div>
            <div><span className="font-medium">Room:</span> {rooms.find(r => r.id === formData.roomType)?.name}</div>
            <div><span className="font-medium">Check-in:</span> {new Date(formData.checkIn).toLocaleDateString()}</div>
            <div><span className="font-medium">Check-out:</span> {new Date(formData.checkOut).toLocaleDateString()}</div>
            <div><span className="font-medium">Guests:</span> {formData.guests}</div>
            <div><span className="font-medium">Total Amount:</span> KSh {bookingTotal.toLocaleString()}</div>
          </div>
        </div>

        {/* Payment Form */}
        <PaymentForm
          bookingId={bookingId}
          totalAmount={bookingTotal}
          depositAmount={depositAmount}
          balanceAmount={balanceAmount}
          paymentType="deposit"
          onPaymentSubmit={handlePaymentSubmit}
          onCancel={() => {
            setShowPaymentForm(false);
            setBookingId(null);
          }}
        />
      </div>
    );
  }

  if (roomsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <span className="ml-2 text-gray-600">Loading rooms...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Database Connection Status */}
      {isSupabaseConnected !== null && (
        <div className={`border rounded-lg p-4 flex items-start space-x-3 ${
          isSupabaseConnected 
            ? 'bg-green-50 border-green-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <Database className={`h-5 w-5 mt-0.5 ${
            isSupabaseConnected ? 'text-green-500' : 'text-blue-500'
          }`} />
          <div>
            <h4 className={`font-medium ${
              isSupabaseConnected ? 'text-green-800' : 'text-blue-800'
            }`}>
              {isSupabaseConnected ? 'Database Connected' : 'Demo Mode'}
            </h4>
            <p className={`text-sm ${
              isSupabaseConnected ? 'text-green-700' : 'text-blue-700'
            }`}>
              {isSupabaseConnected 
                ? 'Your booking will be saved to the database and you will receive confirmation.'
                : 'Database not available. Your booking will be simulated for demonstration purposes.'
              }
            </p>
          </div>
        </div>
      )}

      {bookingError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="text-red-800 font-medium">Booking Error</h4>
            <p className="text-red-700 text-sm">{bookingError}</p>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+254 712 345 678"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Guests
            </label>
            <select
              id="guests"
              name="guests"
              value={formData.guests}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Date *
            </label>
            <div className="relative">
              <input
                type="date"
                id="checkIn"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleInputChange}
                min={getMinDate()}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.checkIn ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <Calendar className="absolute right-3 top-2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.checkIn && <p className="text-red-500 text-sm mt-1">{errors.checkIn}</p>}
          </div>

          <div>
            <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
              Check-out Date *
            </label>
            <div className="relative">
              <input
                type="date"
                id="checkOut"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleInputChange}
                min={getMinCheckoutDate()}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.checkOut ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <Calendar className="absolute right-3 top-2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.checkOut && <p className="text-red-500 text-sm mt-1">{errors.checkOut}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-1">
              Room Type *
            </label>
            <select
              id="roomType"
              name="roomType"
              value={formData.roomType}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                errors.roomType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a room type</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id} disabled={isSupabaseConnected && !room.available}>
                  {room.name} - KSh {room.price.toLocaleString()}/night {isSupabaseConnected && !room.available ? '(Not Available)' : ''}
                </option>
              ))}
            </select>
            {errors.roomType && <p className="text-red-500 text-sm mt-1">{errors.roomType}</p>}
          </div>
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
          Special Requests (Optional)
        </label>
        <textarea
          id="specialRequests"
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Any special requests or requirements..."
        />
      </div>

      {/* Booking Summary */}
      {calculateNights() > 0 && (
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Nights:</span>
              <span>{calculateNights()}</span>
            </div>
            <div className="flex justify-between">
              <span>Room:</span>
              <span>{rooms.find(r => r.id === formData.roomType)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Rate per night:</span>
              <span>KSh {rooms.find(r => r.id === formData.roomType)?.price.toLocaleString()}</span>
            </div>
            <hr className="border-amber-300" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>KSh {calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          type="submit"
          disabled={bookingLoading || paymentLoading}
          className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
        >
          {(bookingLoading || paymentLoading) ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              <span>Continue to Payment</span>
            </>
          )}
        </button>
        
        <a
          href={`https://wa.me/254759750318?text=Hi, I'd like to make a booking:%0A%0AName: ${formData.name}%0ACheck-in: ${formData.checkIn}%0ACheck-out: ${formData.checkOut}%0AGuests: ${formData.guests}%0ARoom: ${rooms.find(r => r.id === formData.roomType)?.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Book via WhatsApp</span>
        </a>
      </div>
    </form>
  );
};

export default BookingForm;
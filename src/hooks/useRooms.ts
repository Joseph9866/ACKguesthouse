import { useState, useEffect } from 'react';
import { RoomService, RoomWithAvailability } from '../services/roomService';
import { testMongoConnection } from '../lib/mongoose';

export { type RoomWithAvailability } from '../services/roomService';

export const useRooms = (checkIn?: string, checkOut?: string) => {
  const [rooms, setRooms] = useState<RoomWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getFallbackRooms = (): RoomWithAvailability[] => {
    return [
      {
        _id: '1',
        name: 'Single Room',
        description: 'Ideal for solo travelers. Includes one bed and access to essential amenities.',
        price: 3500,
        bed_only: 1000,
        bb: 1200,
        half_board: 2500,
        full_board: 3500,
        capacity: 1,
        amenities: ['TV', 'Desk', 'Free Wi-Fi', 'Private Bathroom', 'Wardrobe'],
        image_url: 'https://jekjzdfuuudzdmdmzyjw.supabase.co/storage/v1/object/public/imagesbucket//ACKbed.jpeg',
        created_at: new Date(),
        updated_at: new Date(),
        available: true
      } as RoomWithAvailability,
      {
        _id: '2',
        name: 'Double Room',
        description: 'Perfect for couples or friends. Comes with a double bed and cozy atmosphere.',
        price: 4300,
        bed_only: 1200,
        bb: 1500,
        half_board: 2800,
        full_board: 4300,
        capacity: 2,
        amenities: ['Desk', 'Wardrobe', 'Private Bathroom', 'Free Wi-Fi', 'TV', 'Mini Fridge'],
        image_url: 'https://jekjzdfuuudzdmdmzyjw.supabase.co/storage/v1/object/public/imagesbucket//ACKbedmain.jpeg',
        created_at: new Date(),
        updated_at: new Date(),
        available: true
      } as RoomWithAvailability,
      {
        _id: '3',
        name: 'Double Room + Extra Bed',
        description: 'Spacious enough for a small family or group. Includes an additional bed for extra comfort.',
        price: 6300,
        bed_only: 2500,
        bb: 2900,
        half_board: 4300,
        full_board: 6300,
        capacity: 3,
        amenities: ['Desk', 'Wardrobe', 'Private Bathroom', 'Free Wi-Fi', 'TV', 'Mini Fridge', 'Seating Area'],
        image_url: 'https://jekjzdfuuudzdmdmzyjw.supabase.co/storage/v1/object/public/imagesbucket//ACKbed3.jpeg',
        created_at: new Date(),
        updated_at: new Date(),
        available: true
      } as RoomWithAvailability
    ];
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test MongoDB connection first
      const connectionTest = await testMongoConnection();
      
      if (!connectionTest) {
        console.warn('MongoDB connection failed, using fallback data');
        setRooms(getFallbackRooms());
        return;
      }

      // Fetch rooms from MongoDB
      console.log('Fetching rooms from MongoDB...');
      const roomsData = await RoomService.getRoomsWithAvailability(checkIn, checkOut);

      if (!roomsData || roomsData.length === 0) {
        console.warn('No rooms found in database, using fallback data');
        setRooms(getFallbackRooms());
        return;
      }

      console.log(`Successfully fetched ${roomsData.length} rooms from MongoDB`);
      setRooms(roomsData);
    } catch (err) {
      console.error('Error in fetchRooms:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch rooms';
      setError(errorMessage);
      
      // Use fallback data on error
      console.warn('Using fallback room data due to error');
      setRooms(getFallbackRooms());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [checkIn, checkOut]);

  return { rooms, loading, error, refetch: fetchRooms };
};
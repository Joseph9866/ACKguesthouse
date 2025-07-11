import { useState, useEffect } from 'react';
import { supabase, testSupabaseConnection } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Room = Database['public']['Tables']['rooms']['Row'] & {
  bed_only: number;
  bb: number;
  half_board: number;
  full_board: number;
};

export interface RoomWithAvailability extends Room {
  available: boolean;
}

export const useRooms = (checkIn?: string, checkOut?: string) => {
  const [rooms, setRooms] = useState<RoomWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getFallbackRooms = (): RoomWithAvailability[] => {
    return [
      {
        id: '1',
        name: 'Single Room',
        description: 'Ideal for solo travelers. Includes one bed and access to essential amenities.',
        price: 3500,
        bed_only: 1000,
        bb: 1200,
        half_board: 2500,
        full_board: 3500,
        capacity: 1,
        amenities: ['TV', 'Desk', 'Free Wi-Fi'],
        image_url: 'https://jekjzdfuuudzdmdmzyjw.supabase.co/storage/v1/object/public/imagesbucket//ACKbed.jpeg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        available: true
      },
      {
        id: '2',
        name: 'Double Room',
        description: 'Perfect for couples or friends. Comes with a double bed and cozy atmosphere.',
        price: 5500,
        bed_only: 1200,
        bb: 1500,
        half_board: 2800,
        full_board: 4300,
        capacity: 2,
        amenities: ['Desk', 'Wardrobe', 'Private Bathroom', 'Free Wi-Fi', 'TV'],
        image_url: 'https://jekjzdfuuudzdmdmzyjw.supabase.co/storage/v1/object/public/imagesbucket//ACKbedmain.jpeg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        available: true
      },
      {
        id: '3',
        name: 'Double Room + Extra Bed',
        description: 'Spacious enough for a small family or group. Includes an additional bed for extra comfort.',
        price: 8500,
        bed_only: 2500,
        bb: 2900,
        half_board: 4300,
        full_board: 6300,
        capacity: 3,
        amenities: ['Desk', 'Wardrobe', 'Private Bathroom', 'Free Wi-Fi', 'TV'],
        image_url: 'https://zsayrztvhbduflijzefb.supabase.co/storage/v1/object/public/imagesbucket//ACKbedview.jpeg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        available: true
      }
    ];
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test Supabase connection first
      const connectionTest = await testSupabaseConnection();
      
      if (!connectionTest) {
        console.warn('Supabase connection failed, using fallback data');
        setRooms(getFallbackRooms());
        return;
      }

      // Fetch rooms from Supabase
      console.log('Fetching rooms from Supabase...');
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('price');

      if (roomsError) {
        console.error('Supabase rooms query error:', roomsError);
        throw new Error(`Failed to fetch rooms: ${roomsError.message}`);
      }

      if (!roomsData || roomsData.length === 0) {
        console.warn('No rooms found in database, using fallback data');
        setRooms(getFallbackRooms());
        return;
      }

      console.log(`Successfully fetched ${roomsData.length} rooms from Supabase`);

      // Check availability for each room if dates are provided
      const roomsWithAvailability: RoomWithAvailability[] = [];

      for (const room of roomsData) {
        let available = true;

        if (checkIn && checkOut) {
          try {
            console.log(`Checking availability for room ${room.id}...`);
            const { data: availabilityData, error: availabilityError } = await supabase
              .rpc('check_room_availability', {
                room_id_param: room.id,
                check_in_param: checkIn,
                check_out_param: checkOut
              });

            if (availabilityError) {
              console.error('Availability check error for room', room.id, ':', availabilityError);
              // Default to available if check fails
              available = true;
            } else {
              available = availabilityData === true;
              console.log(`Room ${room.id} availability:`, available);
            }
          } catch (err) {
            console.error('Error checking availability for room:', room.id, err);
            // Default to available if check fails
            available = true;
          }
        }

        roomsWithAvailability.push({
          ...room,
          available
        });
      }

      setRooms(roomsWithAvailability);
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
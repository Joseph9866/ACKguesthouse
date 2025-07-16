import { connectToDatabase } from '../lib/mongoose';
import { Room } from '../models/Room';

const seedRooms = async () => {
  try {
    await connectToDatabase();
    
    // Clear existing rooms
    await Room.deleteMany({});
    console.log('🗑️ Cleared existing rooms');
    
    // Insert seed data
    const rooms = [
      {
        name: 'Single Room',
        description: 'Ideal for solo travelers. Includes one bed and access to essential amenities.',
        price: 3500,
        bed_only: 1000,
        bb: 1200,
        half_board: 2500,
        full_board: 3500,
        capacity: 1,
        amenities: ['Free Wi-Fi', 'Private Bathroom', 'TV', 'Desk', 'Wardrobe'],
        image_url: 'https://jekjzdfuuudzdmdmzyjw.supabase.co/storage/v1/object/public/imagesbucket//ACKbed.jpeg'
      },
      {
        name: 'Double Room',
        description: 'Perfect for couples or friends. Comes with a double bed and cozy atmosphere.',
        price: 4300,
        bed_only: 1200,
        bb: 1500,
        half_board: 2800,
        full_board: 4300,
        capacity: 2,
        amenities: ['Free Wi-Fi', 'Private Bathroom', 'TV', 'Desk', 'Wardrobe', 'Mini Fridge'],
        image_url: 'https://jekjzdfuuudzdmdmzyjw.supabase.co/storage/v1/object/public/imagesbucket//ACKbedmain.jpeg'
      },
      {
        name: 'Double Room + Extra Bed',
        description: 'Spacious enough for a small family or group. Includes an additional bed for extra comfort.',
        price: 6300,
        bed_only: 2500,
        bb: 2900,
        half_board: 4300,
        full_board: 6300,
        capacity: 3,
        amenities: ['Free Wi-Fi', 'Private Bathroom', 'TV', 'Desk', 'Wardrobe', 'Mini Fridge', 'Seating Area'],
        image_url: 'https://jekjzdfuuudzdmdmzyjw.supabase.co/storage/v1/object/public/imagesbucket//ACKbed3.jpeg'
      }
    ];

    const createdRooms = await Room.insertMany(rooms);
    console.log(`✅ Successfully seeded ${createdRooms.length} rooms`);
    
    // Display created rooms
    createdRooms.forEach(room => {
      console.log(`📍 ${room.name}: KSh ${room.full_board} (${room.capacity} guests)`);
    });
    
    return createdRooms;
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Export for use in other scripts
export { seedRooms };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedRooms()
    .then(() => {
      console.log('🎉 Database seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database seeding failed:', error);
      process.exit(1);
    });
}
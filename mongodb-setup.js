// MongoDB Setup Commands for ACK Guest House
// Run these commands in MongoDB Compass or MongoDB Shell

// 1. Switch to the database (creates it if it doesn't exist)
use('ack-guest-house');

// 2. Create Rooms Collection with sample data
db.rooms.insertMany([
  {
    name: "Single Room",
    description: "Ideal for solo travelers. Includes one bed and access to essential amenities.",
    price: 3500,
    bed_only: 1000,
    bb: 1200,
    half_board: 2500,
    full_board: 3500,
    capacity: 1,
    amenities: ["Free Wi-Fi", "Private Bathroom", "TV", "Desk", "Wardrobe"],
    image_url: "https://jekjzdfuuudzdmdmzyjw.supabase.co/storage/v1/object/public/imagesbucket//ACKbed.jpeg",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: "Double Room",
    description: "Perfect for couples or friends. Comes with a double bed and cozy atmosphere.",
    price: 4300,
    bed_only: 1200,
    bb: 1500,
    half_board: 2800,
    full_board: 4300,
    capacity: 2,
    amenities: ["Free Wi-Fi", "Private Bathroom", "TV", "Desk", "Wardrobe", "Mini Fridge"],
    image_url: "https://jekjzdfuuudzdmdmzyjw.supabase.co/storage/v1/object/public/imagesbucket//ACKbedmain.jpeg",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: "Double Room + Extra Bed",
    description: "Spacious enough for a small family or group. Includes an additional bed for extra comfort.",
    price: 6300,
    bed_only: 2500,
    bb: 2900,
    half_board: 4300,
    full_board: 6300,
    capacity: 3,
    amenities: ["Free Wi-Fi", "Private Bathroom", "TV", "Desk", "Wardrobe", "Mini Fridge", "Seating Area"],
    image_url: "https://jekjzdfuuudzdmdmzyjw.supabase.co/storage/v1/object/public/imagesbucket//ACKbed3.jpeg",
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// 3. Create indexes for better performance
db.rooms.createIndex({ name: 1 });
db.rooms.createIndex({ price: 1 });
db.rooms.createIndex({ capacity: 1 });

// 4. Create Bookings Collection (empty initially, will be populated by the app)
// Just create the collection with proper indexes
db.bookings.createIndex({ room_id: 1 });
db.bookings.createIndex({ guest_email: 1 });
db.bookings.createIndex({ check_in_date: 1, check_out_date: 1 });
db.bookings.createIndex({ status: 1 });
db.bookings.createIndex({ payment_status: 1 });
db.bookings.createIndex({ created_at: -1 });

// 5. Create Payments Collection (empty initially, will be populated by the app)
// Just create the collection with proper indexes
db.payments.createIndex({ booking_id: 1 });
db.payments.createIndex({ status: 1 });
db.payments.createIndex({ payment_type: 1 });
db.payments.createIndex({ payment_method: 1 });
db.payments.createIndex({ created_at: -1 });

// 6. Verify the setup
print("=== Database Setup Complete ===");
print("Collections created:");
db.getCollectionNames().forEach(collection => print("- " + collection));

print("\nRooms inserted:");
db.rooms.find({}, { name: 1, price: 1, capacity: 1 }).forEach(room => {
  print(`- ${room.name}: KSh ${room.price} (${room.capacity} guests)`);
});

print("\nIndexes created for rooms:");
db.rooms.getIndexes().forEach(index => print("- " + index.name));

print("\nIndexes created for bookings:");
db.bookings.getIndexes().forEach(index => print("- " + index.name));

print("\nIndexes created for payments:");
db.payments.getIndexes().forEach(index => print("- " + index.name));

print("\n✅ Database setup completed successfully!");
// Additional MongoDB Queries for ACK Guest House Management
// Use these commands in MongoDB Compass for database management

// === ROOM MANAGEMENT ===

// 1. View all rooms
db.rooms.find().pretty();

// 2. Find rooms by capacity
db.rooms.find({ capacity: { $gte: 2 } }).pretty();

// 3. Find rooms within price range
db.rooms.find({ 
  full_board: { $gte: 3000, $lte: 5000 } 
}).pretty();

// 4. Update room pricing
db.rooms.updateOne(
  { name: "Single Room" },
  { 
    $set: { 
      full_board: 3600,
      updated_at: new Date()
    }
  }
);

// === BOOKING MANAGEMENT ===

// 5. View all bookings
db.bookings.find().sort({ created_at: -1 }).pretty();

// 6. Find bookings by status
db.bookings.find({ status: "pending" }).pretty();

// 7. Find bookings by date range
db.bookings.find({
  check_in_date: {
    $gte: new Date("2025-01-01"),
    $lte: new Date("2025-12-31")
  }
}).pretty();

// 8. Find bookings for a specific room
db.bookings.find({ room_id: ObjectId("ROOM_ID_HERE") }).pretty();

// 9. Update booking status
db.bookings.updateOne(
  { _id: ObjectId("BOOKING_ID_HERE") },
  { 
    $set: { 
      status: "confirmed",
      updated_at: new Date()
    }
  }
);

// === PAYMENT MANAGEMENT ===

// 10. View all payments
db.payments.find().sort({ created_at: -1 }).pretty();

// 11. Find payments by booking
db.payments.find({ booking_id: ObjectId("BOOKING_ID_HERE") }).pretty();

// 12. Find payments by method
db.payments.find({ payment_method: "mpesa" }).pretty();

// 13. Calculate total revenue
db.payments.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: null, total: { $sum: "$amount" } } }
]);

// 14. Revenue by payment method
db.payments.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: "$payment_method", total: { $sum: "$amount" } } }
]);

// === ANALYTICS QUERIES ===

// 15. Booking statistics by room
db.bookings.aggregate([
  { $group: { 
    _id: "$room_id", 
    total_bookings: { $sum: 1 },
    total_revenue: { $sum: "$total_amount" }
  }},
  { $lookup: {
    from: "rooms",
    localField: "_id",
    foreignField: "_id",
    as: "room_info"
  }},
  { $unwind: "$room_info" },
  { $project: {
    room_name: "$room_info.name",
    total_bookings: 1,
    total_revenue: 1
  }}
]);

// 16. Monthly booking trends
db.bookings.aggregate([
  { $group: {
    _id: {
      year: { $year: "$created_at" },
      month: { $month: "$created_at" }
    },
    bookings: { $sum: 1 },
    revenue: { $sum: "$total_amount" }
  }},
  { $sort: { "_id.year": 1, "_id.month": 1 } }
]);

// 17. Payment status summary
db.bookings.aggregate([
  { $group: {
    _id: "$payment_status",
    count: { $sum: 1 },
    total_amount: { $sum: "$total_amount" }
  }}
]);

// === MAINTENANCE QUERIES ===

// 18. Clean up old pending bookings (older than 24 hours)
db.bookings.deleteMany({
  status: "pending",
  created_at: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
});

// 19. Update all rooms with new amenity
db.rooms.updateMany(
  {},
  { $addToSet: { amenities: "24/7 Reception" } }
);

// 20. Backup important data
db.bookings.find({ status: { $in: ["confirmed", "completed"] } }).pretty();

// === VALIDATION QUERIES ===

// 21. Check for booking conflicts
db.bookings.aggregate([
  { $match: { status: { $in: ["pending", "confirmed"] } } },
  { $group: {
    _id: {
      room_id: "$room_id",
      check_in: "$check_in_date",
      check_out: "$check_out_date"
    },
    count: { $sum: 1 },
    bookings: { $push: "$_id" }
  }},
  { $match: { count: { $gt: 1 } } }
]);

// 22. Find bookings without payments
db.bookings.aggregate([
  { $lookup: {
    from: "payments",
    localField: "_id",
    foreignField: "booking_id",
    as: "payments"
  }},
  { $match: { payments: { $size: 0 } } },
  { $project: {
    guest_name: 1,
    guest_email: 1,
    total_amount: 1,
    status: 1,
    created_at: 1
  }}
]);

print("=== MongoDB Queries Ready ===");
print("Use these queries to manage your ACK Guest House database");
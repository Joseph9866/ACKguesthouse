# MongoDB Setup Guide for ACK Guest House

## Prerequisites
- MongoDB installed locally OR MongoDB Atlas account
- MongoDB Compass (recommended GUI tool)

## Setup Steps

### 1. Local MongoDB Installation

**On macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**On Ubuntu:**
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**On Windows:**
Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

### 2. MongoDB Atlas (Cloud) Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Whitelist your IP address
6. Create a database user

### 3. Environment Configuration

Create a `.env` file in your project root:

**For Local MongoDB:**
```env
VITE_MONGODB_URI=mongodb://localhost:27017/ack-guest-house
```

**For MongoDB Atlas:**
```env
VITE_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ack-guest-house
```

### 4. Database Setup Using MongoDB Compass

1. **Open MongoDB Compass**
2. **Connect to your database** using the connection string
3. **Create new database** named `ack-guest-house`
4. **Open the MongoDB shell** in Compass (bottom of the interface)
5. **Copy and paste** the contents of `mongodb-setup.js`
6. **Execute the script** to create collections and insert sample data

### 5. Alternative: Command Line Setup

If you prefer using the MongoDB shell:

```bash
# Connect to MongoDB
mongosh

# Or connect to Atlas
mongosh "mongodb+srv://cluster.mongodb.net/ack-guest-house" --username your-username

# Copy and paste the contents of mongodb-setup.js
```

### 6. Verify Setup

After running the setup script, you should see:
- ✅ 3 rooms inserted in the `rooms` collection
- ✅ Proper indexes created for all collections
- ✅ Collections ready for bookings and payments

### 7. Start Your Application

```bash
npm run dev
```

The application will:
- ✅ Connect to MongoDB automatically
- ✅ Display "Database Connected" status
- ✅ Show real room data from MongoDB
- ✅ Handle bookings and payments through MongoDB

## Database Collections

### Rooms Collection
- Stores room information with pricing tiers
- Fields: name, description, pricing (bed_only, bb, half_board, full_board), capacity, amenities

### Bookings Collection
- Manages guest reservations
- Fields: guest info, dates, room selection, payment status, special requests

### Payments Collection
- Tracks payment transactions
- Fields: booking reference, amount, payment method, status, timestamps

## Management Queries

Use the queries in `mongodb-queries.js` for:
- 📊 Analytics and reporting
- 🔍 Finding specific bookings/payments
- 🛠️ Database maintenance
- 📈 Revenue tracking

## Troubleshooting

**Connection Issues:**
- Check if MongoDB service is running
- Verify connection string format
- Ensure IP is whitelisted (for Atlas)

**Permission Issues:**
- Check database user permissions
- Verify authentication credentials

**Data Issues:**
- Use the validation queries to check data integrity
- Run cleanup queries for maintenance

## Security Best Practices

1. **Never commit** `.env` files to version control
2. **Use strong passwords** for database users
3. **Limit IP access** in production
4. **Regular backups** of important data
5. **Monitor database** access logs

---

Your ACK Guest House application is now ready to run with MongoDB! 🎉
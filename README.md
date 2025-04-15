# GambleX - MySQL Database Setup

This README provides instructions for setting up and running the MySQL database for the GambleX gambling website.

## Prerequisites

1. **Node.js and npm**: Make sure you have Node.js and npm installed. Download from [nodejs.org](https://nodejs.org/).

2. **MySQL**: You need:
   - **Local MySQL Server**: Download and install MySQL Community Edition from [mysql.com](https://dev.mysql.com/downloads/mysql/)
   - **MySQL Workbench** (optional): A GUI tool for managing MySQL databases from [mysql.com](https://dev.mysql.com/downloads/workbench/)

## Setup Instructions

### 1. Install Server Dependencies

```bash
cd server
npm install
```

### 2. Create MySQL Database

You can create the database in two ways:

#### Option 1: Using the SQL script

1. Open MySQL client or MySQL Workbench
2. Run the SQL script located at `server/db/init.sql`

#### Option 2: Let Sequelize create the tables

Sequelize can automatically create the tables based on the models.

### 3. Configure MySQL Connection

Create a `.env` file in the server directory (copy from `.env.example`):

```
NODE_ENV=development
PORT=5000

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=casino_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=30d
```

### 4. Initialize the Database

Run the database initialization script to create required tables and initial data:

```bash
cd server
npm run init-db
```

### 5. Start the Server

```bash
cd server
npm start
```

The server will start on port 5000 (or the port specified in your .env file).

## Database Structure

The MySQL database includes the following tables:

1. **Users**: Stores user accounts, authentication data, and balances
2. **Transactions**: Records all deposits and withdrawals
3. **Bets**: Tracks all betting history across all games
4. **Games**: Catalog of all available casino games
5. **GameStats**: Stores aggregated statistics for different game types
6. **Promotions**: Manages promotional offers and bonuses
7. **UserPromotions**: Junction table tracking which users have redeemed which promotions
8. **PaymentMethods**: Stores user payment options

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google login/register
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout user

### User
- `GET /api/users/balance` - Get user balance
- `PUT /api/users/balance` - Update user balance

### Transactions
- `GET /api/transactions` - Get all transactions for a user
- `POST /api/transactions` - Create new transaction

### Bets
- `GET /api/bets` - Get all bets for a user (can filter by game)
- `POST /api/bets` - Create new bet

## Testing the API

You can test the API using tools like Postman or curl. Here's an example using curl:

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## Troubleshooting

1. **MySQL Connection Issues**:
   - Ensure MySQL server is running
   - Check your database credentials in the .env file
   - Verify the database exists and user has proper permissions

2. **Server Won't Start**:
   - Check for errors in the console
   - Ensure all dependencies are installed
   - Verify the port is not in use by another application

3. **Authentication Errors**:
   - Ensure JWT_SECRET is set in your .env file
   - Check that user credentials are correct

4. **Database Initialization Issues**:
   - If tables aren't created properly, try running the SQL script directly
   - Check MySQL error logs for any issues

## Security Notes

For production use:
- Change the JWT_SECRET to a strong, unique value
- Set up proper MySQL authentication with limited privileges
- Use HTTPS for all API communications
- Consider implementing rate limiting
- Encrypt sensitive data in the database

# LearnHub LMS - Learning Management System

A comprehensive Learning Management System built with the MERN stack (MongoDB, Express.js, React, Node.js). LearnHub provides a complete platform for online education with role-based access control for administrators, instructors, and students.

## 🚀 Features

### For Students
- Browse and enroll in courses
- Access course materials and lessons
- Make payments with coupon discounts
- Track enrollment history
- Interactive learning dashboard

### For Instructors
- Create and manage courses
- Add lessons and content
- Track student enrollments
- Manage course pricing and categories

### For Administrators
- Full user management (CRUD operations)
- Course oversight and moderation
- Payment and revenue analytics
- Coupon management system
- System-wide statistics

### Core Features
- 🔐 JWT-based authentication
- 👥 Role-based access control (Admin/Instructor/Student)
- 💳 Payment processing with coupon system
- 📊 Dashboard analytics
- 🎯 Course management with lessons
- 🛡️ Secure password hashing
- 📱 Responsive React frontend

## 🛠 Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Frontend** | React 18 | SPA with React Router v6 |
| **Backend** | Node.js + Express 4 | RESTful API |
| **Database** | MongoDB Atlas | Document store |
| **Authentication** | JWT (jsonwebtoken) | Stateless auth |
| **Password Hashing** | bcryptjs | Secure hashing |
| **HTTP Client** | Axios | API communication |
| **Unique IDs** | uuid | Transaction generation |

## 📋 Prerequisites

- Node.js v18 or higher
- MongoDB Atlas account (or local MongoDB)
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/vkc7233/LMS-Learning-Management-System-.git
cd LMS-Learning-Management-System-
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your MongoDB Atlas connection string and JWT secret
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
# JWT_SECRET=your_random_jwt_secret_here

# Seed the database with demo data
npm run seed

# Start the backend server
npm run dev
```
The backend will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Copy environment file (if needed)
cp .env.example .env

# Start the React development server
npm start
```
The frontend will run on `http://localhost:3000`

## 📖 Usage

### Demo Accounts

After running `npm run seed`, you can log in with these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@lms.com | password123 |
| **Instructor** | instructor@lms.com | password123 |
| **Student** | student@lms.com | password123 |

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/auth/me` - Get current user info

#### Users (Admin Only)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Courses
- `GET /api/courses` - List published courses (public)
- `GET /api/courses/:id` - Get course details (public)
- `POST /api/courses` - Create course (admin/instructor)
- `PUT /api/courses/:id` - Update course (admin/instructor)
- `DELETE /api/courses/:id` - Delete course (admin/instructor)
- `GET /api/courses/instructor/my-courses` - Instructor's courses
- `POST /api/courses/:id/lessons` - Add lesson to course

#### Payments
- `POST /api/payments/checkout` - Process payment & enroll
- `GET /api/payments/my-payments` - User's payment history
- `GET /api/payments` - All payments (admin only)

#### Coupons (Admin Only)
- `GET /api/coupons` - List all coupons
- `POST /api/coupons` - Create coupon
- `PUT /api/coupons/:id` - Update coupon
- `DELETE /api/coupons/:id` - Delete coupon
- `POST /api/coupons/validate` - Validate coupon

## 🏗 Project Structure

```
lms/
├── backend/
│   ├── config/
│   │   ├── db.js          # Database connection
│   │   └── seed.js        # Database seeding
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Auth & validation middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── server.js         # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── App.js        # Main app component
│   └── package.json
└── DESIGN_DOCUMENT.md    # Detailed architecture docs
```

## 🔐 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Authentication**: Stateless token-based auth
- **Role-Based Access**: Granular permissions per user type
- **Input Validation**: Server-side validation
- **CORS Protection**: Configured for cross-origin requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write clear, concise commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or need help with the setup, please open an issue on GitHub.

## 🙏 Acknowledgments

- Built with the MERN stack
- Inspired by modern LMS platforms
- Thanks to the open-source community

---

**Happy Learning! 🎓**
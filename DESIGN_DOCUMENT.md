# LearnHub LMS — Architecture Design Document

## 1. Project Overview

LearnHub is a full-stack Learning Management System (LMS) built with the MERN stack. It supports three user roles — Admin, Instructor, and Student — and provides complete workflows for course creation, enrollment, payment processing, and coupon management.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + React Router v6 | SPA with role-based routing |
| Backend | Node.js + Express 4 | RESTful API server |
| Database | MongoDB + Mongoose | Document store with schemas |
| Auth | JWT (jsonwebtoken) | Stateless authentication |
| Password | bcryptjs | Secure password hashing |
| HTTP Client | Axios | Frontend API calls |
| Unique IDs | uuid | Transaction ID generation |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────┐
│                  React SPA                    │
│  ┌───────────┐ ┌──────────┐ ┌─────────────┐  │
│  │   Admin   │ │Instructor│ │   Student   │  │
│  │  Portal   │ │  Portal  │ │   Portal    │  │
│  └─────┬─────┘ └────┬─────┘ └──────┬──────┘  │
│        └────────────┼──────────────┘          │
│              Axios HTTP Client                │
└───────────────────┬──────────────────────────┘
                    │ HTTP/JSON
┌───────────────────▼──────────────────────────┐
│            Express REST API                   │
│  ┌──────────────────────────────────────────┐ │
│  │         JWT Auth Middleware              │ │
│  │         Role Guard Middleware            │ │
│  └──────────────────────────────────────────┘ │
│  /api/auth  /api/courses  /api/payments       │
│  /api/users /api/coupons                      │
└───────────────────┬──────────────────────────┘
                    │ Mongoose ODM
┌───────────────────▼──────────────────────────┐
│               MongoDB Atlas                   │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │
│  │ Users  │ │Courses │ │Payment │ │Coupons │ │
│  └────────┘ └────────┘ └────────┘ └────────┘ │
└──────────────────────────────────────────────┘
```

---

## 4. Database Schema Design

### User
```
{
  name:            String (required)
  email:           String (unique, required)
  password:        String (hashed, required)
  role:            Enum['admin', 'instructor', 'student']
  enrolledCourses: [ObjectId → Course]
  avatar:          String
  timestamps:      true
}
```

### Course
```
{
  title:            String (required)
  description:      String (required)
  instructor:       ObjectId → User
  price:            Number (≥0)
  category:         String
  level:            Enum['beginner', 'intermediate', 'advanced']
  thumbnail:        String (URL)
  lessons: [{
    title:    String
    content:  String
    videoUrl: String
    duration: Number (minutes)
    order:    Number
  }]
  enrolledStudents: [ObjectId → User]
  isPublished:      Boolean
  rating:           Number (0-5)
  timestamps:       true
}
```

### Payment
```
{
  user:           ObjectId → User
  course:         ObjectId → Course
  amount:         Number (final paid amount)
  originalAmount: Number (pre-discount)
  discountAmount: Number
  couponUsed:     String | null
  status:         Enum['pending', 'success', 'failed']
  transactionId:  String (UUID, unique)
  paymentMethod:  String
  timestamps:     true
}
```

### Coupon
```
{
  code:          String (uppercase, unique)
  discountType:  Enum['percentage', 'fixed']
  discountValue: Number
  maxUses:       Number
  usedCount:     Number
  expiresAt:     Date | null
  isActive:      Boolean
  createdBy:     ObjectId → User
  timestamps:    true
}
```

---

## 5. API Endpoints Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login, receive JWT |
| GET | /api/auth/me | Protected | Get current user |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/users | Admin | List all users |
| GET | /api/users/:id | Admin | Get user details |
| PUT | /api/users/profile | Protected | Update own profile |
| PUT | /api/users/:id | Admin | Update any user |
| DELETE | /api/users/:id | Admin | Delete user |

### Courses
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/courses | Public | List all published courses |
| GET | /api/courses/:id | Public | Get course details |
| POST | /api/courses | Admin/Instructor | Create course |
| PUT | /api/courses/:id | Admin/Instructor (owner) | Update course |
| DELETE | /api/courses/:id | Admin/Instructor (owner) | Delete course |
| GET | /api/courses/instructor/my-courses | Instructor | Own courses |
| POST | /api/courses/:id/lessons | Admin/Instructor (owner) | Add lesson |

### Payments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/payments/checkout | Student | Process payment & enroll |
| GET | /api/payments/my-payments | Student | Own payment history |
| GET | /api/payments | Admin | All payments + revenue |

### Coupons
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/coupons | Admin | List all coupons |
| POST | /api/coupons | Admin | Create coupon |
| PUT | /api/coupons/:id | Admin | Update coupon |
| DELETE | /api/coupons/:id | Admin | Delete coupon |
| POST | /api/coupons/validate | Protected | Validate & preview discount |

---

## 6. Authentication & Authorization Flow

```
Client                    Server
  │                         │
  │── POST /auth/login ────►│
  │                         │── Verify credentials
  │                         │── Generate JWT (7d expiry)
  │◄── { token, user } ─────│
  │                         │
  │── GET /api/protected ──►│
  │   Authorization: Bearer │── Verify JWT signature
  │                         │── Attach req.user
  │                         │── Check role (authorize middleware)
  │◄── Protected Data ──────│
```

**JWT Payload:** `{ id: userId }`  
**Token Storage:** localStorage (client-side)  
**Token Expiry:** 7 days  

---

## 7. Payment Simulation Flow

```
Student selects course
        │
        ▼
Apply coupon (optional)
  POST /coupons/validate
        │
        ▼
POST /payments/checkout
        │
        ├── Validate course exists
        ├── Check not already enrolled
        ├── Apply coupon discount
        ├── Create Payment record (status: 'success')
        ├── Add student to course.enrolledStudents
        ├── Add course to user.enrolledCourses
        └── Increment coupon.usedCount
        │
        ▼
Student gets immediate access
```

---

## 8. Role-Based Access Control

| Feature | Admin | Instructor | Student |
|---------|-------|-----------|---------|
| View all users | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| Create courses | ✅ | ✅ (own) | ❌ |
| Edit any course | ✅ | ❌ | ❌ |
| Edit own courses | ✅ | ✅ | ❌ |
| View all payments | ✅ | ❌ | ❌ |
| Manage coupons | ✅ | ❌ | ❌ |
| Enroll in courses | ❌ | ❌ | ✅ |
| Apply coupons | ❌ | ❌ | ✅ |

---

## 9. Frontend Architecture

### Folder Structure
```
src/
├── App.js               # Routes + role-based navigation
├── index.css            # Global design system styles
├── context/
│   └── AuthContext.js   # Global auth state (React Context)
├── services/
│   └── api.js           # Axios instance + interceptors
├── components/
│   ├── common/
│   │   └── Modal.js     # Reusable modal dialog
│   └── layout/
│       ├── Sidebar.js   # Role-aware navigation
│       └── DashboardLayout.js
└── pages/
    ├── LoginPage.js
    ├── RegisterPage.js
    ├── admin/           # Admin-only pages
    ├── instructor/      # Instructor-only pages
    └── student/         # Student-only pages
```

### State Management
- **Auth state:** React Context API (`AuthContext`)
- **Page state:** Local `useState` / `useEffect` per component
- **No Redux** — application complexity doesn't warrant it

---

## 10. Security Measures

| Concern | Mitigation |
|---------|-----------|
| Password storage | bcrypt with salt rounds=10 |
| API authorization | JWT on every protected route |
| Role enforcement | `authorize()` middleware per route |
| Duplicate emails | MongoDB unique index |
| Duplicate enrollment | `$addToSet` operator |
| Coupon abuse | `usedCount` vs `maxUses` check |
| Expired tokens | 401 interceptor auto-redirects to login |

---

## 11. Running Locally

### Prerequisites
- Node.js v18+
- MongoDB running locally or MongoDB Atlas connection string

### Setup Steps

**1. Clone and install backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm run seed     # Seed demo data
npm run dev      # Start backend on port 5000
```

**2. Install and start frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm start        # Start React on port 3000
```

**3. Access the app:**  
Open `http://localhost:3000`

| Role | Email | Password |
|------|-------|---------|
| Admin | admin@lms.com | password123 |
| Instructor | instructor@lms.com | password123 |
| Student | student@lms.com | password123 |

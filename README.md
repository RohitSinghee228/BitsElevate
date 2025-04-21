# BitsElevate - Layered Architecture

BitsElevate is an education platform that was originally built using a microservices architecture and has been converted to a layered architecture.

## Layered Architecture

The project follows a clean layered architecture pattern with the following layers:

1. **Presentation Layer** - Handles HTTP requests, UI components, and user interaction
2. **Application Layer** - Contains business logic and services
3. **Domain Layer** - Core business entities and models
4. **Infrastructure Layer** - External concerns like databases, third-party services, security, and logging

### Project Structure

```
src/
├── application/         # Application services and business logic
│   └── services/
├── domain/              # Domain models and entities
│   └── models/
├── infrastructure/      # Infrastructure concerns
│   ├── database/
│   ├── external-services/
│   ├── logging/
│   └── security/
├── presentation/        # UI and API routes
│   ├── build/           # Built React app
│   ├── public/
│   ├── routes/          # API route handlers
│   └── src/             # React frontend code
└── index.js             # Application entry point
```

## Features

- User authentication and management
- Course creation and management
- Course enrollment and progress tracking
- Payment processing with Stripe
- Email notifications

## Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React, React Router, Tailwind CSS
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Passport.js
- **Payment Processing**: Stripe
- **Email Service**: Mailgun

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Stripe account (for payments)
- Mailgun account (for emails)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/BitsElevate-layered.git
   cd BitsElevate-layered
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/BitsElevate
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   MAILGUN_API_KEY=your_mailgun_api_key
   MAILGUN_DOMAIN=your_mailgun_domain
   MAILGUN_ENABLED=true
   ```

4. Run the development server:
   ```
   npm run dev
   ```

### Building for Production

1. Build the frontend:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

## Docker Deployment

The application can be deployed using Docker and Docker Compose:

1. Make sure Docker and Docker Compose are installed on your system

2. Create a `.env` file with the necessary environment variables

3. Build and run the containers:
   ```
   docker-compose up -d
   ```

## API Endpoints

### Authentication
- POST `/api/users/register` - Register a new user
- POST `/api/users/login` - Login a user

### Courses
- GET `/api/courses/courseManagement/getAll` - Get all courses
- GET `/api/courses/courseManagement/:id` - Get course by ID
- POST `/api/courses/courseManagement/create` - Create a new course
- PUT `/api/courses/courseManagement/update/:id` - Update a course
- DELETE `/api/courses/courseManagement/:id` - Delete a course
- POST `/api/courses/courseManagement/enroll` - Enroll in a course
- POST `/api/courses/courseManagement/cancelEnrollment` - Cancel enrollment
- GET `/api/courses/courseManagement/enrolledCourses/:userId` - Get user enrolled courses
- GET `/api/courses/courseManagement/completedCourses/:userId` - Get user completed courses
- POST `/api/courses/courseManagement/saveProgress` - Save course progress
- POST `/api/courses/courseManagement/completedCourse` - Mark course as completed

### Payments
- POST `/api/payments/create-payment-intent` - Create payment intent
- POST `/api/payments/confirm-payment` - Confirm payment
- GET `/api/payments/transactions/:userId` - Get user transactions
- GET `/api/payments/transaction/:transactionId` - Get transaction by ID
- POST `/api/payments/refund` - Process refund 

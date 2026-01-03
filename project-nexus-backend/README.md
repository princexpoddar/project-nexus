# Backend Service

This directory acts as the backend service for Project Nexus.

## Features

### Authentication
- **Email/Password Registration**: Requires email verification code sent to user's email
- **Google OAuth**: Sign in with Google account
- **Admin Role Management**: Specific Gmail addresses can be configured as super_admin

### Email Verification
- Users must verify their email address before completing registration
- 6-digit verification codes are sent via email
- Codes expire after 10 minutes

## Environment Variables

Required environment variables in `.env`:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Email Service (for verification codes)
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:5173

# Server Port
PORT=5000
```

### Setting up Gmail for Email Service

1. Enable 2-Step Verification on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use this app password as `EMAIL_APP_PASSWORD` (not your regular Gmail password)

## Admin Configuration

Admin Gmail addresses are configured in `src/config/admins.js`. Add more admin emails to the `ADMIN_EMAILS` array:

```javascript
export const ADMIN_EMAILS = [
    "prabalpoddar73@gmail.com",
    // Add more admin emails here
];
```

Admin users:
- Automatically receive `super_admin` role
- Don't need to select a campus during registration
- Can register with any email domain (not restricted to campus domains)

## API Endpoints

### Authentication
- `POST /auth/request-verification-code` - Request email verification code
- `POST /auth/register` - Register new user (requires verification code)
- `POST /auth/login` - Login with email and password
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback

### Registration Flow (Non-OAuth)

1. User requests verification code: `POST /auth/request-verification-code`
   ```json
   {
     "email": "user@example.com"
   }
   ```

2. User receives verification code via email

3. User registers with verification code: `POST /auth/register`
   ```json
   {
     "name": "John Doe",
     "email": "user@example.com",
     "password": "securepassword",
     "campusId": "campus_id_here",
     "verificationCode": "123456"
   }
   ```

Note: Admin users don't need to provide `campusId` and will automatically get `super_admin` role.
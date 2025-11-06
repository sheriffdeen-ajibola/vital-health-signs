# Vital Health Signs Monitor

A web application for tracking and monitoring vital health signs with secure user authentication and cloud storage.

## Recent Updates: Firebase Integration

The application has been upgraded to include Firebase Authentication and Cloud Firestore storage, replacing the previous localStorage-based system. This update brings several important improvements:

### 🔐 Authentication Features

- **User Accounts**: Users can now create personal accounts with email and password
- **Secure Access**: Each user's health data is private and protected
- **Persistent Sessions**: Stay logged in across browser sessions
- **Profile Management**: Users can view their profile information in the header

### 💾 Data Storage Improvements

- **Cloud Storage**: All vital signs data is now stored in Firebase Cloud Firestore
- **Real-time Sync**: Data automatically syncs across devices
- **Data Persistence**: Health records remain accessible even if local storage is cleared
- **Multi-device Access**: Access your health data from any device by signing in

### 🏗 Technical Architecture Changes

#### Firebase Configuration

- New `firebase-config.js` file for Firebase initialization
- Requires valid Firebase credentials from your Firebase Console

#### Authentication Service

- New `auth-service.js` implements user authentication logic
- Handles sign-up, sign-in, and sign-out operations
- Manages authentication state changes

#### Storage Service Updates

- Migrated from localStorage to Firebase Firestore
- User-specific data collections
- Secure data access rules
- Improved data organization and querying

#### UI Enhancements

- Added authentication modals for sign-in/sign-up
- Updated header with user profile information
- Conditional rendering based on authentication state

## Setup Instructions

1. **Firebase Configuration**

   ```javascript
   // js/firebase-config.js
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
   };
   ```

2. **Firebase Console Setup**

   - Create a new Firebase project
   - Enable Email/Password Authentication
   - Create a Firestore database
   - Copy your project credentials to `firebase-config.js`

3. **Security Rules**
   Add these security rules in your Firebase Console:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;

         match /readings/{reading} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
   }
   ```

## Data Structure

### User Data

```javascript
users/
  /{userId}/
    settings: {
      temperatureUnit: "F",
      weightUnit: "lbs",
      heightUnit: "ft",
      dateFormat: "MM/DD/YYYY",
      notifications: true,
      dataRetentionDays: 365
    }
    readings/
      /{readingId}: {
        type: "Heart Rate",
        value: "75",
        unit: "bpm",
        timestamp: "2025-11-06T10:30:00Z",
        notes: "After morning walk"
      }
```

## Features

### Authentication

- Email/password sign-up and sign-in
- Secure session management
- Password reset functionality
- User profile display

### Data Management

- Automatic data synchronization
- Offline data persistence
- Cross-device accessibility
- Secure data storage

### Privacy

- User-specific data isolation
- Secure data access controls
- Firebase security rules implementation
- Protected API endpoints

## User Experience

1. **New Users**

   - See sign-in/sign-up options on first visit
   - Create account with email and password
   - Automatic redirect to dashboard after authentication

2. **Returning Users**

   - Quick sign-in with saved credentials
   - Immediate access to their health data
   - Persistent session management

3. **Data Management**
   - All vital signs automatically saved to cloud
   - Real-time updates across devices
   - Export functionality for data backup

## Security Considerations

- All data transmissions are encrypted
- User authentication required for data access
- Server-side validation of all requests
- Regular security audits and updates

## Technical Dependencies

- Firebase Authentication
- Firebase Cloud Firestore
- Modern web browser with JavaScript enabled
- Internet connection for cloud features

## Future Enhancements

- OAuth integration for social login
- Two-factor authentication option
- Health data sharing capabilities
- Advanced data analytics features
- Mobile app integration

## Support

For technical support or questions about the new features, please contact the development team or raise an issue in the repository.

## Version History

- **1.0.0**: Initial release with localStorage
- **2.0.0**: Firebase integration with cloud storage and authentication (Current)

This documentation will be updated as new features and improvements are added to the system.

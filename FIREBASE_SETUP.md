# Firebase Setup Instructions

This project uses Firebase for authentication and Firestore database.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Choose a project name and click "Create project"
4. Enable Google Analytics (optional but recommended)

## 2. Enable Authentication

1. In your Firebase project console, go to **Build > Authentication**
2. Click **Get started**
3. Click **Set up sign-in method**
4. Enable **Email/Password** and click **Save**

## 3. Get Firebase Configuration

1. In your Firebase project console, click the **gear icon** ⚙️ (Project settings)
2. Scroll down to "Your apps" and click the web icon 🌐 (Add app)
3. Give it a name (e.g., "code_09-web") and click **Register app**
4. Copy the config object (or just the lines starting with `const firebaseConfig = {`)

## 4. Update .env.local

Copy the configuration from step 3 into `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 5. Start the Application

```bash
pnpm dev
```

## Database Structure

The app stores prompts in Firestore with this structure:

**Collection: `prompts`**

```json
{
  "userId": "user_firebase_uid",
  "title": "Prompt title",
  "text": "Text description",
  "code": "// code here",
  "language": "javascript",
  "createdAt": Timestamp
}
```

## Troubleshooting

### Build Errors

If you see "Firebase: Error (auth/invalid-api-key)" during build:

1. Make sure `.env.local` is in the project root
2. Check that all 6 config values are filled in
3. Restart the dev server after updating `.env.local`

### Login Issues

1. Make sure Email/Password sign-in is enabled in Firebase Console
2. Check browser console for detailed error messages
3. Verify you're using the correct Firebase project

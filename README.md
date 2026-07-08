# Code 09

Prompt management & visualization platform with image uploads via Cloudinary.

## Features

- **Animated Background**: Three.js particle surface with smooth wave animations
- **Theme Support**: Dark/Light mode
- **Authentication**: Firebase email/password authentication
- **Prompt Storage**: Save and organize prompts with text and images
- **Image Uploads**: Drag & drop uploads to Cloudinary (no Firebase storage)
- **Real-time Updates**: Firestore-based real-time prompt management

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **3D Graphics**: Three.js
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Image Storage**: Cloudinary

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase in `lib/firebase.ts` (already configured)

3. Configure Cloudinary in `.env.local`:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=dashboard_uploads
```

4. Run:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Pages

- `/` — Welcome page with animated background
- `/login` — Email/password login
- `/dashboard` — Manage prompts with text and images

## License

Private project.

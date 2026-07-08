<div align="center">
  <img src="./CODE_09-Transparente.svg" alt="Code 09" height="120" />
  <br />
  <h1 align="center" style="margin-top: 0;">Code 09</h1>
  <p align="center">
    <strong>Prompt management & visualization platform</strong><br />
    Store, organize, and retrieve your prompts with a clean, minimal interface.
    Code and text, side by side.
  </p>
</div>

<br />

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Three.js-r180-000000?style=flat-square&logo=three.js" alt="Three.js" />
  <img src="https://img.shields.io/badge/Firebase-Firestore-orange?style=flat-square&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/Cloudinary-uploads-3448C5?style=flat-square&logo=cloudinary" alt="Cloudinary" />
</div>

<br />

---

## Overview

Code 09 is a prompt engineering workspace built for developers who need a clean, distraction-free environment to store, tag, and search their prompts. It combines a living animated background with a powerful editor — because tools should feel as good as they work.

### Features

- **Animated 3D Background** — Dynamic particle surface with gradient wave animation using Three.js
- **Dark / Light Mode** — Seamless theme switching with persistent preference
- **Firebase Authentication** — Email/password auth with session-only persistence
- **Prompt Management** — Create, edit, delete, and copy prompts with one click
- **Image Uploads** — Drag & drop images via Cloudinary (no Firebase storage needed)
- **Category System** — Organize prompts with custom tags and filters
- **Real-time Sync** — Firestore keeps your data in sync across sessions
- **Responsive Layout** — Works on desktop and tablet

<br />

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **3D Graphics** | [Three.js](https://threejs.org/) |
| **Database** | [Firebase Firestore](https://firebase.google.com/products/firestore) |
| **Authentication** | [Firebase Auth](https://firebase.google.com/products/auth) |
| **Image Storage** | [Cloudinary](https://cloudinary.com/) |
| **Fonts** | [Geist](https://vercel.com/font) (Sans & Mono) |

<br />

## Getting Started

### Prerequisites

- Node.js 20+
- Firebase project with Auth (email/password) and Firestore enabled
- Cloudinary account for image uploads

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd code_09

# Install dependencies
npm install

# Configure environment
# Edit .env.local with your credentials:
```

### Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=dashboard_uploads
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

<br />

## Pages

| Route | Description |
|-------|-------------|
| **`/`** | Landing page with animated background and hero section |
| **`/login`** | Email/password sign-in page |
| **`/dashboard`** | Full prompt management workspace |

<br />

## Architecture

```
code_09/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (DottedSurface, providers)
│   ├── page.tsx            # Landing page
│   ├── login/              # Authentication page
│   └── dashboard/          # Main prompt management
├── components/
│   ├── ui/
│   │   ├── dotted-surface.tsx   # Three.js particle background
│   │   ├── image-uploader.tsx   # Cloudinary drag-drop upload
│   │   └── ...                  # Shared UI components
│   └── providers.tsx       # Theme & app providers
├── lib/
│   ├── firebase.ts         # Firebase client config
│   ├── theme-context.tsx   # Dark/light mode context
│   └── utils.ts            # Tailwind CSS utility
├── public/
│   └── CODE_09-Transparente.svg  # App logo
└── package.json
```

<br />

## License

Private project &copy; 2026

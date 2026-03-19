# SkillHub — Local Skill Exchange Platform

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-v10-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=Leaflet&logoColor=white)
![ImgBB API](https://img.shields.io/badge/ImgBB-API-00B8FF?style=for-the-badge)

**SkillHub** is a modern, real-time marketplace where community members can connect to teach, learn, barter, or monetize their skills locally. Whether you want to trade guitar lessons for coding help, or simply hire a local tutor, SkillHub makes it effortless.

Built with 💙 by **Team Bit Benders**.

---

## Table of Contents
1. [Core Features](#-core-features)
2. [Tech Stack](#️-tech-stack)
3. [Architecture & Engineering](#-architecture--engineering)
4. [Security & Database Rules](#-security--database-rules)
5. [Getting Started](#-getting-started)
6. [Project Structure](#-project-structure)
7. [Demo Guide](#-demo-guide)

---

## Core Features

*   **Geospatial Skill Discovery:** Find skilled individuals near you using our interactive map powered by Leaflet, OpenStreetMap, and Geohashing.
*   **Flexible Exchange Modes:** Offer your skills for **Free**, set a **Price** (per hour/session/day), or propose a **Barter** trade.
*   **Real-Time Messaging:** Chat instantly with local experts. No page refreshes required, featuring real-time unread badge counters.
*   **Smart Booking System:** Send, accept, decline, and manage booking requests with built-in conflict detection to prevent double-booking.
*   **Live Notifications:** Receive instant in-app alerts for new messages, booking updates, and profile reviews.
*   **Ratings & Reviews:** Build trust within the community through a robust rating system.
*   **Premium UX/UI:** Features skeleton loaders, smooth fade-in animations, modern toast notifications, and debounced search inputs.

---

## Tech Stack

*   **Frontend:** Next.js (App Router), React 18
*   **Styling:** Tailwind CSS, `react-hot-toast` (Notifications)
*   **Backend/Database:** Firebase Auth, Firestore (NoSQL)
*   **Mapping:** `react-leaflet`, `geofire-common` (Geohashing), Nominatim API (Reverse Geocoding)
*   **Image Hosting:** ImgBB API (Client-side uploads)
*   **Deployment:** Vercel

---

## Architecture & Engineering

SkillHub solves several complex engineering challenges under the hood:

### 1. Geospatial Querying (The Map)
Firestore cannot natively query "find all users within 10km of me." To solve this, we use **Geohashing**. 
When a user sets their location, we convert their coordinates into a Geohash string. During a search, we calculate bounding boxes around the user's radius, query Firestore for users whose Geohashes fall inside those boxes, and calculate the exact distance on the frontend to filter out false positives.

### 2. Real-Time WebSockets
We leverage Firebase's `onSnapshot` listeners to open WebSocket connections to the database. Whenever data changes on the server (like a new message or booking request), the UI updates instantly without requiring a page refresh.

### 3. Preventing Race Conditions (Atomic Increments)
In our chat system, calculating unread message badges previously caused race conditions (if two messages arrived at the exact same millisecond, the counter would be wrong). We solved this by using Firestore's atomic `increment(1)` operator directly on the server.

### 4. Deterministic Chat Generation
To prevent duplicate chat rooms between the same two users, we generate a deterministic Conversation ID by sorting User A and User B's IDs alphabetically and joining them (e.g., `user1_user2`). 

### 5. Google Auth & Onboarding Interception
We intercept the Google Sign-In flow to check if a user's `onboardingComplete` flag is true in Firestore. This ensures existing users go to the Dashboard, while new users are forced through the profile setup wizard.

---

## Security & Database Rules

The Firestore database is strictly locked down using custom security rules to prevent unauthorized reads and writes.

**Notable Security Implementations:**
*   Users can only edit their own profile documents.
*   Users can only read conversations and bookings where their UID exists in the `participants` or `providerId/requesterId` fields.
*   **Cross-User Updates:** When User A reviews User B, User A needs to update User B's average rating. We securely allow this by restricting the update to *only* specific fields:
    ```javascript
    allow update: if request.auth != null && 
      request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['averageRating', 'totalReviews', 'totalBookings']);
    ```

---

## Getting Started

Follow these steps to run SkillHub on your local machine.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/skillhub.git
cd skillhub
```
### 2. Install dependencies
```bash
npm install
```
### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add your Firebase credentials:
### Firebase Configuration
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```
### Image Hosting Configuration
```bash
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

### 4. Create Firestore Indexes
To run the application properly, ensure the following composite indexes are created in your Firebase Console:

- `bookings`: `providerId` (ASC), `createdAt` (DESC)
- `bookings`: `requesterId` (ASC), `createdAt` (DESC)
- `bookings`: `providerId` (ASC), `scheduledDate` (ASC), `scheduledTime` (ASC), `status` (ASC)
- `conversations / messages`: `createdAt` (DESC)

### 5. Run the Development Server
```
npm run dev
```

---

## Project Structure
```
skillhub/
├── src/
│   ├── app/                 # Next.js App Router (Pages, Layouts, Error Boundaries)
│   ├── components/          # Reusable UI components (Navbar, Cards, Modals, Skeletons)
│   │   └── Map/             # Leaflet dynamic map components
│   └── lib/                 # Backend logic & Firebase controllers
│       ├── auth.js          # Authentication & Password Reset logic
│       ├── bookings.js      # Booking & conflict detection logic
│       ├── firebase.js      # Firebase initialization
│       ├── location.js      # Geolocation & Nominatim API logic
│       ├── messages.js      # Real-time chat & pagination
│       ├── notifications.js # In-app notification system
│       ├── reviews.js       # Rating calculations
│       └── users.js         # Profile, Skill CRUD, and ImgBB Upload logic
```
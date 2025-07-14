# My Home

A modern, mobile-friendly web app for tracking household expenses and daily milk deliveries.

## Features
- Add, edit, and delete daily expenses
- Track milk deliveries and costs by supplier
- Visual reports and charts for spending and milk usage
- Multi-user support with Firebase authentication
- Export data to Excel
- Responsive design for desktop and mobile

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/chandrakanth-jinka/MY-Home.git
cd MY-Home
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root with your Firebase config:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Run the app
```bash
npm run dev
```
Visit [http://localhost:9002](http://localhost:9002) in your browser.

## Project Structure
- `src/app/` — Next.js app routes and layout
- `src/components/` — UI and feature components
- `src/lib/` — Firebase and utility functions

## License
MIT

---
Created by Chandrakanth

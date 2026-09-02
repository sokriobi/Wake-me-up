# WakeMe - Smart Transit Alarm PWA

WakeMe is a premium, mobile-first web application designed for bus and train commuters who fall asleep during travel. It uses real-time geolocation tracking to trigger a loud alarm, vibration, and notification when you approach your destination.

## 🚀 Features

- **Real-time Tracking**: Precise location monitoring using the Browser Geolocation API.
- **Smart Proximity Alarm**: Triggers vibration, sound, and a full-screen alert when within the selected radius.
- **Interactive Map**: OpenStreetMap integration via Leaflet for destination selection.
- **PWA Ready**: Installable on iOS and Android for an app-like experience.
- **Background Support**: Works when the screen is locked (as much as modern browsers allow).
- **Premium UI**: Modern, dark-themed interface inspired by Uber and Google Maps.
- **Voice Alerts**: Optional audio announcements ("Your stop is near").
- **Offline Capabilities**: Service worker caching for fast loading and offline reliability.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Mapping**: Leaflet + React Leaflet
- **PWA**: @ducanh2912/next-pwa
- **Language**: TypeScript

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd wakeme
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚢 Deployment to Vercel

This project is optimized for Vercel deployment.

1. Push your code to a GitHub repository.
2. Connect your repository to Vercel.
3. Vercel will automatically detect Next.js and deploy.
4. **Important**: Ensure you access the app over HTTPS, as Geolocation API requires a secure context.

## 📱 PWA Setup

To enable PWA features on your phone:
- **iOS**: Open in Safari, tap "Share", and select "Add to Home Screen".
- **Android**: Open in Chrome, tap the three dots, and select "Install App".

## 🍎 iPhone Native App

WakeMe includes a Capacitor iOS project for reliable native location and local notifications.

1. On a Mac with Xcode installed, clone the project and run:
   ```bash
   npm install
   npm run cap:sync
   npx cap open ios
   ```
2. In Xcode, select the `App` target, choose your Apple Developer team, and set a unique bundle identifier if needed.
3. Under **Signing & Capabilities**, add **Background Modes** and enable **Location updates**.
4. Run the app on a real iPhone, allow **Always** location access and notifications, then start a trip before locking the phone.

The native build uses iOS Core Location through Capacitor and iOS local notifications. A Mac with Xcode and an Apple Developer account are required to build and install the iPhone app; Windows can prepare and sync the project but cannot run the Xcode build.

## 🛡 Security & Permissions

WakeMe requires the following permissions:
- **Location**: To track your proximity to the destination.
- **Notifications**: To alert you even if the app is in the background.
- **Audio/Vibration**: For the alarm experience.

## 📄 License

MIT

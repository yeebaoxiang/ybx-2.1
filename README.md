# ELEOS AI - Background Mobility Assistant

ELEOS is a high-contrast Next.js application designed as a visual assistant for the visually impaired. It utilizes Genkit and Gemini 2.5 Flash to provide real-time spatial obstacle detection.

## 🚀 Deployment Guide

### 1. Get your Gemini API Key
ELEOS uses Gemini's Multimodal Vision capabilities to see through your camera. 
- Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
- Create a new API key.

### 2. Configure Environment Variables
In your Vercel Dashboard (or local `.env` file), add the following keys:

| Key | Value |
| :--- | :--- |
| `GOOGLE_GENAI_API_KEY` | *Your Gemini API Key* |

*Note: You do not need a Groq key for vision, as Gemini 2.5 Flash is our primary multimodal engine for the free tier.*

### 3. Deploy
Push this code to GitHub and connect it to Vercel. 
**Important**: Ensure you are using HTTPS, as the Camera, Speech, and Vibration APIs require a secure origin.

## 🛠 Features for Accessibility

- **High Contrast Theme**: Pure black (`#000000`) and high-visibility yellow (`#FDE047`) for low-vision users.
- **Spatial Clock Orientation**: Objects are announced relative to a 12-hour clock (e.g., "Wall at 11 o'clock").
- **Haptic Language Cycling**:
  - **English**: 1 pulse.
  - **Malay**: 2 pulses.
  - **Mandarin**: 3 pulses.
- **Intensive Warning System**: Rapid pulsing and firm "STOP" commands when an obstacle is less than 1.0m away in the center path.
- **Free Tier Optimized**: Scans every 15 seconds to stay safely within the Gemini 15 RPM free-tier limit.

## 📱 Browser & Mobile Usage
- **Journey Mode**: Tap "START" to begin. Keep the tab active on mobile browsers to ensure continuous audio feedback.
- **Background Limitations**: Browsers generally pause camera access when backgrounded. Use the persistent on-screen overlay to keep the app focused during navigation.

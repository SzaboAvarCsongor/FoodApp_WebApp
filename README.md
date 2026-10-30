# FoodApp_WebApp
Modern ételrendelő app, amely összeköti a felhasználókat a helyi éttermekkel és futárokkal. Gyors rendelés, egyszerű fizetés.

## Running the app

Run `npm run dev` from the repository root to start the backend, Expo's mobile development server, and the web app together. Press Ctrl+C in that terminal to stop all three. Scan the QR code in the terminal with Expo Go to open the mobile app; Vite prints the web app URL.

To start only the mobile development server, run `npm run start:mobile`. To start only the web app, run `npm run start:web`.

The mobile app defaults to `10.0.2.2` for the Android emulator and `localhost` for iOS simulators. For Expo Go on a physical device, create `src/mobile/.env` with `EXPO_PUBLIC_API_URL=http://<your-computer-LAN-IP>:3000/api` so the phone can reach the backend on your local network.

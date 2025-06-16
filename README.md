# Halacha Today

A mobile app that helps users understand Jewish law (Halacha) and what activities are permitted or forbidden on any given day.

## Features

- Shows current Hebrew date and Jewish events
- Lists activities with their permissibility status
- Provides explanations for why activities are permitted or forbidden
- Supports different day types (regular, Shabbat, Yom Tov, fast days)
- Location-based calculations for accurate times
- Push notifications for important events

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/halacha-today.git
cd halacha-today
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Development

- Press 'a' to open on Android
- Press 'i' to open on iOS
- Press 'w' to open in web browser
- Scan QR code with Expo Go (Android) or Camera app (iOS)

## Building for Production

### Android

1. Create a keystore:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure app.json with your keystore details:
```json
{
  "expo": {
    "android": {
      "package": "com.halachatoday.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

3. Build the APK:
```bash
eas build -p android
```

### iOS

1. Configure app.json with your Apple Developer account details:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.halachatoday.app",
      "buildNumber": "1.0.0"
    }
  }
}
```

2. Build the IPA:
```bash
eas build -p ios
```

### Web

1. Build the web version:
```bash
eas build -p web
```

## Deployment

### Android Play Store

1. Create a new app in the Google Play Console
2. Upload the signed APK
3. Fill in store listing details
4. Submit for review

### Apple App Store

1. Create a new app in App Store Connect
2. Upload the IPA
3. Fill in store listing details
4. Submit for review

### Web

1. Deploy to your preferred hosting service (e.g., Vercel, Netlify)
2. Configure custom domain if needed

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
API_URL=your_api_url
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Hebcal for Jewish calendar calculations
- Expo team for the amazing framework
- All contributors and supporters of the project 
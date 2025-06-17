# Halacha Today

A modern app for daily Jewish observance and halacha guidance.

## Features

- Daily zmanim (prayer times)
- Jewish calendar integration
- Halacha guidance
- Location-based services
- Secure authentication
- Offline support

## Prerequisites

- Node.js 16 or later
- npm or yarn
- Expo CLI
- iOS/Android development environment (for native builds)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/halacha-today.git
cd halacha-today
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the environment variables in `.env` with your configuration.

## Development

1. Start the development server:
```bash
npm start
```

2. Run on iOS:
```bash
npm run ios
```

3. Run on Android:
```bash
npm run android
```

## Building for Production

### iOS

1. Configure your Apple Developer account in `eas.json`
2. Build the app:
```bash
eas build --platform ios
```

### Android

1. Configure your Google Play Console account in `eas.json`
2. Build the app:
```bash
eas build --platform android
```

## Deployment

### iOS App Store

1. Submit the build:
```bash
eas submit --platform ios
```

### Google Play Store

1. Submit the build:
```bash
eas submit --platform android
```

## Security

The app implements several security measures:

- Secure storage for sensitive data
- Encrypted communication
- Token-based authentication
- Rate limiting
- Input validation
- Error handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@halachatoday.com or open an issue in the repository. 
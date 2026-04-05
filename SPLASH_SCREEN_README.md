# EC Exchange Splash Screen

This project now includes a custom splash screen with the following features:

## Features

1. **Black Background**: The splash screen has a black background as requested
2. **Animated Text**: 
   - "EC" animates from top to center
   - "EXCHANGE" animates from bottom to center
3. **Loading Animation**: A white loading line moves back and forth in animation
4. **3-Second Duration**: The splash screen displays for 3 seconds before transitioning to the main app

## Implementation Details

### React Native Component
- **File**: `src/components/SplashScreen.tsx`
- **Features**: 
  - Uses React Native's Animated API
  - Smooth transitions with native driver
  - Responsive design that works on different screen sizes

### Native Android Implementation
- **SplashActivity**: `android/app/src/main/java/com/ecexchange/SplashActivity.kt`
- **Layout**: `android/app/src/main/res/layout/splash_screen.xml`
- **Animations**: 
  - `slide_from_top.xml` - For EC text animation
  - `slide_from_bottom.xml` - For EXCHANGE text animation
  - `loading_animation.xml` - For loading line animation
- **Drawable**: `loading_background.xml` - For loading bar background

### App Integration
- **File**: `App.tsx`
- **Logic**: Shows splash screen on app start, then transitions to main app
- **State Management**: Uses React state to control splash screen visibility

## How It Works

1. When the app starts, `SplashActivity` is launched first (configured in AndroidManifest.xml)
2. The native splash screen shows for 3 seconds with animations
3. After 3 seconds, it automatically navigates to `MainActivity`
4. The React Native app starts and shows the React Native splash screen component
5. After another 3 seconds, the React Native splash screen transitions to the main app

## Customization

You can customize the splash screen by:

1. **Changing Colors**: Modify the background color in the layout files
2. **Adjusting Timing**: Change the duration in both SplashActivity.kt and SplashScreen.tsx
3. **Modifying Animations**: Edit the animation XML files for different effects
4. **Updating Text**: Change the text content in the layout files

## Building

To build and test the splash screen:

```bash
# Clean and rebuild Android
cd android
./gradlew clean
cd ..

# Run the app
npx react-native run-android
```

The splash screen will now show every time you launch the app! 
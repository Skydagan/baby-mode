# Baby Mode PWA

A Progressive Web App that creates a safe, colorful environment for children to interact with while parents maintain control of their device.

## Features

- **5 Vibrant Color Screens**: Red, blue, yellow, green, and purple screens with interactive shapes
- **Secure Environment**: Prevents navigation, context menus, and accidental exits
- **Touch Interactions**: Simple tap and swipe gestures for children
- **Parent Exit**: Secret corner-tap sequence for parents to exit safely
- **PWA Support**: Installable, works offline, fullscreen experience
- **Performance Optimized**: Battery-aware, reduced motion support, accessibility features

## How to Use

1. **Installation**: Open in a mobile browser and add to home screen
2. **Activation**: Tap the app icon to launch in fullscreen mode
3. **Child Interaction**: 
   - Swipe left/right to change colors
   - Tap shapes to see animations
   - Shapes move and respond to touch
4. **Parent Exit**: Tap corners in sequence: top-left → top-right → bottom-right → bottom-left

## Technical Details

### Security Features
- Fullscreen lock with escape prevention
- Disabled context menus and text selection
- Prevented keyboard shortcuts and navigation
- Focus lock to prevent app switching
- Orientation lock (portrait mode)

### Accessibility
- Screen reader support
- High contrast mode support
- Reduced motion preferences
- Battery-aware performance optimizations

### PWA Features
- Offline functionality
- App-like installation
- Background sync capabilities
- Push notification support (future)

## File Structure

```
baby-mode-pwa/
├── index.html          # Main app interface
├── manifest.json       # PWA configuration
├── sw.js              # Service worker for offline support
├── css/
│   └── styles.css     # All styling and animations
├── js/
│   ├── app.js         # Main application logic
│   ├── security.js    # Security and lock features
│   └── gestures.js    # Touch interactions and navigation
└── assets/
    └── icons/         # PWA icons (need to be created)
```

## Development

### Requirements
- Modern web browser with PWA support
- HTTPS hosting (required for PWA features)
- Touch-enabled device for full experience

### Testing
1. Serve files over HTTPS
2. Test on various mobile devices
3. Verify installation flow
4. Test parent exit sequence
5. Verify security measures

### Deployment
1. Host on GitHub Pages, Netlify, or similar
2. Ensure HTTPS is enabled
3. Test PWA installation on iOS and Android
4. Verify offline functionality

## Browser Support

- **iOS Safari**: Partial fullscreen support, PWA installable
- **Android Chrome**: Full PWA support, excellent fullscreen
- **Firefox Mobile**: Good support with minor limitations
- **Edge Mobile**: Full PWA support

## Parent Instructions

### To Enter Baby Mode:
1. Open the app
2. Hand device to child
3. App automatically enters fullscreen and locks navigation

### To Exit Baby Mode:
1. Quickly tap these corners in order:
   - Top-left corner
   - Top-right corner  
   - Bottom-right corner
   - Bottom-left corner
2. Confirm exit when prompted

### Safety Notes:
- App prevents most navigation attempts
- Background audio continues playing
- Battery usage is optimized
- No data collection or external requests

## Customization

Colors, shapes, and interactions can be modified in:
- `css/styles.css` - Visual styling
- `js/gestures.js` - Touch interactions
- `index.html` - Screen content and structure

## License

Open source - feel free to modify and distribute.

## Support

For issues or feature requests, please check browser compatibility and ensure HTTPS hosting.
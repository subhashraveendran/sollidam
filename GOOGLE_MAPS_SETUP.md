# Google Maps API Key Setup

## How to get your Google Maps API Key:

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select an existing one
3. **Enable the Geocoding API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Geocoding API"
   - Click "Enable"
4. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

## How to configure in Sollidam:

1. **Create a `.env` file** in the `sollidam` directory
2. **Add your API key**:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
   ```
3. **Restart the development server**:
   ```bash
   npm start
   ```

## Security Notes:

- **Restrict the API key** to only the Geocoding API
- **Add HTTP referrer restrictions** to your domain
- **Never commit the `.env` file** to version control

## Troubleshooting:

- If you see "REQUEST_DENIED" errors, check your API key restrictions
- If Nominatim is being used instead, your Google API key is not configured correctly
- Check the browser console for detailed error messages 
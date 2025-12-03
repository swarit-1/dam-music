# Google Sign-In Setup Guide for Expo

## The Problem

You're seeing: **"Invalid Redirect: You are using a sensitive scope. URI must use https:// as the scheme."**

This happens because Google requires HTTPS redirect URIs for web OAuth clients when accessing sensitive scopes (email, profile).

## Solution: Configure Proper OAuth Clients

You need **THREE** OAuth clients in Google Cloud Console (not just one):

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/apis/credentials
2. Select your project

### Step 2: Create/Verify Web Application Client

**If you already have a Web client:**
1. Click on your existing Web client ID
2. Under "Authorized redirect URIs", add:
   ```
   http://localhost
   https://localhost
   ```
3. Click "SAVE"

**If you need to create one:**
1. Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
2. Application type: **Web application**
3. Name: "Web client (for Firebase)"
4. Authorized redirect URIs:
   ```
   http://localhost
   https://localhost
   ```
5. Click "CREATE"
6. Copy the **Client ID** (format: `xxx.apps.googleusercontent.com`)
7. Add this to your `.env` as `GOOGLE_WEB_CLIENT_ID`

### Step 3: Create iOS Client (for iOS devices)

1. Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
2. Application type: **iOS**
3. Name: "iOS client"
4. Bundle ID: `com.anonymous.dammusic` (from your app.json)
5. Click "CREATE"
6. Copy the **Client ID**
7. Add this to your `.env` as `GOOGLE_IOS_CLIENT_ID`

### Step 4: Create Android Client (for Android devices)

1. First, get your SHA-1 certificate fingerprint:
   ```bash
   # For Expo Go development
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
   Copy the SHA-1 fingerprint

2. Create the client:
   - Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
   - Application type: **Android**
   - Name: "Android client"
   - Package name: `com.anonymous.dammusic` (from your app.json)
   - SHA-1 certificate fingerprint: (paste from above)
   - Click "CREATE"
   - Copy the **Client ID**
   - Add this to your `.env` as `GOOGLE_ANDROID_CLIENT_ID` (if needed)

### Step 5: Update Your .env File

Your `.env` should have:
```
GOOGLE_WEB_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
```

### Step 6: Enable Google Sign-In API

1. In Google Cloud Console, go to: APIs & Services → Library
2. Search for "Google Sign-In API" or "Google+ API"
3. Click "ENABLE"

### Step 7: Configure Firebase

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project → Authentication → Sign-in method
3. Enable "Google" sign-in provider
4. Add your **Web Client ID** from Google Cloud Console
5. Save

## After Setup

1. **Restart your app**:
   ```bash
   npx expo start --clear
   ```

2. **Test Google Sign-In**

3. **Check console logs** - you should see the authentication flow working

## Troubleshooting

### "Invalid Redirect" Error
- Make sure you have `http://localhost` and `https://localhost` in Web client redirect URIs
- Make sure you created separate iOS and Android clients (not just Web)

### "API not enabled" Error
- Enable Google Sign-In API in Google Cloud Console → APIs & Services → Library

### "No matching client found" Error  
- Make sure your bundle IDs match exactly in Google Console and app.json
- For iOS: check `ios.bundleIdentifier` in app.json
- For Android: check `android.package` in app.json

### Still Not Working?
Try the simplified approach - use Firebase UI or a different auth provider like email/password while testing.

## Alternative: Use Email/Password Only

If Google Sign-In is too complex for now, you can disable it and use email/password authentication only (which already works in your app).


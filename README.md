# Pasahero

## Android Release Smoke Test

Build a release APK:

```bash
./android/gradlew -p android assembleRelease
```

Install and launch from CLI:

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell am start -n com.pasahero.passenger/.MainActivity
```

## Debug Splash-Then-Close on Release APK

Use this workflow to catch native startup crashes after dependency changes.

```bash
adb logcat -c
adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell am force-stop com.pasahero.passenger
adb shell am start -n com.pasahero.passenger/.MainActivity
adb logcat -b crash -d
```

Optional process/foreground check:

```bash
adb shell pidof com.pasahero.passenger
adb shell dumpsys activity activities | rg "ResumedActivity|topResumedActivity|com\\.pasahero\\.passenger"
```

## Recommended Dependency-Change Workflow

When installing/updating native packages:

```bash
npm install
npm run verify:native-patches
./android/gradlew -p android assembleRelease
adb logcat -c
adb install -r android/app/build/outputs/apk/release/app-release.apk
adb shell am start -n com.pasahero.passenger/.MainActivity
adb logcat -b crash -d
```

## Required Local Environment Variables

Create a `.env` file in project root before running dev build:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

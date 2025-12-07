import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useFonts } from 'expo-font';
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/contexts/AuthContext";
import { colors } from "./src/theme/colors";

// DEMO MODE: Suppress ALL Firebase errors for clean demo recording
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

console.error = (...args: any[]) => {
    const message = args.join(' ');
    // Suppress ALL Firebase-related errors and common Firebase messages
    if (
        message.includes('Firebase') ||
        message.includes('Firestore') ||
        message.includes('firestore') ||
        message.includes('auth') ||
        message.includes('FIREBASE') ||
        message.includes('[Background]') ||
        message.includes('conversations subscription') ||
        message.includes('presence') ||
        message.includes('Error setting up') ||
        message.includes('Error fetching') ||
        message.includes('Skipping Firestore') ||
        message.includes('subscription')
    ) {
        return;
    }
    originalConsoleError.apply(console, args);
};

console.warn = (...args: any[]) => {
    const message = args.join(' ');
    // Suppress ALL Firebase-related warnings
    if (
        message.includes('Firebase') ||
        message.includes('Firestore') ||
        message.includes('firestore') ||
        message.includes('auth') ||
        message.includes('FIREBASE') ||
        message.includes('AsyncStorage')
    ) {
        return;
    }
    originalConsoleWarn.apply(console, args);
};

console.log = (...args: any[]) => {
    const message = args.join(' ');
    // Suppress Firebase-related logs
    if (
        message.includes('[Background]') ||
        message.includes('[DEMO MODE]') ||
        message.includes('Setting up') ||
        message.includes('Cleaning up') ||
        message.includes('Skipping Firestore')
    ) {
        return;
    }
    originalConsoleLog.apply(console, args);
};

export default function App() {
    const [fontsLoaded] = useFonts({
        'KdamThmorPro': require('./assets/fonts/Kdam_Thmor_Pro/KdamThmorPro-Regular.ttf'),
        'LeagueSpartan': require('./assets/fonts/League_Spartan/static/LeagueSpartan-Regular.ttf'),
    });

    if (!fontsLoaded) {
        return (
            <View style={styles.container}>
                <Text>Loading fonts...</Text>
            </View>
        );
    }

    return (
        <AuthProvider>
            <AppNavigator />
            <StatusBar style="light" />
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
    },
});

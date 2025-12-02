import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useFonts } from 'expo-font';
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/contexts/AuthContext";
import { colors } from "./src/theme/colors";

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

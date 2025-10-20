import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import ProfileScreen from "./screens/ProfileScreen";

export default function App() {
    return (
        <SafeAreaView style={styles.container}>
            <ProfileScreen />
            <StatusBar style="auto" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
});

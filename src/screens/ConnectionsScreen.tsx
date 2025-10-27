import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ConnectionsManager } from "../profile/ConnectionsManager";
import { Connection } from "../types/profile";

interface ConnectionsScreenProps {
    connections: Connection[];
    onRemoveConnection?: (connectionId: string) => void;
    onBack?: () => void;
}

export default function ConnectionsScreen({
    connections,
    onRemoveConnection,
    onBack,
}: ConnectionsScreenProps) {
    return (
        <View style={styles.container}>
            {/* Back button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={onBack}
                accessibilityLabel="Go back"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
                <MaterialIcons name="arrow-back" size={26} color="#111" />
            </TouchableOpacity>

            <ScrollView style={styles.scrollView}>
                <ConnectionsManager
                    connections={connections}
                    onRemoveConnection={onRemoveConnection}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    backButton: {
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollView: {
        flex: 1,
        marginTop: 60,
    },
});

import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Connection } from "../../types/profile";

// Demo connections
const defaultConnections: Connection[] = [];

interface ConnectionsManagerProps {
    connections: Connection[];
    onRemoveConnection?: (connectionId: string) => void;
    onMessageConnection?: (connectionId: string) => void;
}

export const ConnectionsManager: React.FC<ConnectionsManagerProps> = ({
    connections,
    onRemoveConnection,
    onMessageConnection,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const filteredConnections = connections.filter(
        (connection) =>
            connection.displayName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            connection.username
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
    );

    const renderConnectionItem = ({ item }: { item: Connection }) => (
        <View style={styles.connectionItem}>
            {item.avatarUrl ? (
                <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                        {item.displayName.charAt(0).toUpperCase()}
                    </Text>
                </View>
            )}
            <View style={styles.connectionInfo}>
                <Text style={styles.displayName}>{item.displayName}</Text>
                <Text style={styles.username}>@{item.username}</Text>
            </View>
            <View style={styles.connectionActions}>
                <TouchableOpacity
                    style={styles.messageButton}
                    onPress={() =>
                        onMessageConnection
                            ? onMessageConnection(item.id)
                            : alert(`Message ${item.displayName}`)
                    }
                >
                    <MaterialIcons name="message" size={22} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() =>
                        onRemoveConnection
                            ? onRemoveConnection(item.id)
                            : alert(`Remove ${item.displayName}`)
                    }
                >
                    <MaterialIcons name="close" size={22} color="#ff3b30" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Connections</Text>
            <View>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search connections..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <FlatList
                data={filteredConnections}
                renderItem={renderConnectionItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            No connections found
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 15,
        marginBottom: 15,
        color: "#333",
    },
    searchInput: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    tabs: {
        flexDirection: "row",
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: "#007AFF",
    },
    tabText: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    activeTabText: {
        color: "#007AFF",
        fontWeight: "600",
    },
    connectionItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    avatarText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "600",
    },
    connectionInfo: {
        flex: 1,
    },
    displayName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    username: {
        fontSize: 14,
        color: "#666",
    },
    connectionActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    messageButton: {
        padding: 6,
        marginRight: 4,
        backgroundColor: "transparent",
    },
    removeButton: {
        padding: 6,
        backgroundColor: "transparent",
    },
    mutualBadge: {
        fontSize: 12,
        color: "#34C759",
        fontWeight: "600",
        marginBottom: 8,
    },
    emptyContainer: {
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
});

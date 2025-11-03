import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    FlatList,
    LayoutAnimation,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

interface Collaboration {
    id: string;
    title: string;
    partner: string;
    status: "active" | "review" | "completed";
    progress: number;
    lastActivity: string;
    genre: string;
}

const ManagementScreen = () => {
    const [expanded, setExpanded] = useState<string | null>(null);

    // Mock data for collaborations
    const collaborations: Collaboration[] = [
        {
            id: "1",
            title: "Summer Vibes Track",
            partner: "Alex Johnson",
            status: "active",
            progress: 75,
            lastActivity: "2 hours ago",
            genre: "Pop",
        },
        {
            id: "2",
            title: "Midnight Sessions",
            partner: "Sarah Chen",
            status: "review",
            progress: 90,
            lastActivity: "1 day ago",
            genre: "R&B",
        },
        {
            id: "3",
            title: "Electric Dreams",
            partner: "Mike Rodriguez",
            status: "active",
            progress: 45,
            lastActivity: "3 hours ago",
            genre: "Electronic",
        },
        {
            id: "4",
            title: "Acoustic Journey",
            partner: "Emma Wilson",
            status: "completed",
            progress: 100,
            lastActivity: "1 week ago",
            genre: "Folk",
        },
    ];

    const filteredCollaborations = collaborations.filter(collab => collab.status !== 'completed');

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "#4CAF50";
            case "review":
                return "#FF9800";
            case "completed":
                return "#2196F3";
            default:
                return colors.gray500;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "active":
                return "In Progress";
            case "review":
                return "Under Review";
            case "completed":
                return "Completed";
            default:
                return status;
        }
    };


    const renderCollaboration = ({ item }: { item: Collaboration }) => {
        const isExpanded = expanded === item.id;
        return (
            <View style={styles.collabCard}>
                <TouchableOpacity
                    style={styles.dropdownHeader}
                    onPress={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setExpanded(isExpanded ? null : item.id);
                    }}
                    activeOpacity={0.8}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={styles.collabTitle}>{item.title}</Text>
                    </View>
                    <MaterialIcons
                        name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                        size={28}
                        color="#222"
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.dropdownContent}>
                        <View style={styles.collabDetailsColumn}>
                            <View style={[styles.infoRow, styles.infoFirst]}>
                                <Text style={styles.infoLabel}>Last Updated:</Text>
                                <Text style={styles.infoValue}>10/13/2025</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Current Stage:</Text>
                                <Text style={styles.infoValue}>Demo/Recording</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Collaborators:</Text>
                                <Text style={styles.infoValue}>{item.partner}</Text>
                            </View>
                        </View>
                        <View style={styles.todoRow}>
                            <View style={styles.todoCol}>
                                <Text style={styles.todoLabel}>To Do: Party A</Text>
                                <View style={styles.todoBox} />
                                <View style={styles.todoBox} />
                            </View>
                            <View style={styles.todoCol}>
                                <Text style={styles.todoLabel}>To Do: Party B</Text>
                                <View style={styles.todoBox} />
                                <View style={styles.todoBox} />
                            </View>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Work Flow</Text>
                <Text style={styles.headerSubtitle}>Manage your music projects</Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() =>
                        Alert.alert(
                            "New Collaboration",
                            "Start a new music collaboration"
                        )
                    }
                >
                    <MaterialIcons
                        name="add"
                        size={24}
                        color={colors.brandPurple}
                    />
                    <Text style={styles.quickActionText}>New Project</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() =>
                        Alert.alert(
                            "Find Collaborators",
                            "Browse available musicians"
                        )
                    }
                >
                    <MaterialIcons
                        name="search"
                        size={24}
                        color={colors.brandPurple}
                    />
                    <Text style={styles.quickActionText}>Find Partners</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() =>
                        Alert.alert("Templates", "Use project templates")
                    }
                >
                    <MaterialIcons
                        name="description"
                        size={24}
                        color={colors.brandPurple}
                    />
                    <Text style={styles.quickActionText}>Templates</Text>
                </TouchableOpacity>
            </View>

            {/* Collaborations List */}
            <FlatList
                data={filteredCollaborations}
                renderItem={renderCollaboration}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.collabList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialIcons
                            name="music-note"
                            size={48}
                            color={colors.gray300}
                        />
                        <Text style={styles.emptyTitle}>
                            No active collaborations
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            Start a new music collaboration to get started!
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gray100,
    },
    header: {
        backgroundColor: colors.white,
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: colors.surfaceDark,
        marginBottom: 4,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: colors.white,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
        padding: 4,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: colors.brandPurple,
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.gray500,
    },
    activeTabText: {
        color: colors.white,
    },
    quickActions: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    quickActionButton: {
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        minWidth: 80,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionText: {
        fontSize: 12,
        color: colors.brandPurple,
        fontWeight: "600",
        marginTop: 4,
    },
    collabList: {
        padding: 20,
    },
    collabCard: {
        backgroundColor: '#f3f3f3',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#d1d5db',
        overflow: 'hidden',
    },
    dropdownHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        backgroundColor: '#fff',
    },
    dropdownContent: {
        backgroundColor: '#f3f3f3',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    infoRow: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginBottom: 12,
        width: '100%',
    },
    infoLabel: {
        fontWeight: '600',
        color: '#444',
        fontSize: 14,
        marginBottom: 4,
    },
    infoValue: {
        color: '#222',
        fontSize: 14,
    },
    infoFirst: {
        paddingTop: 8,
    },
    todoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    todoCol: {
        flex: 1,
        alignItems: 'center',
    },
    todoLabel: {
        fontWeight: '600',
        color: '#444',
        fontSize: 13,
        marginBottom: 6,
    },
    todoBox: {
        width: 70,
        height: 20,
        backgroundColor: '#d1d5db',
        borderRadius: 6,
        marginBottom: 6,
    },
    collabHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    collabInfo: {
        flex: 1,
    },
    collabTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.surfaceDark,
        marginBottom: 4,
    },
    collabPartner: {
        fontSize: 14,
        color: colors.gray500,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: "600",
    },
    collabDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    genreTag: {
        backgroundColor: "#f0f8ff",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    genreText: {
        fontSize: 12,
        color: colors.brandPurple,
        fontWeight: "500",
    },
    lastActivity: {
        fontSize: 12,
        color: colors.gray500,
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: colors.gray200,
        borderRadius: 3,
        marginRight: 12,
    },
    progressFill: {
        height: "100%",
        backgroundColor: colors.brandPurple,
        borderRadius: 3,
    },
    progressText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.brandPurple,
    },
    collabActions: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: colors.gray100,
    },
    actionText: {
        fontSize: 12,
        color: colors.brandPurple,
        fontWeight: "500",
        marginLeft: 4,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.gray500,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.gray400,
        textAlign: "center",
        paddingHorizontal: 40,
    },
    separator: {
        height: 1,
        backgroundColor: '#d1d5db',
        marginVertical: 6,
    },
    collabDetailsColumn: {
        flexDirection: 'column',
    },
});

export default ManagementScreen;

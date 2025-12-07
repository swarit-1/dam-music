import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ManagementStackParamList } from "../navigation/ManagementNavigator";
import { colors } from "../theme/colors";

type ManagementScreenNavigationProp = StackNavigationProp<
    ManagementStackParamList,
    "ManagementHome"
>;

interface Collaboration {
    id: string;
    title: string;
    partner: string;
    status: "active" | "review" | "completed";
    progress: number;
    lastActivity: string;
    genre: string;
    priorityTask?: string;
}

const ManagementScreen = () => {
    const navigation = useNavigation<ManagementScreenNavigationProp>();

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
            priorityTask: "Finalize chorus vocal comp",
        },
        {
            id: "2",
            title: "Midnight Sessions",
            partner: "Sarah Chen",
            status: "review",
            progress: 90,
            lastActivity: "1 day ago",
            genre: "R&B",
            priorityTask: "Address mix notes",
        },
        {
            id: "3",
            title: "Electric Dreams",
            partner: "Mike Rodriguez",
            status: "active",
            progress: 45,
            lastActivity: "3 hours ago",
            genre: "Electronic",
            priorityTask: "Create bridge synth lead",
        },
    ];

    const filteredCollaborations = collaborations.filter(
        (c) => c.status !== "completed"
    );

    const renderCollaboration = ({ item }: { item: Collaboration }) => (
        <View style={styles.collabWrapper}>
            <View style={styles.projectCard}>
                <View style={styles.collabHeader}>
                    <View style={styles.collabInfo}>
                        <Text style={styles.collabTitle}>{item.title}</Text>
                        <View style={styles.metaRow}>
                            <Text style={styles.collabPartner}>
                                With {item.partner}
                            </Text>
                            <Text style={styles.lastActivity}>
                                Updated {item.lastActivity}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.entryButton}
                        onPress={() =>
                            navigation.navigate("ProjectWorkflow", {
                                projectId: item.id,
                                projectName: item.title,
                                collaborator: item.partner,
                            })
                        }
                        accessibilityLabel={`Open ${item.title}`}
                    >
                        <MaterialIcons
                            name="arrow-forward-ios"
                            size={18}
                            color={colors.brandPurple700}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.priorityBox}>
                <View style={styles.priorityRow}>
                    <MaterialIcons
                        name="priority-high"
                        size={16}
                        color={colors.brandPurple700}
                        style={styles.priorityIcon}
                    />
                    <Text style={styles.priorityLabel}>Priority</Text>
                    <Text style={styles.priorityText}>
                        {item.priorityTask ?? "No priority set"}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <LinearGradient
            colors={["rgba(81, 43, 121, 1)", "rgba(149, 79, 223, 1)"]}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Work Flow</Text>
                <Text style={styles.headerSubtitle}>
                    Manage your music projects
                </Text>
            </View>

            <FlatList
                data={filteredCollaborations}
                renderItem={renderCollaboration}
                keyExtractor={(i) => i.id}
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
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        backgroundColor: "transparent",
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 0,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: colors.white,
        marginBottom: 4,
        textAlign: "center",
    },
    headerSubtitle: {
        fontSize: 16,
        color: "rgba(255,255,255,0.9)",
        textAlign: "center",
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
    collabList: { padding: 20 },
    collabWrapper: { marginBottom: 16 },
    projectCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
    },
    collabHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 0,
    },
    collabInfo: { flex: 1 },
    collabTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.surfaceDark,
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    collabPartner: { fontSize: 14, color: colors.gray600, fontWeight: "500" },
    lastActivity: { fontSize: 12, color: colors.gray600, fontWeight: "500" },
    entryButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(157,89,226,0.08)",
        marginTop: -2,
    },
    priorityBox: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 10,
        marginTop: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginHorizontal: 2,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    priorityLabel: {
        fontSize: 13,
        color: colors.gray400,
        fontWeight: "700",
        marginRight: 6,
    },
    priorityRow: { flexDirection: "row", alignItems: "center" },
    priorityIcon: { marginRight: 4 },
    priorityText: {
        fontSize: 13,
        color: colors.surfaceDark,
        fontWeight: "600",
        flex: 1,
    },
    emptyState: { alignItems: "center", paddingVertical: 60 },
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
});

export default ManagementScreen;

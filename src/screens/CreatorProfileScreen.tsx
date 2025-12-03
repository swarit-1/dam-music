import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { getUserProfile } from "../services/authService";
import { createConversation, findExistingDirectConversation } from "../services/conversationService";
import { useAuth } from "../contexts/AuthContext";
import type { NavigationProp } from "@react-navigation/native";

interface CreatorProfileScreenProps {
    route: {
        params: {
            creatorId: string;
            creatorName?: string;
        };
    };
    navigation: NavigationProp<any>;
}

export default function CreatorProfileScreen({
    route,
    navigation,
}: CreatorProfileScreenProps) {
    const { creatorId, creatorName } = route.params;
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [messageLoading, setMessageLoading] = useState(false);

    useEffect(() => {
        loadProfile();
    }, [creatorId]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const profileData = await getUserProfile(creatorId);
            setProfile(profileData);
        } catch (error) {
            console.error("Error loading creator profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMessage = async () => {
        if (!user || !profile) return;

        try {
            setMessageLoading(true);

            // Check if conversation already exists
            const existingConversation = await findExistingDirectConversation(
                [user.uid, creatorId]
            );

            let conversationId: string;

            if (existingConversation) {
                // Use existing conversation
                conversationId = existingConversation.id;
            } else {
                // Create new conversation
                const participants = [
                    {
                        userId: user.uid,
                        displayName: user.displayName || "You",
                        avatar: user.photoURL || undefined,
                        joinedAt: new Date(),
                    },
                    {
                        userId: creatorId,
                        displayName: profile.displayName || creatorName || "Creator",
                        avatar: profile.profileImage || undefined,
                        joinedAt: new Date(),
                    },
                ];
                conversationId = await createConversation(
                    user.uid,
                    participants,
                    "direct"
                );
            }

            // Navigate to the chat screen
            // Navigate to the Messages tab, then to the specific chat
            navigation.navigate("Messages", {
                screen: "EnhancedChat",
                params: {
                    conversationId,
                    chatName: profile.displayName || creatorName || "Creator",
                },
            });
        } catch (error) {
            console.error("Error creating/finding conversation:", error);
            alert("Failed to open chat. Please try again.");
        } finally {
            setMessageLoading(false);
        }
    };

    const handleSendCollaborationRequest = async () => {
        if (!user || !profile) return;

        try {
            setMessageLoading(true);

            // Check if conversation already exists
            const existingConversation = await findExistingDirectConversation(
                [user.uid, creatorId]
            );

            let conversationId: string;

            if (existingConversation) {
                conversationId = existingConversation.id;
            } else {
                // Create new conversation
                const participants = [
                    {
                        userId: user.uid,
                        displayName: user.displayName || "You",
                        avatar: user.photoURL || undefined,
                        joinedAt: new Date(),
                    },
                    {
                        userId: creatorId,
                        displayName: profile.displayName || creatorName || "Creator",
                        avatar: profile.profileImage || undefined,
                        joinedAt: new Date(),
                    },
                ];
                conversationId = await createConversation(
                    user.uid,
                    participants,
                    "direct"
                );
            }

            // Navigate to chat with collaboration request intent
            navigation.navigate("Messages", {
                screen: "EnhancedChat",
                params: {
                    conversationId,
                    chatName: profile.displayName || creatorName || "Creator",
                    initialCollabRequest: true, // Signal to show collab request UI
                },
            });
        } catch (error) {
            console.error("Error sending collaboration request:", error);
            alert("Failed to send collaboration request. Please try again.");
        } finally {
            setMessageLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.brandPurple} />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={64} color={colors.gray400} />
                <Text style={styles.errorText}>Profile not found</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerBackButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    {profile.profileImage ? (
                        <Image
                            source={{ uri: profile.profileImage }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {(profile.displayName || creatorName || "?")
                                    .charAt(0)
                                    .toUpperCase()}
                            </Text>
                        </View>
                    )}

                    <Text style={styles.displayName}>
                        {profile.displayName || creatorName}
                    </Text>

                    {/* Roles */}
                    {profile.role && profile.role.length > 0 && (
                        <View style={styles.rolesContainer}>
                            {profile.role.map((role: string, index: number) => (
                                <View key={index} style={styles.roleChip}>
                                    <Text style={styles.roleChipText}>{role}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Genres */}
                    {profile.genre && profile.genre.length > 0 && (
                        <View style={styles.genresSection}>
                            <Text style={styles.sectionLabel}>Genres</Text>
                            <View style={styles.genresContainer}>
                                {profile.genre.map((genre: string, index: number) => (
                                    <View key={index} style={styles.genreTag}>
                                        <Text style={styles.genreTagText}>{genre}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Bio */}
                    {profile.bio && (
                        <View style={styles.bioSection}>
                            <Text style={styles.sectionLabel}>Bio</Text>
                            <Text style={styles.bioText}>{profile.bio}</Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.messageButton,
                            messageLoading && styles.buttonDisabled,
                        ]}
                        onPress={handleMessage}
                        disabled={messageLoading}
                    >
                        {messageLoading ? (
                            <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                            <>
                                <MaterialIcons
                                    name="chat-bubble"
                                    size={20}
                                    color={colors.white}
                                />
                                <Text style={styles.messageButtonText}>Message</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.collabButton,
                            messageLoading && styles.buttonDisabled,
                        ]}
                        onPress={handleSendCollaborationRequest}
                        disabled={messageLoading}
                    >
                        <MaterialIcons
                            name="groups"
                            size={20}
                            color={colors.brandPurple}
                        />
                        <Text style={styles.collabButtonText}>Collaborate</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: colors.surfaceDark,
    },
    headerBackButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.white,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.black,
    },
    loadingText: {
        color: colors.white,
        fontSize: 16,
        marginTop: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.black,
        padding: 20,
    },
    errorText: {
        color: colors.white,
        fontSize: 18,
        marginTop: 16,
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: colors.brandPurple,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
    profileHeader: {
        alignItems: "center",
        padding: 24,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 16,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.brandPurple,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    avatarText: {
        color: colors.white,
        fontSize: 48,
        fontWeight: "bold",
    },
    displayName: {
        fontSize: 28,
        fontWeight: "bold",
        color: colors.white,
        marginBottom: 12,
    },
    rolesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 8,
        marginBottom: 24,
    },
    roleChip: {
        backgroundColor: colors.brandPurple,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    roleChipText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: "600",
    },
    genresSection: {
        width: "100%",
        marginTop: 16,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: colors.gray300,
        marginBottom: 8,
    },
    genresContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    genreTag: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    genreTagText: {
        color: colors.white,
        fontSize: 13,
    },
    bioSection: {
        width: "100%",
        marginTop: 24,
    },
    bioText: {
        color: colors.gray300,
        fontSize: 15,
        lineHeight: 22,
    },
    actionsContainer: {
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    messageButton: {
        flex: 1,
        backgroundColor: colors.brandPurple,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    messageButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
    collabButton: {
        flex: 1,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: colors.brandPurple,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    collabButtonText: {
        color: colors.brandPurple,
        fontSize: 16,
        fontWeight: "600",
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});

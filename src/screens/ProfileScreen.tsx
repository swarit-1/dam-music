import React, { useState } from "react";
import {
    View,
    SafeAreaView,
    Platform,
    StatusBar,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
} from "react-native";
import { SongList } from "../profile/SongList";
import { ConnectionsManager } from "../profile/ConnectionsManager";
import { Song, Connection, Profile } from "../types/profile";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import * as ImagePicker from "expo-image-picker";
import ConnectionsScreen from "../screens/ConnectionsScreen";
import { VideoGrid } from "../profile/VideoGrid";
import { signOut } from "../services/authService";
import { useUserProfile } from "../hooks/useUserProfile";
import { useAuth } from "../contexts/AuthContext";
import { Video, ResizeMode } from "expo-av";
import * as VideoThumbnails from "expo-video-thumbnails";

export default function ProfileScreen() {
    const { user } = useAuth();
    const { profile, loading, error } = useUserProfile();
    const [showConnectionsScreen, setShowConnectionsScreen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<{ uri: string } | null>(null);
    const [videos, setVideos] = useState<{ uri: string; thumbnail?: string }[]>(
        [
            {
                uri: "https://www.w3schools.com/html/mov_bbb.mp4",
                thumbnail: "https://picsum.photos/300/533?random=1",
            },
            {
                uri: "https://www.w3schools.com/html/movie.mp4",
                thumbnail: "https://picsum.photos/300/533?random=2",
            },
            {
                uri: "https://www.w3schools.com/html/mov_bbb.mp4",
                thumbnail: "https://picsum.photos/300/533?random=3",
            },
        ]
    );
    // Profile data is now fetched from Firebase via useUserProfile hook
    // Default profile for when data is loading
    const defaultProfile: Profile = {
        id: user?.uid || "",
        username: user?.email?.split('@')[0] || "user",
        displayName: user?.displayName || "User",
        bio: "",
        avatarUrl: user?.photoURL || undefined,
        songs: [],
        connections: [],
        followersCount: 0,
        followingCount: 0,
    };

    const displayProfile = profile || defaultProfile;

    const handleEditAvatar = () => {
        console.log("Edit avatar");
    };

    const handlePickVideo = async () => {
        // Request media library permission if needed
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission required",
                "We need access to your media library to upload a video."
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: false,
            quality: 1,
            videoMaxDuration: 60, // short-form content
        });

        if (result.canceled) return;

        const asset = result.assets[0];
        // TODO: Upload asset.uri to backend and create a new post
        Alert.alert("Video selected", asset.fileName || asset.uri);
    };

    const handleAddVideo = async () => {
        if (videos.length >= 3) {
            Alert.alert(
                "Upgrade Required",
                "Upgrade to premium to upload more than 3 videos."
            );
            return;
        }
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission required",
                "We need access to your media library to upload a video."
            );
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: false,
            quality: 1,
            videoMaxDuration: 60,
        });
        if (result.canceled) return;
        const asset = result.assets[0];

        try {
            // Generate thumbnail from video
            const thumbnail = await VideoThumbnails.getThumbnailAsync(asset.uri, {
                time: 1000, // Get thumbnail at 1 second
                quality: 0.5,
            });

            setVideos((prev) => [...prev, { uri: asset.uri, thumbnail: thumbnail.uri }]);
        } catch (error) {
            console.error("Error generating thumbnail:", error);
            // Fallback: add video without thumbnail
            setVideos((prev) => [...prev, { uri: asset.uri }]);
        }
    };

    const handleDeleteSong = (songId: string) => {
        Alert.alert(
            "Delete Song",
            "Are you sure you want to delete this song?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        // TODO: Implement delete from Firestore
                        Alert.alert("Success", "Song deleted (not yet implemented in Firestore)");
                    },
                },
            ]
        );
    };

    const handleSongPress = (song: Song) => {
        // TODO: Implement song playback
        Alert.alert("Play Song", `Playing: ${song.title}`);
    };

    const handleRemoveConnection = (connectionId: string) => {
        Alert.alert(
            "Remove Connection",
            "Are you sure you want to remove this connection?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        // TODO: Implement remove connection from Firestore
                        Alert.alert("Success", "Connection removed (not yet implemented in Firestore)");
                    },
                },
            ]
        );
    };

    // Show loading indicator while fetching profile
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Show error message if there's an error (but still show profile with fallback data)
    if (error) {
        console.warn("Error loading profile:", error);
    }

    return (
        <SafeAreaView style={styles.container}>
            {showConnectionsScreen ? (
                <ConnectionsScreen
                    connections={displayProfile.connections}
                    onRemoveConnection={handleRemoveConnection}
                    onBack={() => setShowConnectionsScreen(false)}
                />
            ) : (
                <>
                    {/* Top action buttons */}
                    {/* Upload (+) on the left */}
                    <TouchableOpacity
                        style={[styles.uploadButton]}
                        onPress={handlePickVideo}
                        accessibilityLabel="Upload video"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <MaterialIcons
                            name="add"
                            size={28}
                            color={colors.surfaceMid}
                        />
                    </TouchableOpacity>

                    {/* Settings (tune) on the right */}
                    <TouchableOpacity
                        style={[styles.settingsButton]}
                        onPress={() =>
                            Alert.alert("Settings", "Choose an option", [
                                {
                                    text: "Edit Profile",
                                    onPress: () => console.log("Edit profile"),
                                },
                                {
                                    text: "Logout",
                                    onPress: async () => {
                                        try {
                                            await signOut();
                                        } catch (error) {
                                            Alert.alert(
                                                "Error",
                                                "Failed to logout"
                                            );
                                        }
                                    },
                                    style: "destructive",
                                },
                                {
                                    text: "Cancel",
                                    style: "cancel",
                                },
                            ])
                        }
                        accessibilityLabel="Edit profile settings"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <MaterialIcons
                            name="tune"
                            size={26}
                            color={colors.surfaceMid}
                        />
                    </TouchableOpacity>

                    <ScrollView>
                        {/* Profile Header */}
                        <View style={styles.profileHeader}>
                            <View style={styles.avatarContainer}>
                                {displayProfile.avatarUrl ? (
                                    <Image
                                        source={{ uri: displayProfile.avatarUrl }}
                                        style={styles.avatar}
                                    />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarText}>
                                            {displayProfile.displayName
                                                .charAt(0)
                                                .toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    style={styles.avatarEditButton}
                                    onPress={handleEditAvatar}
                                    accessibilityLabel="Edit profile picture"
                                >
                                    <MaterialIcons
                                        name="edit"
                                        size={16}
                                        color={colors.white}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.profileInfo}>
                                <Text style={styles.displayName}>
                                    {displayProfile.displayName}
                                </Text>
                                <Text style={styles.username}>
                                    @{displayProfile.username}
                                </Text>
                                {displayProfile.bio && (
                                    <Text style={styles.bio}>
                                        {displayProfile.bio}
                                    </Text>
                                )}

                                {/* Edit Profile & Connections Row */}
                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        style={styles.editProfileButton}
                                        onPress={() =>
                                            Alert.alert(
                                                "Edit Profile",
                                                "Edit profile screen coming soon"
                                            )
                                        }
                                    >
                                        <Text style={styles.editProfileText}>
                                            Edit Profile
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.connectionsButton}
                                        onPress={() =>
                                            setShowConnectionsScreen(true)
                                        }
                                    >
                                        <Text style={styles.connectionsNumber}>
                                            {displayProfile.connections.length}{" "}
                                            Connections
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        {/* Video Grid */}
                        <VideoGrid
                            videos={videos}
                            onAddVideo={handleAddVideo}
                            onVideoPress={(index) => setSelectedVideo(videos[index])}
                        />
                        {/* Song List: only show if no videos */}
                        {videos.length === 0 && (
                            <SongList
                                songs={displayProfile.songs}
                                onSongPress={handleSongPress}
                                onDeleteSong={handleDeleteSong}
                            />
                        )}
                    </ScrollView>

                    {/* Video Modal */}
                    {selectedVideo && (
                        <Modal visible={true} animationType="slide">
                            <View style={styles.videoContainer}>
                                <TouchableOpacity
                                    onPress={() => setSelectedVideo(null)}
                                    style={styles.closeButton}
                                >
                                    <MaterialIcons name="close" size={30} color="#fff" />
                                </TouchableOpacity>
                                <Video
                                    source={{ uri: selectedVideo.uri }}
                                    style={styles.videoPlayer}
                                    useNativeControls
                                    resizeMode={ResizeMode.CONTAIN}
                                    shouldPlay
                                />
                            </View>
                        </Modal>
                    )}
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    videoContainer: {
        flex: 1,
        backgroundColor: colors.white,
    },
    closeButton: {
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 10,
        width: 40,
        height: 40,
    },
    videoPlayer: {
        width: "100%",
        height: "100%",
    },
    uploadButton: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        backgroundColor: colors.white,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    settingsButton: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        fontSize: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    profileHeader: {
        paddingHorizontal: 16,
        marginTop: 60,
        paddingBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
        alignSelf: "center",
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.brandPurple,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
        alignSelf: "center",
    },
    avatarText: {
        color: colors.white,
        fontSize: 40,
        fontWeight: "600",
    },
    profileInfo: {
        alignItems: "center",
        marginBottom: 15,
    },
    displayName: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.surfaceMid,
        marginBottom: 4,
    },
    username: {
        fontSize: 16,
        color: colors.gray500,
        marginBottom: 8,
    },
    bio: {
        fontSize: 14,
        color: colors.gray500,
        textAlign: "center",
        marginTop: 8,
        paddingHorizontal: 20,
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        marginTop: 20,
        width: "100%",
        paddingHorizontal: 16,
    },
    editProfileButton: {
        flex: 1,
        backgroundColor: colors.brandPurple,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
    },
    editProfileText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: "600",
    },
    connectionsButton: {
        flex: 1,
        backgroundColor: colors.gray100,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
    },
    connectionsNumber: {
        fontSize: 14,
        fontWeight: "bold",
        color: colors.surfaceMid,
    },
    stats: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        marginTop: 20,
    },
    stat: {
        alignItems: "center",
    },
    statNumber: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.surfaceMid,
    },
    statLabel: {
        fontSize: 14,
        color: colors.gray500,
        marginTop: 4,
    },
    editButton: {
        backgroundColor: colors.brandPurple,
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 20,
        alignSelf: "center",
    },
    editButtonText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: "600",
    },
    avatarContainer: {
        alignSelf: "center",
        position: "relative",
        width: 100,
        height: 100,
        marginBottom: 15,
    },
    avatarEditButton: {
        position: "absolute",
        right: 0,
        bottom: 0,
        backgroundColor: colors.gray300,
        borderRadius: 14,
        width: 28,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.white,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#666",
    },
});

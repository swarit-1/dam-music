import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
} from "react-native";
import { SongList } from "../components/Profile/SongList";
import { ConnectionsManager } from "../components/Profile/ConnectionsManager";
import { Song, Connection, Profile } from "../types/profile";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import ConnectionsScreen from "./ConnectionsScreen";
import { VideoGrid } from "../components/Profile/VideoGrid";
import { signOut } from "../src/services/authService";

export default function ProfileScreen() {
    const [showConnectionsScreen, setShowConnectionsScreen] = useState(false);
    const [videos, setVideos] = useState<{ uri: string; thumbnail?: string }[]>(
        [
            {
                uri: "https://www.w3schools.com/html/mov_bbb.mp4",
                thumbnail: "https://placehold.co/300x533?text=Video+1",
            },
            {
                uri: "https://www.w3schools.com/html/movie.mp4",
                thumbnail: "https://placehold.co/300x533?text=Video+2",
            },
            {
                uri: "https://www.w3schools.com/html/mov_bbb.mp4",
                thumbnail: "https://placehold.co/300x533?text=Video+3",
            },
        ]
    );
    // Mock data - replace with actual data from your backend/state management
    const [profile, setProfile] = useState<Profile>({
        id: "1",
        username: "musiclover",
        displayName: "Music Lover",
        bio: "Passionate about creating and sharing music 🎵",
        avatarUrl: undefined,
        songs: [],
        connections: [
            {
                id: "1",
                username: "beatmaker",
                displayName: "Beat Maker",
                avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
                connectionType: "mutual",
                connectedAt: new Date(),
            },
            {
                id: "2",
                username: "vocalqueen",
                displayName: "Vocal Queen",
                avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
                connectionType: "mutual",
                connectedAt: new Date(),
            },
            {
                id: "3",
                username: "drumguy",
                displayName: "Drum Guy",
                avatarUrl: "https://randomuser.me/api/portraits/men/65.jpg",
                connectionType: "mutual",
                connectedAt: new Date(),
            },
        ],
        followersCount: 0,
        followingCount: 0,
    });

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
        setVideos((prev) => [...prev, { uri: asset.uri }]);
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
                    onPress: () => {
                        setProfile((prev) => ({
                            ...prev,
                            songs: prev.songs.filter(
                                (song) => song.id !== songId
                            ),
                        }));
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
                    onPress: () => {
                        setProfile((prev) => ({
                            ...prev,
                            connections: prev.connections.filter(
                                (conn) => conn.id !== connectionId
                            ),
                        }));
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {showConnectionsScreen ? (
                <ConnectionsScreen
                    connections={profile.connections}
                    onRemoveConnection={handleRemoveConnection}
                    onBack={() => setShowConnectionsScreen(false)}
                />
            ) : (
                <>
                    {/* Top action buttons */}
                    {/* Upload (+) on the left */}
                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={handlePickVideo}
                        accessibilityLabel="Upload video"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <MaterialIcons name="add" size={28} color="#111" />
                    </TouchableOpacity>

                    {/* Settings (tune) on the right */}
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={() =>
                            Alert.alert(
                                "Settings",
                                "Choose an option",
                                [
                                    {
                                        text: "Edit Profile",
                                        onPress: () => console.log("Edit profile")
                                    },
                                    {
                                        text: "Logout",
                                        onPress: async () => {
                                            try {
                                                await signOut();
                                            } catch (error) {
                                                Alert.alert("Error", "Failed to logout");
                                            }
                                        },
                                        style: "destructive"
                                    },
                                    {
                                        text: "Cancel",
                                        style: "cancel"
                                    }
                                ]
                            )
                        }
                        accessibilityLabel="Edit profile settings"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <MaterialIcons name="tune" size={26} color="#111" />
                    </TouchableOpacity>

                    <ScrollView>
                        {/* Profile Header */}
                        <View style={styles.profileHeader}>
                            <View style={styles.avatarContainer}>
                                {profile.avatarUrl ? (
                                    <Image
                                        source={{ uri: profile.avatarUrl }}
                                        style={styles.avatar}
                                    />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <Text style={styles.avatarText}>
                                            {profile.displayName
                                                .charAt(0)
                                                .toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    style={styles.avatarEditButton}
                                    onPress={() =>
                                        Alert.alert(
                                            "Edit Profile Picture",
                                            "Profile picture editing coming soon!"
                                        )
                                    }
                                    accessibilityLabel="Edit profile picture"
                                >
                                    <MaterialIcons
                                        name="edit"
                                        size={16}
                                        color="#fff"
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.profileInfo}>
                                <Text style={styles.displayName}>
                                    {profile.displayName}
                                </Text>
                                <Text style={styles.username}>
                                    @{profile.username}
                                </Text>
                                {profile.bio && (
                                    <Text style={styles.bio}>
                                        {profile.bio}
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
                                            {profile.connections.length}{" "}
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
                        />
                        {/* Song List: only show if no videos */}
                        {videos.length === 0 && (
                            <SongList
                                songs={profile.songs}
                                onSongPress={handleSongPress}
                                onDeleteSong={handleDeleteSong}
                            />
                        )}
                    </ScrollView>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    uploadButton: {
        position: "absolute",
        top: 20,
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    settingsButton: {
        position: "absolute",
        top: 20,
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
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
        alignSelf: "center",
    },
    avatarText: {
        color: "#fff",
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
        color: "#333",
        marginBottom: 4,
    },
    username: {
        fontSize: 16,
        color: "#666",
        marginBottom: 8,
    },
    bio: {
        fontSize: 14,
        color: "#666",
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
        backgroundColor: "#007AFF",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
    },
    editProfileText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    connectionsButton: {
        flex: 1,
        backgroundColor: "#f0f0f0",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
    },
    connectionsNumber: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#444",
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
        color: "#333",
    },
    statLabel: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    editButton: {
        backgroundColor: "#007AFF",
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 20,
        alignSelf: "center",
    },
    editButtonText: {
        color: "#fff",
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
        backgroundColor: "#ccc",
        borderRadius: 14,
        width: 28,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
    },
});

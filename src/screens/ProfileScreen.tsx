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
import { Video, ResizeMode } from "expo-av";
import * as VideoThumbnails from "expo-video-thumbnails";

export default function ProfileScreen() {
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
    // Mock data - replace with actual data from your backend/state management
    const [profile, setProfile] = useState<Profile>({
        id: "1",
        username: "musiclover",
        displayName: "Music Loverrr",
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

    // Avatar actions: pick from library, take photo, delete
    const handlePickAvatarFromLibrary = async () => {
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission required",
                "We need access to your photos to select a profile picture."
            );
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
            if (result.canceled) return;
            const asset = result.assets[0];
            setProfile((prev) => ({ ...prev, avatarUrl: asset.uri }));
        } catch (e) {
            console.warn("Avatar pick failed", e);
            Alert.alert("Error", "Could not pick an image");
        }
    };

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission required",
                "We need access to your camera to take a profile picture."
            );
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
            if (result.canceled) return;
            const asset = result.assets[0];
            setProfile((prev) => ({ ...prev, avatarUrl: asset.uri }));
        } catch (e) {
            console.warn("Camera capture failed", e);
            Alert.alert("Error", "Could not take a photo");
        }
    };

    const handleDeleteAvatar = () => {
        if (!profile.avatarUrl) return;
        Alert.alert(
            "Delete photo",
            "Are you sure you want to delete your profile photo?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () =>
                        setProfile((prev) => ({
                            ...prev,
                            avatarUrl: undefined,
                        })),
                },
            ]
        );
    };

    const handleEditAvatar = () => {
        const options: Array<{
            text: string;
            onPress?: () => any;
            style?: any;
        }> = [
            {
                text: "Upload new profile picture",
                onPress: handlePickAvatarFromLibrary,
            },
            { text: "Take new profile picture", onPress: handleTakePhoto },
        ];
        if (profile.avatarUrl) {
            options.push({
                text: "Delete profile picture",
                style: "destructive",
                onPress: handleDeleteAvatar,
            });
        }
        options.push({ text: "Cancel", style: "cancel" });

        Alert.alert("Edit profile picture", "Choose an option", options as any);
    };

    // place the top action buttons below the OS status bar / safe area

    return (
        <SafeAreaView style={styles.container}>
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
                            onVideoPress={(index) => setSelectedVideo(videos[index])}
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
    videoContainer: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
    },
    videoPlayer: {
        width: "100%",
        height: "100%",
    },
    closeButton: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 10,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 20,
        padding: 10,
    },
});

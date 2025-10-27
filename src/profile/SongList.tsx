import React from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
} from "react-native";
import { Song } from "../types/profile";

interface SongListProps {
    songs: Song[];
    onSongPress?: (song: Song) => void;
    onDeleteSong?: (songId: string) => void;
}

export const SongList: React.FC<SongListProps> = ({
    songs,
    onSongPress,
    onDeleteSong,
}) => {
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const renderSongItem = ({ item }: { item: Song }) => (
        <TouchableOpacity
            style={styles.songItem}
            onPress={() => onSongPress?.(item)}
        >
            {item.coverImage ? (
                <Image
                    source={{ uri: item.coverImage }}
                    style={styles.coverImage}
                />
            ) : (
                <View style={styles.placeholderImage}>
                    <Text style={styles.placeholderText}>♪</Text>
                </View>
            )}

            <View style={styles.songInfo}>
                <Text style={styles.songTitle} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={styles.songArtist} numberOfLines={1}>
                    {item.artist}
                </Text>
            </View>

            <View style={styles.songMeta}>
                <Text style={styles.duration}>
                    {formatDuration(item.duration)}
                </Text>
                {onDeleteSong && (
                    <TouchableOpacity
                        onPress={() => onDeleteSong(item.id)}
                        style={styles.deleteButton}
                    >
                        <Text style={styles.deleteButtonText}>×</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    if (songs.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No songs uploaded yet</Text>
                <Text style={styles.emptySubtext}>
                    Upload your first song sample to get started!
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>My Songs ({songs.length})</Text>
            <FlatList
                data={songs}
                renderItem={renderSongItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
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
        paddingHorizontal: 0,
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333",
    },
    songItem: {
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
    coverImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
        marginRight: 12,
    },
    placeholderImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
        backgroundColor: "#e0e0e0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    placeholderText: {
        fontSize: 24,
        color: "#999",
    },
    songInfo: {
        flex: 1,
        marginRight: 10,
    },
    songTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    songArtist: {
        fontSize: 14,
        color: "#666",
    },
    songMeta: {
        alignItems: "flex-end",
    },
    duration: {
        fontSize: 12,
        color: "#999",
        marginBottom: 8,
    },
    deleteButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#ff3b30",
        justifyContent: "center",
        alignItems: "center",
    },
    deleteButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        lineHeight: 20,
    },
    emptyContainer: {
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
    },
});

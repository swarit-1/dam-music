import React from "react";
import {
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    Alert,
    Text,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface VideoGridProps {
    videos: { uri: string; thumbnail?: string }[];
    onAddVideo: () => void;
    onVideoPress?: (index: number) => void;
    maxVideos?: number;
}

const { width } = Dimensions.get("window");
const ITEM_MARGIN = 8;
const NUM_COLUMNS = 2;
// Each item gets margin on both sides, so total margin per row is NUM_COLUMNS * ITEM_MARGIN
const ITEM_WIDTH = (width - ITEM_MARGIN * NUM_COLUMNS) / NUM_COLUMNS;
const ITEM_HEIGHT = (ITEM_WIDTH / 9) * 16;

const PLACEHOLDER_THUMB = "https://placehold.co/300x533?text=Video";

export const VideoGrid: React.FC<VideoGridProps> = ({
    videos,
    onAddVideo,
    onVideoPress,
    maxVideos = 3,
}) => {
    const gridItems = [...videos, { uri: "__upgrade__" }];

    return (
        <View>
            <View style={styles.grid}>
                {gridItems.map((video, idx) => {
                    if (video.uri === "__upgrade__") {
                        return (
                            <View key="upgrade" style={styles.item}>
                                <View style={styles.premiumBlurbContainer}>
                                    <MaterialCommunityIcons
                                        name="crown-outline"
                                        size={28}
                                        color="#b8860b"
                                        style={styles.crownIcon}
                                    />
                                    <Text style={styles.premiumBlurbText}>
                                        Upgrade to premium to upload more videos.
                                    </Text>
                                </View>
                            </View>
                        );
                    }
                    return (
                        <TouchableOpacity
                            key={video.uri + idx}
                            style={styles.item}
                            onPress={() => onVideoPress && onVideoPress(idx)}
                            accessibilityLabel={`View video ${idx + 1}`}
                        >
                            <Image
                                source={{
                                    uri: video.thumbnail || PLACEHOLDER_THUMB,
                                }}
                                style={styles.videoThumb}
                                resizeMode="cover"
                            />
                            <View style={styles.playOverlay}>
                                <MaterialIcons
                                    name="play-circle-filled"
                                    size={40}
                                    color="rgba(255,255,255,0.8)"
                                />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        width: "100%",
    },
    item: {
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
        borderRadius: 12,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        margin: ITEM_MARGIN / 2,
        borderWidth: 0,
    },
    videoThumb: {
        width: "100%",
        height: "100%",
        borderRadius: 12,
    },
    addButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#eaeaea",
    },
    premiumBlurbContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fffbe6",
        borderWidth: 1,
        borderColor: "#ffe58f",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        margin: 0,
    },
    premiumBlurbText: {
        marginVertical: 4,
        color: "#b8860b",
        fontSize: 15,
        fontWeight: "600",
        textAlign: "center",
    },
    crownIcon: {
        marginBottom: 2,
        textAlign: "center",
    },
    playOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.2)",
    },
});

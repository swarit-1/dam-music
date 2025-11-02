import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    PanResponder,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { ScoredPost } from "../types";
import { getFeedForUser } from "../services/matchingService";
import { mockUser, mockPosts } from "../data/mockData";
import { audioService } from "../services/audioService";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 60; // matches AppNavigator tabBar height
const ITEM_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT;

export default function FeedScreen() {
    const [posts, setPosts] = useState<ScoredPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    // Control whether the list accepts new scroll gestures. We briefly lock scrolling
    // while momentum from a flick is settling to create a small "hitch" and force
    // the user to pause on each item if they want to move on.
    const [canScroll, setCanScroll] = useState(true);
    const flatListRef = useRef<FlatList>(null);
    // Track the index at the start of the user's drag so we can clamp
    // any momentum-based jump to at most one item away.
    const startIndexRef = useRef<number>(0);
    // keep a ref copy of currentIndex for gesture handlers
    const currentIndexRef = useRef<number>(0);
    // pan responder used to implement slide-style (one card at a time)
    const panResponderRef = useRef<any>(null);
    const isFocused = useIsFocused();

    useEffect(() => {
        initializeScreen();
        return () => {
            audioService.cleanup();
        };
    }, []);

    // keep currentIndexRef in sync
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    // create PanResponder once
    useEffect(() => {
        panResponderRef.current = PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_evt, gestureState) => {
                // start handling when user has moved enough vertically
                return Math.abs(gestureState.dy) > 8;
            },
            onPanResponderGrant: () => {
                // record start index
                startIndexRef.current = currentIndexRef.current;
                // while the user is dragging, disallow FlatList scroll (we'll control it)
                setCanScroll(false);
            },
            onPanResponderMove: () => {
                // noop — we don't show partial next card
            },
            onPanResponderRelease: (_evt, gestureState) => {
                const dy = gestureState.dy;
                const vy = gestureState.vy;
                const start = startIndexRef.current ?? currentIndexRef.current;
                let next = start;

                // if user swiped up (negative dy) move to next, down move to prev
                const threshold = 30; // px threshold to count as a slide
                if (dy < -threshold || vy < -0.3) {
                    next = Math.min(
                        start + 1,
                        Math.max(0, (posts.length || 1) - 1)
                    );
                } else if (dy > threshold || vy > 0.3) {
                    next = Math.max(start - 1, 0);
                }

                // programmatically scroll to the chosen index
                flatListRef.current?.scrollToOffset({
                    offset: next * ITEM_HEIGHT,
                    animated: true,
                });
                setCurrentIndex(next);
                // re-enable gestures after tiny delay
                setTimeout(() => setCanScroll(true), 50);
            },
        });
    }, [posts.length]);

    useEffect(() => {
        // Play audio for current post
        if (posts.length > 0 && currentIndex < posts.length) {
            const currentPost = posts[currentIndex];
            playAudio(currentPost.audio_clip_url);
        }
    }, [currentIndex, posts]);

    // Pause playback when the screen is not focused (e.g., user switches tabs)
    useEffect(() => {
        if (isFocused) {
            // resume or start playback for the current post when returning to the screen
            if (posts.length > 0 && currentIndex < posts.length) {
                playAudio(posts[currentIndex].audio_clip_url);
            }
        } else {
            // pause audio when leaving the screen
            (async () => {
                try {
                    await audioService.pauseSound();
                    setIsPlaying(false);
                } catch (error) {
                    console.error("Error pausing audio on blur:", error);
                }
            })();
        }
    }, [isFocused]);

    const initializeScreen = async () => {
        try {
            // Initialize audio service
            await audioService.initialize();

            // Fetch and rank posts
            const rankedPosts = getFeedForUser(mockUser, mockPosts);
            setPosts(rankedPosts);
            setLoading(false);
        } catch (error) {
            console.error("Error initializing feed:", error);
            setLoading(false);
        }
    };

    const playAudio = async (url: string) => {
        try {
            await audioService.playSound(url, true);
            setIsPlaying(true);
        } catch (error) {
            console.error("Error playing audio:", error);
        }
    };

    const togglePlayPause = async () => {
        try {
            if (isPlaying) {
                await audioService.pauseSound();
                setIsPlaying(false);
            } else {
                await audioService.resumeSound();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error("Error toggling play/pause:", error);
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            const index = viewableItems[0].index;
            setCurrentIndex(index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const renderPost = ({
        item,
        index,
    }: {
        item: ScoredPost;
        index: number;
    }) => {
        const matchPercentage = Math.round(item.score * 100);

        return (
            <View style={styles.postContainer}>
                {/* Background gradient effect */}
                <View style={styles.background} />

                {/* Content overlay */}
                <View style={styles.contentContainer}>
                    {/* Match score badge */}
                    <View style={styles.matchBadge}>
                        <Text style={styles.matchText}>
                            {matchPercentage}% Match
                        </Text>
                    </View>

                    {/* Post info */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.genreText}>
                            {item.genre.toUpperCase()}
                        </Text>
                        <Text style={styles.creatorName}>
                            {item.creator_name}
                        </Text>
                        <Text style={styles.roleText}>
                            {item.creator_role.join(", ")}
                        </Text>

                        <View style={styles.rolesNeededContainer}>
                            <Text style={styles.rolesLabel}>Looking for:</Text>
                            <Text style={styles.rolesNeeded}>
                                {item.roles_needed.join(", ")}
                            </Text>
                        </View>

                        <View style={styles.tagsContainer}>
                            {item.tags.map((tag, i) => (
                                <View key={i} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Play/Pause button */}
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={togglePlayPause}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.playButtonText}>
                            {currentIndex === index && isPlaying ? "⏸" : "▶"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const onMomentumScrollEnd = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y ?? 0;
        const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
        const start =
            typeof startIndexRef.current === "number"
                ? startIndexRef.current
                : currentIndex;

        // Allow at most one-item movement per gesture
        const clamped = Math.max(Math.min(rawIndex, start + 1), start - 1);

        if (clamped !== rawIndex) {
            // snap to the clamped index
            flatListRef.current?.scrollToOffset({
                offset: clamped * ITEM_HEIGHT,
                animated: true,
            });
        }

        // ensure our index state matches the final visible item
        setCurrentIndex(clamped);
        // re-enable scrolling in case it was disabled during momentum
        setCanScroll(true);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1DB954" />
                <Text style={styles.loadingText}>Loading your matches...</Text>
            </View>
        );
    }

    return (
        <View
            style={styles.container}
            {...(panResponderRef.current?.panHandlers ?? {})}
        >
            <FlatList
                ref={flatListRef}
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                // we handle snapping programmatically via the pan responder so
                // prevent the FlatList from accepting native scroll gestures
                scrollEnabled={false}
                // Lower decelerationRate is ignored since native scroll is disabled,
                // but we keep pagingEnabled so programmatic scrolls look natural.
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                getItemLayout={(data, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                })}
                contentContainerStyle={{ paddingBottom: 0 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
    },
    loadingText: {
        color: "#fff",
        fontSize: 16,
        marginTop: 16,
    },
    postContainer: {
        height: ITEM_HEIGHT,
        width: "100%",
        position: "relative",
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#1a1a1a",
    },
    contentContainer: {
        flex: 1,
        justifyContent: "flex-end",
        padding: 20,
        paddingBottom: 0,
    },
    matchBadge: {
        position: "absolute",
        top: 60,
        right: 20,
        backgroundColor: "#1DB954",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    matchText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    infoContainer: {
        marginBottom: 20,
    },
    genreText: {
        color: "#1DB954",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
        letterSpacing: 1,
    },
    creatorName: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 4,
    },
    roleText: {
        color: "#aaa",
        fontSize: 16,
        marginBottom: 16,
    },
    rolesNeededContainer: {
        marginBottom: 12,
    },
    rolesLabel: {
        color: "#888",
        fontSize: 14,
        marginBottom: 4,
    },
    rolesNeeded: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 8,
    },
    tag: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        color: "#fff",
        fontSize: 12,
    },
    playButton: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -35 }, { translateY: -35 }],
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    playButtonText: {
        fontSize: 30,
        color: "#fff",
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 20,
    },
    actionButton: {
        alignItems: "center",
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: 4,
    },
    actionLabel: {
        color: "#fff",
        fontSize: 12,
    },
});

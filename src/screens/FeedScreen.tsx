import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    PanResponder,
    Dimensions,
    Pressable,
    TouchableOpacity,
    ActivityIndicator,
    LayoutAnimation,
    UIManager,
    Platform,
    Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import { ScoredPost, User } from "../types";
import { getFeedForUser } from "../services/matchingService";
import { mockPosts } from "../data/mockData";
import { audioService } from "../services/audioService";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile } from "../services/authService";
import { colors } from "../theme/colors";
import { getAllUsers, getPostsForUsers, addConnection, getUserConnections } from "../services/userDiscoveryService";
import { SoundwaveVisualizer } from "../components/SoundwaveVisualizer";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 60; // fallback tab bar height
// We'll compute item height from the actual container onLayout so it stays
// correct across navigation/safe-area changes.
const DEFAULT_ITEM_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT;

// Gradient color schemes for feed items
const GRADIENT_SCHEMES: readonly [string, string, string][] = [
    ['#1a1a2e', '#16213e', '#0f3460'], // Deep blue
    ['#2d1b2e', '#1f1635', '#2c1a4d'], // Purple-blue
    ['#1c1c2e', '#252036', '#2e1f3d'], // Dark purple
    ['#1a2332', '#1c2a3a', '#1e3247'], // Navy
    ['#2e1f2f', '#261c2c', '#3d2845'], // Plum
    ['#1b1e2f', '#1e2538', '#212d45'], // Midnight blue
    ['#2a1e34', '#241d2e', '#352640'], // Deep violet
    ['#1e1e2e', '#242333', '#2b2841'], // Charcoal purple
];

export default function FeedScreen() {
    const { user } = useAuth();
    const navigation = useNavigation<NavigationProp<any>>();
    const [posts, setPosts] = useState<ScoredPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    // measured item height (one page) derived from container layout
    const [itemHeight, setItemHeight] = useState<number>(DEFAULT_ITEM_HEIGHT);
    const pendingItemHeightRef = useRef<number | null>(null);
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
    // hold-to-pause refs
    const holdTimeoutRef = useRef<number | null>(null);
    const holdActivatedRef = useRef<boolean>(false);
    const [holdActive, setHoldActive] = useState(false);
    const isFocused = useIsFocused();
    // expanded bio index
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    // rotation Animated.Values per item index
    const rotationsRef = useRef<Record<number, Animated.Value>>({});
    // Track which users are already connected
    const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());

    const LOREM =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

    // enable LayoutAnimation on Android
    useEffect(() => {
        if (
            Platform.OS === "android" &&
            UIManager.setLayoutAnimationEnabledExperimental
        ) {
            try {
                UIManager.setLayoutAnimationEnabledExperimental(true);
            } catch (e) {}
        }
    }, []);

    // toggle expand with chevron animation
    const toggleExpand = (index: number) => {
        const prev = expandedIndex;
        const next = prev === index ? null : index;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIndex(next);

        // ensure Animated.Value exists
        if (!rotationsRef.current[index]) {
            rotationsRef.current[index] = new Animated.Value(
                next === index ? 1 : 0
            );
        }

        if (next === index) {
            Animated.timing(rotationsRef.current[index], {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }).start();
        }

        if (prev !== null && prev !== index) {
            if (!rotationsRef.current[prev])
                rotationsRef.current[prev] = new Animated.Value(0);
            Animated.timing(rotationsRef.current[prev], {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }).start();
        }

        if (next === null && prev === index) {
            if (!rotationsRef.current[index])
                rotationsRef.current[index] = new Animated.Value(1);
            Animated.timing(rotationsRef.current[index], {
                toValue: 0,
                duration: 180,
                useNativeDriver: true,
            }).start();
        }
    };

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

    // If the measured itemHeight changes (e.g., due to safe-area or tab bar
    // differences), re-align the FlatList to the current index so offsets stay
    // consistent. Use a non-animated jump to avoid visible snapping.
    useEffect(() => {
        // Only realign when the list is idle. If a scroll is in progress
        // (canScroll === false) we defer alignment to avoid interfering with
        // an ongoing animated scroll which can cause cumulative drift.
        if (!canScroll) return;

        if (flatListRef.current && itemHeight) {
            setTimeout(() => {
                try {
                    // Prefer scrollToIndex for precise alignment; fall back to
                    // pixel offset if it fails.
                    try {
                        flatListRef.current?.scrollToIndex({
                            index: currentIndex,
                            animated: false,
                            viewPosition: 0,
                        });
                    } catch (err) {
                        flatListRef.current?.scrollToOffset({
                            offset: getOffsetForIndex(currentIndex),
                            animated: false,
                        });
                    }
                } catch (e) {
                    console.warn(
                        "FeedScreen: failed to realign after itemHeight change",
                        e
                    );
                }
            }, 20);
        }
    }, [itemHeight]);

    // If itemHeight was measured while a scroll was active, apply it once the
    // list becomes idle.
    useEffect(() => {
        if (canScroll && pendingItemHeightRef.current) {
            const h = pendingItemHeightRef.current;
            pendingItemHeightRef.current = null;
            setItemHeight(h);
        }
    }, [canScroll]);

    // Helper to compute the exact offset (in px) for a page index. Keep this
    // centralized so every scroll uses the same calculation.
    const getOffsetForIndex = (i: number) => {
        const idx = Math.max(0, Math.min(i, (posts.length || 1) - 1));
        return Math.round(idx * itemHeight);
    };

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
                // cancel any pending hold-to-pause while we're starting a drag
                if (holdTimeoutRef.current) {
                    clearTimeout(holdTimeoutRef.current);
                    holdTimeoutRef.current = null;
                }
                // if a hold had been activated (paused), resume so drag feels natural
                if (holdActivatedRef.current) {
                    audioService.resumeSound().catch(() => {});
                    holdActivatedRef.current = false;
                    setHoldActive(false);
                }
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

                // programmatically scroll to the chosen index. We do NOT set
                // currentIndex here — wait for the momentum/end event to set
                // the final index to avoid competing state updates.
                try {
                    flatListRef.current?.scrollToIndex({
                        index: next,
                        animated: true,
                        viewPosition: 0,
                    });
                } catch (e) {
                    flatListRef.current?.scrollToOffset({
                        offset: getOffsetForIndex(next),
                        animated: true,
                    });
                }
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
            setLoading(true);
            // Initialize audio service
            await audioService.initialize();

            // Fetch user profile from Firestore if available
            let userProfile: User | null = null;
            if (user) {
                try {
                    const firestoreProfile = await getUserProfile(user.uid);
                    if (firestoreProfile) {
                        // Map Firestore profile to User type for matching service
                        userProfile = {
                            id: user.uid,
                            name: firestoreProfile.displayName || user.displayName || "User",
                            role: firestoreProfile.role || [],
                            skills: [], // TODO: Add skills field to Firestore profile if needed
                            genres: firestoreProfile.genre || [],
                            location: "", // TODO: Add location to Firestore profile if needed
                            avatar: firestoreProfile.profileImage || user.photoURL || undefined,
                        };
                    } else {
                        // Fallback to Firebase Auth data
                        userProfile = {
                            id: user.uid,
                            name: user.displayName || "User",
                            role: [],
                            skills: [],
                            genres: [],
                            location: "",
                            avatar: user.photoURL || undefined,
                        };
                    }
                } catch (err) {
                    console.error("Error fetching user profile:", err);
                    // Fallback to Firebase Auth data
                    userProfile = {
                        id: user.uid,
                        name: user.displayName || "User",
                        role: [],
                        skills: [],
                        genres: [],
                        location: "",
                        avatar: user.photoURL || undefined,
                    };
                }
            }

            setFirebaseUser(userProfile);

            // DEMO MODE: Use mock data for fast, reliable demo
            if (userProfile) {
                console.log('[DEMO MODE] Using mock data for feed');
                const rankedPosts = getFeedForUser(userProfile, mockPosts);
                setPosts(rankedPosts);

                // DEMO MODE: Connect to MOST users, but leave first 2 unconnected for demo
                const allCreatorIds = mockPosts.map(post => post.creator_id);
                const connectedIds = allCreatorIds.slice(2); // Skip first 2 users
                setConnectedUsers(new Set(connectedIds));
                console.log('[DEMO MODE] Auto-connected to', connectedIds.length, 'users, leaving', allCreatorIds.length - connectedIds.length, 'unconnected for demo');

                // Try to load Firebase data in background (optional)
                if (user) {
                    try {
                        console.log('[Background] Fetching Firebase connections...');
                        const existingConnections = await getUserConnections(user.uid);
                        setConnectedUsers(new Set(existingConnections));

                        console.log('[Background] Fetching Firebase users...');
                        const allUsers = await getAllUsers(user.uid);

                        if (allUsers.length > 0) {
                            const userPosts = await getPostsForUsers(allUsers);
                            const rankedFirebasePosts = getFeedForUser(userProfile, userPosts);
                            // Silently update to real data if available
                            setPosts(rankedFirebasePosts);
                            console.log(`[Background] Updated to ${rankedFirebasePosts.length} real Firebase users`);
                        }
                    } catch (err) {
                        console.log('[Background] Firebase fetch failed (continuing with mock data):', err);
                    }
                }
            } else {
                // If no user, show mock posts
                setPosts(mockPosts as ScoredPost[]);
            }
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

    const handleConnect = async (creatorId: string, creatorName: string) => {
        // DEMO MODE: Hardcoded local connection (no Firebase)
        if (connectedUsers.has(creatorId)) {
            alert("You're already connected with this artist!");
            return;
        }

        // Add to local state immediately - green checkmark appears!
        setConnectedUsers(prev => new Set([...prev, creatorId]));

        // Show success feedback
        alert(`✓ Connected with ${creatorName}! Check Profile > Connections to message them.`);

        // Optional: Try Firebase in background, but don't wait or show errors
        if (user) {
            try {
                await addConnection(user.uid, creatorId);
            } catch (error) {
                console.log("Firebase connection save failed (demo mode continues):", error);
            }
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
        // ensure rotation Animated.Value exists for this index (do NOT render it)
        if (!rotationsRef.current[index]) {
            rotationsRef.current[index] = new Animated.Value(
                expandedIndex === index ? 1 : 0
            );
        }

        const gradientColors = GRADIENT_SCHEMES[index % GRADIENT_SCHEMES.length];

        return (
            <View style={[styles.postContainer, { height: itemHeight }]}>
                {/* Gradient background */}
                <LinearGradient
                    colors={gradientColors}
                    style={styles.background}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />

                {/* Content overlay */}
                <View style={styles.contentContainer}>
                    {/* Post header: avatar, name + roles, connect button */}
                    <View style={styles.postHeader}>
                        <TouchableOpacity
                            style={styles.avatarTouchable}
                            onPress={() =>
                                navigation.navigate("CreatorProfile", {
                                    creatorId: item.creator_id,
                                    creatorName: item.creator_name,
                                })
                            }
                        >
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {(item.creator_name || "")
                                        .split(" ")
                                        .map((n) => n[0])
                                        .slice(0, 2)
                                        .join("")
                                        .toUpperCase()}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.nameColumn}
                            onPress={() =>
                                navigation.navigate("CreatorProfile", {
                                    creatorId: item.creator_id,
                                    creatorName: item.creator_name,
                                })
                            }
                        >
                            <Text style={styles.creatorName}>
                                {item.creator_name}
                            </Text>
                            <View style={styles.roleChipsContainer}>
                                {item.creator_role.map((r, i) => (
                                    <View key={i} style={styles.roleChip}>
                                        <Text style={styles.roleChipText}>
                                            {r}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.connectButton}
                            onPress={() => handleConnect(item.creator_id, item.creator_name)}
                        >
                            <MaterialIcons
                                name={connectedUsers.has(item.creator_id) ? "check" : "person-add"}
                                size={22}
                                color={connectedUsers.has(item.creator_id) ? colors.green : colors.brandPurple}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Bio (click to expand) with chevron */}
                    {/* ensure rotation value exists for this index */}
                    {!rotationsRef.current[index] &&
                        (rotationsRef.current[index] = new Animated.Value(
                            expandedIndex === index ? 1 : 0
                        ))}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => toggleExpand(index)}
                        style={styles.bioTouchable}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <Text
                                style={styles.bioText}
                                numberOfLines={
                                    expandedIndex === index ? undefined : 2
                                }
                            >
                                {item.tags && item.tags.length > 0
                                    ? `Bio: ${item.tags.join(", ")}. ${LOREM}`
                                    : `No bio provided. ${LOREM}`}
                            </Text>

                            <Animated.View
                                style={[
                                    styles.chevronContainer,
                                    {
                                        transform: [
                                            {
                                                rotate: rotationsRef.current[
                                                    index
                                                ].interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [
                                                        "0deg",
                                                        "180deg",
                                                    ],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                                pointerEvents="none"
                            >
                                <MaterialIcons
                                    name="keyboard-arrow-down"
                                    size={28}
                                    color={colors.white}
                                />
                            </Animated.View>
                        </View>
                    </TouchableOpacity>

                    {/* Looking for (distinct from top role chips) - label inline with chips */}
                    <View style={styles.rolesNeededContainer}>
                        <View style={styles.rolesNeededInlineRow}>
                            <Text style={styles.rolesLabelInline}>
                                Looking for:
                            </Text>

                            <View style={styles.rolesNeededRow}>
                                {item.roles_needed.map((r, i) => (
                                    <View key={i} style={styles.tag}>
                                        <Text style={styles.tagText}>{r}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>


                    {/* Animated Soundwave Visualizer - centered on screen */}
                    {currentIndex === index && (
                        <View style={styles.soundwaveContainer} pointerEvents="none">
                            <SoundwaveVisualizer
                                isPlaying={isPlaying}
                                color={colors.brandPurple}
                                barCount={30}
                            />
                        </View>
                    )}

                    {/* Hold anywhere on the content to pause; release to resume */}
                    <Pressable
                        style={styles.pressableOverlay}
                        onPressIn={() => {
                            // start a short timer to detect hold (avoid accidental taps)
                            holdActivatedRef.current = false;
                            setHoldActive(false);
                            holdTimeoutRef.current = setTimeout(async () => {
                                try {
                                    if (isPlaying) {
                                        await audioService.pauseSound();
                                        setIsPlaying(false);
                                        holdActivatedRef.current = true;
                                        setHoldActive(true);
                                    }
                                } catch (e) {
                                    console.warn("hold pause error", e);
                                }
                            }, 180) as unknown as number;
                        }}
                        onPressOut={async () => {
                            // clear pending timer
                            if (holdTimeoutRef.current) {
                                clearTimeout(holdTimeoutRef.current);
                                holdTimeoutRef.current = null;
                            }
                            // if we actually paused via hold, resume playback
                            if (holdActivatedRef.current) {
                                try {
                                    await audioService.resumeSound();
                                    setIsPlaying(true);
                                } catch (e) {
                                    console.warn("hold resume error", e);
                                }
                                holdActivatedRef.current = false;
                                setHoldActive(false);
                            }
                        }}
                    >
                        {/* empty wrapper - children are the content below */}
                        <View style={{ flex: 1 }} />
                    </Pressable>

                    {/* visual feedback: pause icon while holding */}
                    {holdActive && currentIndex === index && (
                        <View
                            style={styles.holdIconContainer}
                            pointerEvents="none"
                        >
                            <MaterialIcons
                                name="pause"
                                size={64}
                                color={colors.white}
                            />
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const onMomentumScrollEnd = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y ?? 0;
        const rawIndex = Math.round(offsetY / itemHeight);
        const start =
            typeof startIndexRef.current === "number"
                ? startIndexRef.current
                : currentIndex;

        // Allow at most one-item movement per gesture
        const clamped = Math.max(Math.min(rawIndex, start + 1), start - 1);

        if (clamped !== rawIndex) {
            // snap to the clamped index using scrollToIndex for precision;
            // fall back to pixel offset if necessary.
            try {
                flatListRef.current?.scrollToIndex({
                    index: clamped,
                    animated: true,
                    viewPosition: 0,
                });
            } catch (e) {
                flatListRef.current?.scrollToOffset({
                    offset: getOffsetForIndex(clamped),
                    animated: true,
                });
            }
        }

        // ensure our index state matches the final visible item
        setCurrentIndex(clamped);
        // re-enable scrolling in case it was disabled during momentum
        setCanScroll(true);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.brandPurple} />
                <Text style={styles.loadingText}>Loading your matches...</Text>
            </View>
        );
    }

    return (
        <View
            style={styles.container}
            onLayout={(e) => {
                const h = e.nativeEvent.layout.height;
                // only update if the change is meaningful (>1px) to avoid
                // triggering repeated realigns during small layout fluctuations
                if (h && Math.abs(h - itemHeight) > 1) {
                    if (!canScroll) {
                        // Defer applying the new height until scrolling/momentum ends
                        pendingItemHeightRef.current = h;
                    } else {
                        setItemHeight(h);
                    }
                }
            }}
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
                    length: itemHeight,
                    offset: itemHeight * index,
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
        backgroundColor: colors.black,
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
    postContainer: {
        width: "100%",
        position: "relative",
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.surfaceDark,
    },
    contentContainer: {
        flex: 1,
        justifyContent: "flex-end",
        padding: 20,
        paddingBottom: 20,
    },
    matchBadge: {
        position: "absolute",
        top: 60,
        right: 20,
        backgroundColor: colors.brandPurple,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    matchText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: "bold",
    },
    infoContainer: {
        marginBottom: 20,
    },
    genreText: {
        color: colors.brandPurple,
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
        letterSpacing: 1,
    },
    creatorName: {
        color: colors.white,
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 4,
    },
    roleText: {
        color: colors.gray500,
        fontSize: 16,
        marginBottom: 16,
    },
    rolesNeededContainer: {
        marginTop: 12,
        marginBottom: 16,
    },
    rolesLabel: {
        color: colors.gray400,
        fontSize: 14,
        marginBottom: 4,
    },
    rolesNeeded: {
        color: colors.white,
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
    },
    tagText: {
        color: colors.white,
        fontSize: 12,
    },
    postHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    avatarTouchable: {
        marginRight: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.surfaceMid,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: colors.white,
        fontWeight: "bold",
        fontSize: 16,
    },
    nameColumn: {
        flex: 1,
        justifyContent: "center",
    },
    roleChipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 4,
    },
    roleChip: {
        backgroundColor: "rgba(255,255,255,0.06)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    roleChipText: {
        color: colors.white,
        fontSize: 12,
    },
    connectButton: {
        padding: 8,
        marginLeft: 8,
        zIndex: 5,
    },
    bioText: {
        color: colors.gray300,
        marginTop: 6,
        lineHeight: 18,
        flex: 1,
        marginRight: 8,
    },
    bioTouchable: {
        zIndex: 4, // sit above the hold-to-pause overlay so taps are delivered
    },
    rolesNeededRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 0,
    },
    rolesNeededInlineRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    rolesLabelInline: {
        color: colors.brandPurple,
        fontSize: 14,
        fontWeight: "700",
        marginRight: 8,
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
        color: colors.white,
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
        color: colors.white,
        fontSize: 12,
    },
    pressableOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
    },
    holdIconContainer: {
        position: "absolute",
        top: "45%",
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3,
        opacity: 0.95,
    },
    chevronContainer: {
        width: 36,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4,
    },
    soundwaveContainer: {
        position: "absolute",
        top: "45%",
        left: 0,
        right: 0,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },
});

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FeedScreen from "../screens/FeedScreen";
import MessagingNavigator from "./MessagingNavigator";
import ProfileScreen from "../screens/ProfileScreen";
import ManagementScreen from "../screens/ManagementScreen";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile } from '../services/authService';
import AuthNavigator from "./AuthNavigator";
import { colors } from "../theme/colors";
import ChatListScreen from "../screens/messaging/ChatListScreen";

const Tab = createBottomTabNavigator();

const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen
                name="Feed"
                component={FeedScreen}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <MaterialIcons
                            name="home"
                            size={24}
                            color={
                                focused ? colors.white : colors.gray300
                            }
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Messages"
                component={ChatListScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <MaterialIcons
                            name="chat-bubble"
                            size={24}
                            color={
                                focused ? colors.white : colors.gray300
                            }
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Management"
                component={ManagementScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <MaterialIcons
                            name="workspaces-outline"
                            size={24}
                            color={
                                focused ? colors.white : colors.gray300
                            }
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <MaterialIcons
                            name="person"
                            size={24}
                            color={
                                focused ? colors.white : colors.gray300
                            }
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    const { user, loading, isDevUser } = useAuth();
    const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
    const [checkingProfile, setCheckingProfile] = useState(false);
    const hasCheckedProfile = useRef(false);

    const checkProfile = useCallback(async () => {
        if (!user) return;
        
        setCheckingProfile(true);
        try {
            const profile = await getUserProfile(user.uid);
            // Profile is complete if it has genres or roles
            const isComplete = profile && (profile.genre?.length > 0 || profile.role?.length > 0);
            console.log('Profile check:', { hasProfile: !!profile, genres: profile?.genre?.length, roles: profile?.role?.length, isComplete });
            setProfileComplete(isComplete);
        } catch (error) {
            console.error('Error checking profile:', error);
            // If profile doesn't exist or error, assume incomplete
            setProfileComplete(false);
        } finally {
            setCheckingProfile(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            setProfileComplete(null);
            hasCheckedProfile.current = false;
            return;
        }
        
        // Check profile initially
        if (!hasCheckedProfile.current) {
            hasCheckedProfile.current = true;
            // For new signups, assume incomplete initially to allow navigation
            setProfileComplete(false);
            
            // Delay the actual check to allow navigation to complete
            const timer = setTimeout(() => {
                checkProfile();
            }, 800); // Longer delay to ensure navigation.reset completes

            return () => clearTimeout(timer);
        }
    }, [user]);

    // If profile is incomplete, periodically re-check (every 2 seconds)
    // This allows the app to detect when profile is updated in ProfileGenresScreen
    useEffect(() => {
        if (!user || profileComplete !== false) {
            return;
        }
        
        const intervalId = setInterval(() => {
            checkProfile();
        }, 2000);

        return () => clearInterval(intervalId);
    }, [user, profileComplete, checkProfile]);

    // Only show loading if auth is loading, not when checking profile
    // This prevents remounting AuthNavigator during profile checks
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.brandPurple} />
            </View>
        );
    }
    
    // Determine which navigator to show
    // If user exists but profile is incomplete (or null), show AuthNavigator
    // If user exists and profile is complete, show MainTabs
    // If no user, show AuthNavigator
    // For dev users, always show MainTabs
    const shouldShowAuth = !user || (!isDevUser && (profileComplete === null || !profileComplete));

    // Use a stable key based on user ID to preserve navigation state
    // This prevents remounting when profileComplete changes
    const navigatorKey = user ? `auth-${user.uid}` : 'auth-no-user';

    return (
        <NavigationContainer>
            {shouldShowAuth ? (
                <AuthNavigator key={navigatorKey} />
            ) : (
                <MainTabs />
            )}
        </NavigationContainer>
    );
};

// Placeholder screen for Feed (to be implemented later)
const PlaceholderScreen = () => (
    <View style={styles.placeholder}>
        <Text>Feed Screen</Text>
    </View>
);

// Placeholder screen for Profile
const ProfilePlaceholderScreen = () => (
    <View style={styles.placeholder}>
        <Text>Profile Screen</Text>
    </View>
);

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: colors.black,
        justifyContent: "center",
        alignItems: "center",
    },
    tabBar: {
        backgroundColor: colors.brandPurple600,
        paddingTop: 5,
        paddingBottom: 10,
        height: 50,
    },
    tabIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.gray200,
    },
    tabIconActive: {
        backgroundColor: colors.gray300,
    },
    placeholder: {
        flex: 1,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default AppNavigator;

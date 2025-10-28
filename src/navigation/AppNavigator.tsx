import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FeedScreen from "../screens/FeedScreen";
import ChatListScreen from "../screens/messaging/ChatListScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ManagementScreen from "../screens/ManagementScreen";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';

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
                                color={focused ? "#007AFF" : "#8e8e93"}
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
                                color={focused ? "#007AFF" : "#8e8e93"}
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
                                color={focused ? "#007AFF" : "#8e8e93"}
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
                                color={focused ? "#007AFF" : "#8e8e93"}
                            />
                        ),
                    }}
                />
            
            </Tab.Navigator>
    );
};

const AppNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9333ea" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? <MainTabs /> : <AuthNavigator />}
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
        backgroundColor: '#0a0a0a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBar: {
        borderTopWidth: 1,
        borderTopColor: "#eee",
        backgroundColor: "#fff",
        paddingTop: 5,
        paddingBottom: 10,
        height: 50,
    },
    tabIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#e0e0e0",
    },
    tabIconActive: {
        backgroundColor: "#c0c0c0",
    },
    placeholder: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
});

export default AppNavigator;

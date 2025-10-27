import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FeedScreen from '../screens/FeedScreen';
import ChatListScreen from '../screens/messaging/ChatListScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
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
                        tabBarIcon: ({ focused }) => (
                            <View style={[styles.tabIcon, focused && styles.tabIconActive]} />
                        ),
                    }}
                />
                <Tab.Screen 
                    name="Messages" 
                    component={ChatListScreen}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <View style={[styles.tabIcon, focused && styles.tabIconActive]} />
                        ),
                    }}
                />
                <Tab.Screen 
                    name="Profile" 
                    component={ProfileScreen}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <View style={[styles.tabIcon, focused && styles.tabIconActive]} />
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
        borderTopColor: '#eee',
        backgroundColor: '#fff',
        paddingVertical: 10,
        height: 60,
    },
    tabIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
    },
    tabIconActive: {
        backgroundColor: '#c0c0c0',
    },
    placeholder: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AppNavigator;

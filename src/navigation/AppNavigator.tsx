import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChatListScreen from '../screens/messaging/ChatListScreen';
import { View, StyleSheet, Text } from 'react-native';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: styles.tabBar,
                    tabBarShowLabel: false,
                }}
            >
                <Tab.Screen 
                    name="Feed" 
                    component={PlaceholderScreen}
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
                    component={ProfilePlaceholderScreen}
                    options={{
                        tabBarIcon: ({ focused }) => (
                            <View style={[styles.tabIcon, focused && styles.tabIconActive]} />
                        ),
                    }}
                />
            </Tab.Navigator>
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

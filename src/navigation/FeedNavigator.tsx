import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FeedScreen from '../screens/FeedScreen';
import CreatorProfileScreen from '../screens/CreatorProfileScreen';

export type FeedStackParamList = {
    FeedMain: undefined;
    CreatorProfile: {
        creatorId: string;
        creatorName?: string;
    };
};

const Stack = createStackNavigator<FeedStackParamList>();

const FeedNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
            initialRouteName="FeedMain"
        >
            <Stack.Screen name="FeedMain" component={FeedScreen} />
            <Stack.Screen name="CreatorProfile" component={CreatorProfileScreen} />
        </Stack.Navigator>
    );
};

export default FeedNavigator;

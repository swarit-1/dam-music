import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChatListScreen from '../screens/messaging/ChatListScreen';
import ChatScreen from '../screens/messaging/ChatScreen';

export type MessagingStackParamList = {
    ChatList: undefined;
    Chat: { 
        chatId: string; 
        chatName: string;
        messages: Array<{
            id: string;
            text: string;
            senderName: string;
            senderId: string;
            timestamp: Date;
        }>;
    };
};

const Stack = createStackNavigator<MessagingStackParamList>();

const MessagingNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="ChatList" component={ChatListScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
    );
};

export default MessagingNavigator;
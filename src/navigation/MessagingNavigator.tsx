import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChatListScreen from '../screens/messaging/ChatListScreen';
import ChatScreen from '../screens/messaging/ChatScreen';
import EnhancedChatListScreen from '../screens/messaging/EnhancedChatListScreen';
import EnhancedChatScreen from '../screens/messaging/EnhancedChatScreen';
import CreateProjectChatScreen from '../screens/messaging/CreateProjectChatScreen';

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
    EnhancedChatList: undefined;
    EnhancedChat: {
        conversationId: string;
        chatName: string;
    };
    CreateProjectChat: undefined;
};

const Stack = createStackNavigator<MessagingStackParamList>();

const MessagingNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
            initialRouteName="EnhancedChatList"
        >
            {/* Legacy screens */}
            <Stack.Screen name="ChatList" component={ChatListScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            
            {/* Enhanced messaging screens */}
            <Stack.Screen name="EnhancedChatList" component={EnhancedChatListScreen} />
            <Stack.Screen name="EnhancedChat" component={EnhancedChatScreen} />
            <Stack.Screen name="CreateProjectChat" component={CreateProjectChatScreen} />
        </Stack.Navigator>
    );
};

export default MessagingNavigator;
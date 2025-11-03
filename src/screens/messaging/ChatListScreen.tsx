import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MessagingStackParamList } from '../../navigation/MessagingNavigator';
import { colors } from '../../theme/colors';

//replace with actual chat data later
const chats = [
    { id: '1', name: 'Bob Grand', lastMessage: 'What are your thoughts on this beat?', time: '2:30 PM', isUnread: false },
    { id: '2', name: 'John Doe', lastMessage: 'Hey, want to collaborate on a track?', time: '1:45 PM', isUnread: true },
    { id: '3', name: 'Sarah Music', lastMessage: 'Love your latest upload!', time: '12:20 PM', isUnread: false },
    { id: '4', name: 'Mike Beats', lastMessage: 'Check out this new sample I found', time: '11:15 AM', isUnread: false },
    { id: '5', name: 'Alex Producer', lastMessage: 'Your mixing skills are incredible', time: '10:30 AM', isUnread: false },
    { id: '6', name: 'Emma Vocals', lastMessage: 'Thanks for the feedback on my demo', time: '9:45 AM', isUnread: false },
]

// Mock conversation data for each chat
const conversations = {
    '1': [
        { id: '1', text: 'Hey! Check out this beat I made', senderName: 'Bob Grand', senderId: 'other', timestamp: new Date(Date.now() - 3600000) },
        { id: '2', text: 'Sounds really good! Love the bass line', senderName: 'You', senderId: 'me', timestamp: new Date(Date.now() - 3300000) },
        { id: '3', text: 'Thanks! What are your thoughts on this beat?', senderName: 'Bob Grand', senderId: 'other', timestamp: new Date(Date.now() - 3000000) },
    ],
    '2': [
        { id: '1', text: 'Hey, want to collaborate on a track?', senderName: 'John Doe', senderId: 'other', timestamp: new Date(Date.now() - 7200000) },
        { id: '2', text: 'Absolutely! What kind of track are you thinking?', senderName: 'You', senderId: 'me', timestamp: new Date(Date.now() - 6900000) },
        { id: '3', text: 'Something electronic with vocals. You in?', senderName: 'John Doe', senderId: 'other', timestamp: new Date(Date.now() - 6600000) },
    ],
    '3': [
        { id: '1', text: 'Love your latest upload!', senderName: 'Sarah Music', senderId: 'other', timestamp: new Date(Date.now() - 10800000) },
        { id: '2', text: 'Thank you so much! Glad you enjoyed it', senderName: 'You', senderId: 'me', timestamp: new Date(Date.now() - 10500000) },
        { id: '3', text: 'The production quality is amazing', senderName: 'Sarah Music', senderId: 'other', timestamp: new Date(Date.now() - 10200000) },
    ],
    '4': [
        { id: '1', text: 'Check out this new sample I found', senderName: 'Mike Beats', senderId: 'other', timestamp: new Date(Date.now() - 14400000) },
        { id: '2', text: 'Wow, that sample is perfect for my current project!', senderName: 'You', senderId: 'me', timestamp: new Date(Date.now() - 14100000) },
        { id: '3', text: 'Glad you like it! Let me know if you need the full pack', senderName: 'Mike Beats', senderId: 'other', timestamp: new Date(Date.now() - 13800000) },
    ],
    '5': [
        { id: '1', text: 'Your mixing skills are incredible', senderName: 'Alex Producer', senderId: 'other', timestamp: new Date(Date.now() - 18000000) },
        { id: '2', text: 'Thanks! Been working on my technique for years', senderName: 'You', senderId: 'me', timestamp: new Date(Date.now() - 17700000) },
        { id: '3', text: 'It really shows in your work. Any tips for beginners?', senderName: 'Alex Producer', senderId: 'other', timestamp: new Date(Date.now() - 17400000) },
    ],
    '6': [
        { id: '1', text: 'Thanks for the feedback on my demo', senderName: 'Emma Vocals', senderId: 'other', timestamp: new Date(Date.now() - 21600000) },
        { id: '2', text: 'No problem! Your vocals are really strong', senderName: 'You', senderId: 'me', timestamp: new Date(Date.now() - 21300000) },
        { id: '3', text: 'Means a lot coming from you. Keep creating!', senderName: 'Emma Vocals', senderId: 'other', timestamp: new Date(Date.now() - 21000000) },
    ],
}

const ChatListScreen = () => {
    const navigation = useNavigation<StackNavigationProp<MessagingStackParamList>>();
    const [chatsData, setChatsData] = useState(chats);
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        item: typeof chats[0] | null;
        position: { x: number; y: number } | null;
    }>({ visible: false, item: null, position: null });
    const flatListRef = useRef<FlatList>(null);

    const showChatOptions = (item: typeof chats[0], position: { x: number; y: number }) => {
        setContextMenu({ visible: true, item, position });
    };

    const hideContextMenu = () => {
        setContextMenu({ visible: false, item: null, position: null });
    };

    const handleMarkAsUnread = () => {
        if (contextMenu.item) {
            setChatsData(prev => prev.map(chat => 
                chat.id === contextMenu.item!.id ? { ...chat, isUnread: true } : chat
            ));
        }
        hideContextMenu();
    };

    const renderChatItem = ({ item }: {item: typeof chats[0] }) => (
        <TouchableOpacity 
            style={styles.chatItem}
            onPress={() => {
                // Mark as read
                setChatsData(prev => prev.map(chat => 
                    chat.id === item.id ? { ...chat, isUnread: false } : chat
                ));
                navigation.navigate('Chat', { 
                    chatId: item.id, 
                    chatName: item.name,
                    messages: conversations[item.id as keyof typeof conversations] || []
                });
            }}
            onLongPress={(event) => {
                const { pageX, pageY } = event.nativeEvent;
                showChatOptions(item, { x: pageX, y: pageY });
            }}
        >
            <View style={styles.chatItemContent}>
                <View style={styles.nameAndTimeRow}>
                    <View style={styles.nameRow}>
                        {item.isUnread && <View style={styles.unreadDot} />}
                        <Text style={[styles.senderName, item.isUnread && styles.unreadName]}>{item.name}</Text>
                    </View>
                    <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">
                    {item.lastMessage}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/*Header for message page */}
            <View style={styles.header}>
                <View style={styles.headerLeftPlaceholder} />
                <Text style={styles.title}>Messages</Text>
                <TouchableOpacity style={styles.newMessageButton}>
                    <Text style={styles.newMessageButtonText}>New</Text>
                </TouchableOpacity>
            </View>
            <FlatList 
                ref={flatListRef}
                data={chatsData} 
                renderItem={renderChatItem} 
                keyExtractor={(item) => item.id} 
                contentContainerStyle={styles.chatListContent} 
                ListFooterComponent={<View style={styles.emptyChatItemPlaceholder} />}
            />

            {/* Custom Context Menu */}
            <Modal
                visible={contextMenu.visible}
                transparent={true}
                animationType="fade"
                onRequestClose={hideContextMenu}
            >
                <TouchableOpacity 
                    style={styles.overlay} 
                    activeOpacity={1} 
                    onPress={hideContextMenu}
                >
                    {contextMenu.position && (
                        <View 
                            style={[
                                styles.contextMenu,
                                {
                                    left: 30, // Fixed position near the left edge, like Instagram
                                    top: (() => {
                                        const screenHeight = Dimensions.get('window').height;
                                        const pressY = contextMenu.position.y;
                                        // Calculate menu height based on number of items shown
                                        const showMarkAsUnread = contextMenu.item && !contextMenu.item.isUnread;
                                        const menuHeight = showMarkAsUnread ? 100 : 60; // 100px for 2 items, 60px for 1 item
                                        
                                        // If press is in bottom half of screen, show menu above
                                        if (pressY > screenHeight / 2) {
                                            return pressY - menuHeight - 10; // Above with small gap
                                        } else {
                                            return pressY + 10; // Below with small gap
                                        }
                                    })(),
                                }
                            ]}
                        >
                            {contextMenu.item && !contextMenu.item.isUnread && (
                                <TouchableOpacity 
                                    style={styles.contextMenuItem}
                                    onPress={handleMarkAsUnread}
                                >
                                    <Text style={styles.contextMenuText}>Mark as Unread</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.contextMenuItem}>
                                <Text style={[styles.contextMenuText, styles.addFeatureText]}>Add Feature</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    backButton: {
        padding: 5,
    },
    backButtonIcon: {
        fontSize: 24,
        color: colors.black,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.black,
    },
    headerRightPlaceholder: {
        width: 30,
    },
    chatListContent: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    chatItem: {
        backgroundColor: colors.gray100,
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    chatItemContent: {
        flexDirection: 'column',
    },
    nameAndTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    unreadName: {
        fontWeight: '600',
    },
    senderName: {
        fontSize: 16,
        fontWeight: "bold",
        color: colors.black,
    },
    timestamp: {
        fontSize: 14,
        color: colors.gray400,
    },
    lastMessage: {
        fontSize: 14,
        color: '#555',
        marginLeft: 2,
        flex: 1,
    },
    unreadMessage: {
        color: colors.brandPurple,
        textDecorationLine: "underline",
    },
    emptyChatItemPlaceholder: {
        backgroundColor: colors.gray100,
        borderRadius: 10,
        height: 70,
        marginTop: 10,
        marginBottom: 10,
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        backgroundColor: colors.white,
    },
    navIconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.gray200,
    },
    activeNavIcon: {
        backgroundColor: colors.gray300,
    },
    time: {
        fontSize: 14,
        color: colors.gray400,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#007AFF',
        marginRight: 6,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.black,
    },
    newMessageButton: {
        padding: 5,
    },
    newMessageButtonText: {
        fontSize: 16,
        color: colors.black,
    },
    listContainer: {
        paddingHorizontal: 15,
    },
    backButtonText: {
        fontSize: 16,
        color: '#000',
    },
    headerLeftPlaceholder: {
        width: 50,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    contextMenu: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 0,
        minWidth: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    contextMenuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    contextMenuText: {
        fontSize: 16,
        color: '#333',
    },
    addFeatureText: {
        color: '#999',
        fontStyle: 'italic',
    },
});

export default ChatListScreen;

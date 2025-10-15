import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

//replace with actual chat data later 
const chats = [
    { id: '1', name: 'Bob Grand', lastMessage: 'What are your thoughts on this?', time: '00:00', isUnread: false },
    { id: '2', name: 'John Doe', lastMessage: 'What are your thoughts on this?', time: '00:00', isUnread: true }, // Blue and underlined
    { id: '3', name: 'Bob Grand', lastMessage: 'What are your thoughts on this?', time: '00:00', isUnread: false },
    { id: '4', name: 'Bob Grand', lastMessage: 'What are your thoughts on this?', time: '00:00', isUnread: false },
    { id: '5', name: 'Bob Grand', lastMessage: 'What are your thoughts on this?', time: '00:00', isUnread: false },
    { id: '6', name: 'Bob Grand', lastMessage: 'What are your thoughts on this?', time: '00:00', isUnread: false },
]

const ChatListScreen = () => {

    const renderChatItem = ({ item }: {item: typeof chats[0] }) => (
        <TouchableOpacity style={styles.chatItem}>
            <View style={styles.chatItemContent}>
                <Text style={styles.senderName}>{item.name}</Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
                <Text style={styles.time}>{item.time}</Text>
            </View>
            <View style={styles.unreadIndicator}>
                {item.isUnread && <View style={styles.unreadDot} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/*Header for message page */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Messages</Text>
                <TouchableOpacity style={styles.newMessageButton}>
                    <Text style={styles.newMessageButtonText}>New</Text>
                </TouchableOpacity>
            </View>
            <FlatList 
                data={chats} 
                renderItem={renderChatItem} 
                keyExtractor={(item) => item.id} 
                contentContainerStyle={styles.chatListContent} 
                ListFooterComponent={<View style={styles.emptyChatItemPlaceholder} />}
            />
            <View style={styles.bottomNav} >
                <View style={styles.navIconPlaceholder}/>
                <View style={[styles.navIconPlaceholder, styles.activeNavIcon]} />
                <View style={styles.navIconPlaceholder} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 5,
    },
    backButtonIcon: {
        fontSize: 24,
        color: '#000',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    headerRightPlaceholder: {
        width: 30,
    },
    chatListContent: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    chatItem: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    chatItemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    senderName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    timestamp: {
        fontSize: 14,
        color: '#888',
    },
    lastMessage: {
        fontSize: 14,
        color: '#555',
    },
    unreadMessage: {
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
    emptyChatItemPlaceholder: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        height: 70,
        marginTop: 10,
        marginBottom: 10,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
    },
    navIconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
    },
    activeNavIcon: {
        backgroundColor: '#c0c0c0',
    },
    time: {
        fontSize: 14,
        color: '#888',
    },
    unreadIndicator: {
        width: 10,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#007AFF',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    newMessageButton: {
        padding: 5,
    },
    newMessageButtonText: {
        fontSize: 16,
        color: '#000',
    },
    listContainer: {
        paddingHorizontal: 15,
    },
    backButtonText: {
        fontSize: 16,
        color: '#000',
    },
});

export default ChatListScreen;
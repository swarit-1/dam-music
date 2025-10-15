import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const messages = [
    { id: '1', text: 'Hey! How are you?', senderId: 'other', timestamp: new Date() },
    { id: '2', text: "I'm good, thanks! Working on some new beats.", senderId: 'me', timestamp: new Date() },
    { id: '3', text: 'That sounds awesome! Can I hear them?', senderId: 'other', timestamp: new Date() },
];

const ChatScreen = () => {

    const renderMessage = ({ item }: {item: typeof messages[0]}) => (
        <View style={[styles.messageBubble, item.senderId === 'me' ? styles.sentMessage : styles.receivedMessage]}>
            <Text style={[styles.messageText]}>
                {item.text}
            </Text>
            <Text style={styles.timestamp}>
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>

        </View>
    );

    const renderInput = () => (
        <View style={styles.inputContainer}>
        </View>
    );

    const renderBottomNav = () => (
        <View style={styles.bottomNav}>
            
        </View>
    );

    return (
        <View style={styles.container}>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',    
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
    },
    messageText: {
        fontSize: 16,
        color: '#000',
    },
    sentMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#007AFF',
        color: '#fff',
    },
    receivedMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#f0f0f0',
        color: '#000',
    },
    timestamp: {
        fontSize: 12,
        color: '#888',
        textAlign: 'right',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
});

export default ChatScreen

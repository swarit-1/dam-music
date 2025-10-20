import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const messages = [
    { id: '1', text: 'Hey! How are you?', senderName: 'Bob Grand', senderId: 'other', timestamp: new Date() },
    { id: '2', text: "I'm good, thanks! Working on some new beats.", senderName: 'John Doe', senderId: 'me', timestamp: new Date() },
    { id: '3', text: 'That sounds awesome! Can I hear them?', senderName: 'Bob Grand', senderId: 'other', timestamp: new Date() },
];

const ChatScreen = () => {

    const renderMessage = ({ item }: {item: typeof messages[0]}) => (
        <View style={[styles.messageBubble, item.senderId === 'me' ? styles.sentMessage : styles.receivedMessage]}>
            <View style={styles.messageHeader}>
                <Text style={styles.senderName}>{item.senderName}</Text>
                <Text style={styles.timestamp}>
                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            <Text style={[styles.messageText]}>
                {item.text}
            </Text>
        </View>
    );

    const HeaderComponent = () => {
        return (
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Messages</Text>
            </View>
        );
    };

    const InputComponent = () => {
        return (
            <View style={styles.inputContainer}>
                <TextInput style={styles.input} placeholder="Type your message..." />
                <TouchableOpacity style={styles.sendButton}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <HeaderComponent />
            <FlatList 
                data={messages} 
                renderItem={renderMessage} 
                keyExtractor={(item) => item.id} 
                contentContainerStyle={styles.messageList}
            />
            <InputComponent />
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
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    senderName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    backButton: {
        padding: 5,
    },
    backButtonText: {
        fontSize: 16,
        color: '#000',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    messageList: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    input: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    sendButton: {
        padding: 5,
    },
    sendButtonText: {
        fontSize: 16,
        color: '#000',
    },
});

export default ChatScreen

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MessagingStackParamList } from '../../navigation/MessagingNavigator';
import { MaterialIcons } from '@expo/vector-icons';

const ChatScreen = () => {
    const navigation = useNavigation<StackNavigationProp<MessagingStackParamList>>();
    const route = useRoute<RouteProp<MessagingStackParamList, 'Chat'>>();
    const { chatName, messages } = route.params;

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
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.title}>{chatName}</Text>
                <View style={styles.headerRightPlaceholder} />
            </View>
        );
    };

    const InputComponent = () => {
        return (
            <View style={styles.inputContainer}>
                <TextInput 
                    style={styles.input} 
                    placeholder="Type your message..."
                    keyboardAppearance="default"
                />
                <TouchableOpacity style={styles.sendButton}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <HeaderComponent />
            <KeyboardAvoidingView 
                style={styles.keyboardAvoidingView}
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <FlatList 
                    data={messages} 
                    renderItem={renderMessage} 
                    keyExtractor={(item) => item.id} 
                    contentContainerStyle={styles.messageList}
                    inverted
                    keyboardShouldPersistTaps="handled"
                />
                <InputComponent />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',    
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        marginBottom: 12,
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
        paddingVertical: 15,
        paddingTop: 20,
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
        padding: 10,
        marginBottom: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    headerRightPlaceholder: {
        width: 50,
    },
    messageList: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexGrow: 1,
        justifyContent: 'flex-end',
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

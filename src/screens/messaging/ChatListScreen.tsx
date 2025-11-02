import React from "react";
import { colors } from "../../theme/colors";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//replace with actual chat data later
const chats = [
    {
        id: "1",
        name: "Bob Grand",
        lastMessage: "What are your thoughts on this?",
        time: "00:00",
        isUnread: false,
    },
    {
        id: "2",
        name: "John Doe",
        lastMessage: "What are your thoughts on this?",
        time: "00:00",
        isUnread: true,
    },
    {
        id: "3",
        name: "Bob Grand",
        lastMessage: "What are your thoughts on this?",
        time: "00:00",
        isUnread: false,
    },
    {
        id: "4",
        name: "Bob Grand",
        lastMessage: "What are your thoughts on this?",
        time: "00:00",
        isUnread: false,
    },
    {
        id: "5",
        name: "Bob Grand",
        lastMessage: "What are your thoughts on this?",
        time: "00:00",
        isUnread: false,
    },
    {
        id: "6",
        name: "Bob Grand",
        lastMessage: "What are your thoughts on this?",
        time: "00:00",
        isUnread: false,
    },
];

const ChatListScreen = () => {
    const renderChatItem = ({ item }: { item: (typeof chats)[0] }) => (
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
                ListFooterComponent={
                    <View style={styles.emptyChatItemPlaceholder} />
                }
            />
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
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
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
        color: colors.gray500,
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
    unreadIndicator: {
        width: 10,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.brandPurple,
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
        color: colors.black,
    },
});

export default ChatListScreen;

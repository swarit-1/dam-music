import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Collaboration {
    id: string;
    title: string;
    partner: string;
    status: 'active' | 'review' | 'completed';
    progress: number;
    lastActivity: string;
    genre: string;
}

const ManagementScreen = () => {
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

    // Mock data for collaborations
    const collaborations: Collaboration[] = [
        {
            id: '1',
            title: 'Summer Vibes Track',
            partner: 'Alex Johnson',
            status: 'active',
            progress: 75,
            lastActivity: '2 hours ago',
            genre: 'Pop',
        },
        {
            id: '2',
            title: 'Midnight Sessions',
            partner: 'Sarah Chen',
            status: 'review',
            progress: 90,
            lastActivity: '1 day ago',
            genre: 'R&B',
        },
        {
            id: '3',
            title: 'Electric Dreams',
            partner: 'Mike Rodriguez',
            status: 'active',
            progress: 45,
            lastActivity: '3 hours ago',
            genre: 'Electronic',
        },
        {
            id: '4',
            title: 'Acoustic Journey',
            partner: 'Emma Wilson',
            status: 'completed',
            progress: 100,
            lastActivity: '1 week ago',
            genre: 'Folk',
        },
    ];

    const filteredCollaborations = collaborations.filter(collab =>
        activeTab === 'active' ? collab.status !== 'completed' : collab.status === 'completed'
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#4CAF50';
            case 'review': return '#FF9800';
            case 'completed': return '#2196F3';
            default: return '#666';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'In Progress';
            case 'review': return 'Under Review';
            case 'completed': return 'Completed';
            default: return status;
        }
    };

    const renderCollaboration = ({ item }: { item: Collaboration }) => (
        <TouchableOpacity
            style={styles.collabCard}
            onPress={() => Alert.alert('Collaboration Details', `Open ${item.title} with ${item.partner}`)}
        >
            <View style={styles.collabHeader}>
                <View style={styles.collabInfo}>
                    <Text style={styles.collabTitle}>{item.title}</Text>
                    <Text style={styles.collabPartner}>with {item.partner}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
            </View>

            <View style={styles.collabDetails}>
                <View style={styles.genreTag}>
                    <Text style={styles.genreText}>{item.genre}</Text>
                </View>
                <Text style={styles.lastActivity}>{item.lastActivity}</Text>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[styles.progressFill, { width: `${item.progress}%` }]}
                    />
                </View>
                <Text style={styles.progressText}>{item.progress}%</Text>
            </View>

            <View style={styles.collabActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Alert.alert('Messages', `Chat with ${item.partner}`)}
                >
                    <MaterialIcons name="chat" size={16} color="#007AFF" />
                    <Text style={styles.actionText}>Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Alert.alert('Files', 'View shared files')}
                >
                    <MaterialIcons name="folder" size={16} color="#007AFF" />
                    <Text style={styles.actionText}>Files</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => Alert.alert('Timeline', 'View project timeline')}
                >
                    <MaterialIcons name="timeline" size={16} color="#007AFF" />
                    <Text style={styles.actionText}>Timeline</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Collaborations</Text>
                <Text style={styles.headerSubtitle}>Manage your music projects</Text>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                    onPress={() => setActiveTab('active')}
                >
                    <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                        Active ({collaborations.filter(c => c.status !== 'completed').length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
                    onPress={() => setActiveTab('completed')}
                >
                    <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
                        Completed ({collaborations.filter(c => c.status === 'completed').length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => Alert.alert('New Collaboration', 'Start a new music collaboration')}
                >
                    <MaterialIcons name="add" size={24} color="#007AFF" />
                    <Text style={styles.quickActionText}>New Project</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => Alert.alert('Find Collaborators', 'Browse available musicians')}
                >
                    <MaterialIcons name="search" size={24} color="#007AFF" />
                    <Text style={styles.quickActionText}>Find Partners</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => Alert.alert('Templates', 'Use project templates')}
                >
                    <MaterialIcons name="description" size={24} color="#007AFF" />
                    <Text style={styles.quickActionText}>Templates</Text>
                </TouchableOpacity>
            </View>

            {/* Collaborations List */}
            <FlatList
                data={filteredCollaborations}
                renderItem={renderCollaboration}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.collabList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialIcons name="music-note" size={48} color="#ccc" />
                        <Text style={styles.emptyTitle}>
                            {activeTab === 'active' ? 'No active collaborations' : 'No completed projects'}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {activeTab === 'active'
                                ? 'Start a new music collaboration to get started!'
                                : 'Complete some projects to see them here.'
                            }
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6c757d',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 12,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#007AFF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6c757d',
    },
    activeTabText: {
        color: '#fff',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    quickActionButton: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        minWidth: 80,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickActionText: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '600',
        marginTop: 4,
    },
    collabList: {
        padding: 20,
    },
    collabCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    collabHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    collabInfo: {
        flex: 1,
    },
    collabTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    collabPartner: {
        fontSize: 14,
        color: '#6c757d',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    collabDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    genreTag: {
        backgroundColor: '#f0f8ff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    genreText: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '500',
    },
    lastActivity: {
        fontSize: 12,
        color: '#6c757d',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: '#e9ecef',
        borderRadius: 3,
        marginRight: 12,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    collabActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
    },
    actionText: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '500',
        marginLeft: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6c757d',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});

export default ManagementScreen;
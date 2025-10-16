import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
    bottomNav: {
        display: 'flex',
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
});

interface BottomNavigationProps {
    activeTab: 'Feed' | 'Workflow' | 'Profile';
    onTabPress: (index: number) => void;
}

const BottomNavigation = ({ activeTab, onTabPress }: BottomNavigationProps) => {
    return (
        <View style={styles.bottomNav}>
            {[0, 1, 2].map((index) => (
                <TouchableOpacity 
                    key={index} 
                    style={styles.navIconPlaceholder} 
                    onPress={() => onTabPress(index)}
                /> 
            ))}
        </View>
    );
};

export default BottomNavigation;

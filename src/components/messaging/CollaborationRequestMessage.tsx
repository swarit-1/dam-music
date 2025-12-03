import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { CollaborationRequestData } from '../../types/messaging';

interface CollaborationRequestMessageProps {
  data: CollaborationRequestData;
  isOwnMessage: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

const CollaborationRequestMessage: React.FC<CollaborationRequestMessageProps> = ({
  data,
  isOwnMessage,
  onAccept,
  onDecline,
}) => {
  const isPending = data.status === 'pending';
  const isAccepted = data.status === 'accepted';
  const isDeclined = data.status === 'declined';

  return (
    <View style={[styles.container, isOwnMessage && styles.ownMessage]}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="handshake" size={24} color={colors.brandPurple} />
        <Text style={styles.headerText}>Collaboration Request</Text>
      </View>

      {/* Content */}
      {data.projectTitle && (
        <Text style={styles.projectTitle}>{data.projectTitle}</Text>
      )}
      
      {data.projectDescription && (
        <Text style={styles.description} numberOfLines={3}>
          {data.projectDescription}
        </Text>
      )}

      {/* Roles Needed */}
      {data.rolesNeeded.length > 0 && (
        <View style={styles.rolesContainer}>
          <Text style={styles.rolesLabel}>Looking for:</Text>
          <View style={styles.rolesList}>
            {data.rolesNeeded.map((role, index) => (
              <View key={index} style={styles.roleBadge}>
                <Text style={styles.roleText}>{role}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      {!isOwnMessage && isPending && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.acceptButton]}
            onPress={onAccept}
          >
            <MaterialIcons name="check" size={20} color={colors.white} />
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.declineButton]}
            onPress={onDecline}
          >
            <MaterialIcons name="close" size={20} color={colors.gray600} />
            <Text style={[styles.buttonText, styles.declineButtonText]}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Status */}
      {isAccepted && (
        <View style={[styles.statusBadge, styles.acceptedBadge]}>
          <MaterialIcons name="check-circle" size={16} color={colors.white} />
          <Text style={styles.statusText}>Accepted</Text>
        </View>
      )}
      
      {isDeclined && (
        <View style={[styles.statusBadge, styles.declinedBadge]}>
          <MaterialIcons name="cancel" size={16} color={colors.white} />
          <Text style={styles.statusText}>Declined</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 16,
    maxWidth: '90%',
    borderLeftWidth: 4,
    borderLeftColor: colors.brandPurple,
  },
  ownMessage: {
    backgroundColor: 'rgba(149, 79, 223, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brandPurple,
    marginLeft: 8,
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.gray700,
    marginBottom: 12,
    lineHeight: 20,
  },
  rolesContainer: {
    marginBottom: 16,
  },
  rolesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray600,
    marginBottom: 8,
  },
  rolesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: colors.brandPurple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: colors.brandPurple,
  },
  declineButton: {
    backgroundColor: colors.gray200,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  declineButtonText: {
    color: colors.gray600,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginTop: 8,
  },
  acceptedBadge: {
    backgroundColor: '#4CAF50',
  },
  declinedBadge: {
    backgroundColor: colors.gray400,
  },
  statusText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
});

export default CollaborationRequestMessage;


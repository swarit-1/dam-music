import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { colors } from '../../theme/colors';
import { MessageReaction } from '../../types/messaging';

interface MessageReactionsProps {
  reactions: MessageReaction[];
  onReactionPress: (emoji: string) => void;
  currentUserId: string;
}

const QUICK_REACTIONS = ['🔥', '🎵', '👍', '💯', '❤️', '😍'];

const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  onReactionPress,
  currentUserId,
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, MessageReaction[]>);

  const hasUserReacted = (emoji: string) => {
    return groupedReactions[emoji]?.some(r => r.userId === currentUserId);
  };

  return (
    <View style={styles.container}>
      {/* Display existing reactions */}
      <View style={styles.reactionsDisplay}>
        {Object.entries(groupedReactions).map(([emoji, reactionList]) => (
          <TouchableOpacity
            key={emoji}
            style={[
              styles.reactionBubble,
              hasUserReacted(emoji) && styles.reactionBubbleActive,
            ]}
            onPress={() => onReactionPress(emoji)}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
            {reactionList.length > 1 && (
              <Text style={styles.reactionCount}>{reactionList.length}</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Add reaction button */}
        <TouchableOpacity
          style={styles.addReactionButton}
          onPress={() => setShowReactionPicker(true)}
        >
          <Text style={styles.addReactionText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Reaction Picker Modal */}
      <Modal
        visible={showReactionPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReactionPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReactionPicker(false)}
        >
          <View style={styles.reactionPicker}>
            {QUICK_REACTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.reactionOption}
                onPress={() => {
                  onReactionPress(emoji);
                  setShowReactionPicker(false);
                }}
              >
                <Text style={styles.reactionOptionEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  reactionsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },
  reactionBubbleActive: {
    backgroundColor: 'rgba(149, 79, 223, 0.1)',
    borderColor: colors.brandPurple,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 11,
    color: colors.gray700,
    fontWeight: '600',
  },
  addReactionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray300,
    borderStyle: 'dashed',
  },
  addReactionText: {
    fontSize: 16,
    color: colors.gray600,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionPicker: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  reactionOption: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: colors.gray50,
  },
  reactionOptionEmoji: {
    fontSize: 24,
  },
});

export default MessageReactions;


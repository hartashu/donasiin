import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Send } from 'lucide-react-native';

// Mock data for a single conversation
const mockMessages = [
  {
    _id: 1,
    text: 'Hi! I saw you\'re interested in the coffee table. When would be a good time to pick it up?',
    createdAt: new Date(Date.now() - 60000 * 5), // 5 minutes ago
    user: {
      _id: 2,
      name: 'John Doe',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  },
  {
    _id: 2,
    text: 'Hello! I can be there tomorrow afternoon. Does that work for you?',
    createdAt: new Date(Date.now() - 60000 * 3), // 3 minutes ago
    user: {
      _id: 1, // Current user
      name: 'Current User',
    },
  },
  {
    _id: 3,
    text: 'Yes, that works perfectly!',
    createdAt: new Date(Date.now() - 60000 * 1), // 1 minute ago
    user: {
      _id: 2,
      name: 'John Doe',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  },
];

export default function ChatDetailScreen() {
  const { id: chatId, otherUser: otherUserString } = useLocalSearchParams<{ id: string, otherUser: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const currentUserId = user?.id || '1'; // Fallback for mock environment

  // Parse the otherUser object passed from the previous screen
  const otherUser = otherUserString ? JSON.parse(otherUserString) : null;

  useEffect(() => {
    // In a real app, you would fetch messages for `chatId` here.
    // For now, we use the mock data.
    setMessages(mockMessages);
  }, [chatId]);

  const handleSend = () => {
    if (inputText.trim().length === 0) {
      return;
    }

    const newMessage = {
      _id: Math.random().toString(),
      text: inputText,
      createdAt: new Date(),
      user: {
        _id: currentUserId,
        name: user?.fullName || 'Current User',
      },
    };

    setMessages(previousMessages => [newMessage, ...previousMessages]);
    setInputText('');
  };

  const renderMessageItem = ({ item }: { item: any }) => {
    const isCurrentUser = item.user._id === currentUserId;
    return (
      <View style={[styles.messageRow, isCurrentUser ? styles.sentRow : styles.receivedRow]}>
        <View style={[styles.messageBubble, isCurrentUser ? styles.sentBubble : styles.receivedBubble]}>
          <Text style={isCurrentUser ? styles.sentText : styles.receivedText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  const renderHeaderTitle = () => {
    if (!otherUser) {
      return null;
    }
    return (
      <View style={styles.headerTitleContainer}>
        <Image source={{ uri: otherUser.avatar }} style={styles.headerAvatar} />
        <View>
          <Text style={styles.headerName} numberOfLines={1}>
            {otherUser.fullName}
          </Text>
          <Text style={styles.headerStatus} numberOfLines={1}>
            @{otherUser.username}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          headerBackTitle: 'Messages',
          headerTitle: renderHeaderTitle,
        }}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item._id.toString()}
          style={styles.messagesList}
          inverted
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={Colors.text.tertiary}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Send size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  headerStatus: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  flex: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  sentRow: {
    justifyContent: 'flex-end',
  },
  receivedRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sentBubble: {
    backgroundColor: Colors.primary[600],
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  sentText: {
    color: Colors.white,
    fontSize: 15,
  },
  receivedText: {
    color: Colors.text.primary,
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
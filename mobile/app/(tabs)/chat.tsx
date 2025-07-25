import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Chat } from '../../types';

// Mock data
const mockChats: Chat[] = [
  {
    id: '1',
    participants: [
      {
        id: '1',
        username: 'current_user',
        fullName: 'Current User',
        email: 'current@example.com',
        dailyRequestLimit: 5,
        usedRequests: 3,
        createdAt: new Date(),
      },
      {
        id: '2',
        username: 'john_doe',
        fullName: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
        dailyRequestLimit: 5,
        usedRequests: 2,
        createdAt: new Date(),
      }
    ],
    lastMessage: {
      id: '1',
      chatId: '1',
      senderId: '2',
      sender: {
        id: '2',
        username: 'john_doe',
        fullName: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
        dailyRequestLimit: 5,
        usedRequests: 2,
        createdAt: new Date(),
      },
      content: 'Hi! I saw you\'re interested in the coffee table. When would be a good time to pick it up?',
      createdAt: new Date(),
      isRead: false,
    },
    updatedAt: new Date(),
  },
  {
    id: '2',
    participants: [
      {
        id: '1',
        username: 'current_user',
        fullName: 'Current User',
        email: 'current@example.com',
        dailyRequestLimit: 5,
        usedRequests: 3,
        createdAt: new Date(),
      },
      {
        id: '3',
        username: 'sarah_books',
        fullName: 'Sarah Johnson',
        email: 'sarah@example.com',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
        dailyRequestLimit: 5,
        usedRequests: 1,
        createdAt: new Date(),
      }
    ],
    lastMessage: {
      id: '2',
      chatId: '2',
      senderId: '1',
      sender: {
        id: '1',
        username: 'current_user',
        fullName: 'Current User',
        email: 'current@example.com',
        dailyRequestLimit: 5,
        usedRequests: 3,
        createdAt: new Date(),
      },
      content: 'Thank you so much for the books! My kids will love them.',
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      isRead: true,
    },
    updatedAt: new Date(Date.now() - 3600000),
  },
];

export default function ChatScreen() {
  const router = useRouter();

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find(p => p.id !== '1'); // Assuming current user ID is 1
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleChatPress = (chat: Chat) => {
    router.push(`/chat/${chat.id}`);
  };

  const renderChat = ({ item }: { item: Chat }) => {
    const otherUser = getOtherParticipant(item);
    if (!otherUser) return null;

    return (
      <TouchableOpacity 
        style={styles.chatItem} 
        onPress={() => handleChatPress(item)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
        
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.userName}>{otherUser.fullName}</Text>
            <Text style={styles.timestamp}>
              {item.lastMessage && formatTime(item.lastMessage.createdAt)}
            </Text>
          </View>
          
          {item.lastMessage && (
            <Text 
              style={[
                styles.lastMessage,
                !item.lastMessage.isRead && styles.unreadMessage
              ]} 
              numberOfLines={2}
            >
              {item.lastMessage.content}
            </Text>
          )}
        </View>
        
        {item.lastMessage && !item.lastMessage.isRead && (
          <View style={styles.unreadDot} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Stay connected with the community</Text>
      </View>

      <FlatList
        data={mockChats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        style={styles.chatsList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  chatsList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.gray[200],
  },
  chatContent: {
    flex: 1,
    marginLeft: 16,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  unreadMessage: {
    fontWeight: '500',
    color: Colors.text.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[600],
    marginLeft: 8,
  },
});
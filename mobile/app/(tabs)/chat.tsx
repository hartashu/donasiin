import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { Chat, User } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { AuthService } from "../../services/auth";
import { Button } from "../../components/ui/Button";

const API_BASE_URL = "http://localhost:3000/api";

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setUnreadMessagesCount } = useNotifications();

  const getOtherParticipant = (chat: Chat) => {
    if (!user) return null;
    return chat.participants.find((p) => p.id !== user.id);
  };

  const checkForNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const token = await AuthService.getStoredToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;

      const result = await response.json();
      const conversations = Array.isArray(result) ? result : result.data;
      if (!Array.isArray(conversations)) return;

      const unreadCount = conversations.filter(
        (c: any) =>
          c.lastMessageId &&
          !c.lastMessageIsRead &&
          c.lastMessageSenderId !== user.id
      ).length;
      setUnreadMessagesCount(unreadCount);
    } catch (e) {
      console.error("Failed to check for chat notifications:", e);
    }
  }, [user, setUnreadMessagesCount]);

  useEffect(() => {
    checkForNotifications();
  }, [checkForNotifications]);

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

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AuthService.getStoredToken();
      if (!token) {
        throw new Error("You must be logged in to view messages.");
      }

      const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch conversations.");
      }

      const result = await response.json();

      const conversations = Array.isArray(result) ? result : result.data;

      if (!Array.isArray(conversations)) {
        throw new Error("Unexpected response format from the server.");
      }

      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("Current user not found. Please log in again.");
      }

      const mappedChats: Chat[] = conversations.map((convo: any) => {
        const otherUser: User = {
          id: convo.otherUser._id,
          username: convo.otherUser.username || "unknown",
          fullName: convo.otherUser.fullName,
          email: "",
          avatarUrl:
            convo.otherUser.avatarUrl || "https://via.placeholder.com/150",
          dailyRequestLimit: 0,
          usedRequests: 0,
          createdAt: new Date(),
        };

        const participants: User[] = [currentUser, otherUser];

        let lastMessage = undefined;
        if (convo.lastMessageText) {
          const sender =
            participants.find((p) => p.id === convo.lastMessageSenderId) ||
            otherUser;
          lastMessage = {
            id: convo.lastMessageId || convo.conversationId,
            chatId: convo.conversationId,
            senderId: convo.lastMessageSenderId,
            sender: sender!,
            content: convo.lastMessageText,
            createdAt: new Date(convo.lastMessageAt),
            isRead: convo.lastMessageIsRead,
          };
        }

        return {
          id: convo.conversationId,
          participants,
          lastMessage,
          updatedAt: new Date(convo.lastMessageAt),
        };
      });

      setChats(mappedChats);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setUnreadMessagesCount(0);
      fetchConversations();
    }, [fetchConversations, setUnreadMessagesCount])
  );

  const handleChatPress = (chat: Chat) => {
    const otherUser = getOtherParticipant(chat);
    if (!otherUser) return;

    router.push({
      pathname: `/chat/${chat.id}`,
      params: { otherUser: JSON.stringify(otherUser) },
    });
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
        <Image source={{ uri: otherUser.avatarUrl }} style={styles.avatar} />

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
                !item.lastMessage.isRead &&
                item.lastMessage.senderId !== user?.id &&
                styles.unreadMessage,
              ]}
              numberOfLines={2}
            >
              {item.lastMessage.content}
            </Text>
          )}
        </View>

        {item.lastMessage &&
          !item.lastMessage.isRead &&
          item.lastMessage.senderId !== user?.id && (
            <View style={styles.unreadDot} />
          )}
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          size="large"
          color={Colors.primary[600]}
          style={styles.emptyContainer}
        />
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Try Again" onPress={fetchConversations} />
        </View>
      );
    }

    if (chats.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubText}>
            When you request an item or someone requests yours, your chat will
            appear here.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        style={styles.chatsList}
        showsVerticalScrollIndicator={false}
        onRefresh={fetchConversations}
        refreshing={isLoading}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      {renderContent()}
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
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  chatsList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
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
    fontWeight: "500",
    color: Colors.text.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[600],
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: Colors.error[600],
    textAlign: "center",
    marginBottom: 16,
  },
});

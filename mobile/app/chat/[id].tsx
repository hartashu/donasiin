import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Pusher from "pusher-js/react-native";
import { Colors } from "../../constants/Colors";
import { Send, ChevronLeft } from "lucide-react-native";
import { AuthService } from "../../services/auth";
import { API_BASE_URL } from "../../constants/api";

const PUSHER_KEY = "adc5a6ff5ffcda8b52f6";
const PUSHER_CLUSTER = "ap1";
const API_BASE = API_BASE_URL;

const formatMessageTime = (date: Date) => {
  if (!date || isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

type MessageType = {
  _id: string;
  tempId?: string;
  text: string;
  createdAt: Date;
  user: { _id: string };
};

export default function ChatDetailScreen() {
  const { id: chatId, otherUser: otherUserString } = useLocalSearchParams<{
    id: string;
    otherUser: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();
  const otherUser = otherUserString ? JSON.parse(otherUserString) : null;
  const currentUserId = user?.id!;

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      const token = await AuthService.getStoredToken();
      if (!token) throw new Error("Authentication required.");

      const res = await fetch(`${API_BASE}/chat/messages/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch messages.");

      const data = await res.json();
      const mapped: MessageType[] = data.map((m: any) => ({
        _id: m._id,
        text: m.text,
        createdAt: new Date(m.createdAt),
        user: { _id: m.senderId },
      }));
      // reverse so newest at top if inverted FlatList
      setMessages(mapped.reverse());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!chatId) return;

    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      forceTLS: true,
      authorizer: (channel) => {
        return {
          authorize: async (socketId, callback) => {
            try {
              const token = await AuthService.getStoredToken();
              const response = await fetch(`${API_BASE}/pusher/auth`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `socket_id=${socketId}&channel_name=${channel.name}`,
              });

              if (!response.ok) {
                throw new Error(`Pusher auth failed with status ${response.status}`);
              }

              const authData = await response.json();
              callback(null, authData);
            } catch (error) {
              callback(error as Error, null);
            }
          },
        };
      },
    });

    const channel = pusher.subscribe(chatId);

    channel.bind("messages:new", (data: any) => {
      setMessages((prev) => {
        // If real message already exists by _id, skip
        if (prev.find((m) => m._id === data._id)) return prev;

        // If there's an optimistic message with matching tempId, replace it
        if (data.tempId) {
          const replaced = prev.map((m) =>
            m.tempId && m.tempId === data.tempId
              ? {
                  _id: data._id,
                  text: data.text,
                  createdAt: new Date(data.createdAt),
                  user: { _id: data.senderId },
                }
              : m
          );
          // If replacement happened, return it
          if (replaced.some((m) => m._id === data._id)) return replaced;
        }

        // Fallback: avoid near-duplicate by same sender+text within few seconds if no tempId
        const maybeDuplicate = prev.find((m) => {
          if (m.user._id !== data.senderId) return false;
          if (m.text !== data.text) return false;
          const delta = Math.abs(new Date(m.createdAt).getTime() - new Date(data.createdAt).getTime());
          return delta < 5000; // 5 seconds
        });
        if (maybeDuplicate) return prev;

        // Otherwise, prepend new incoming message
        return [
          {
            _id: data._id,
            text: data.text,
            createdAt: new Date(data.createdAt),
            user: { _id: data.senderId },
          },
          ...prev,
        ];
      });
    });

    return () => {
      pusher.unsubscribe(chatId);
      pusher.disconnect();
    };
  }, [chatId]);

  const handleSend = async () => {
    if (!inputText.trim() || !otherUser) return;

    const textToSend = inputText;
    setInputText("");
    const tempId = `temp-${Math.random().toString(36).slice(2)}`;

    const optimisticMessage: MessageType = {
      _id: tempId,
      tempId,
      text: textToSend,
      createdAt: new Date(),
      user: { _id: currentUserId },
    };
    setMessages((prev) => [optimisticMessage, ...prev]);

    try {
      const token = await AuthService.getStoredToken();
      if (!token) throw new Error("Authentication required.");

      const res = await fetch(`${API_BASE}/chat/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: otherUser.id,
          text: textToSend,
          tempId, // include tempId for reconciliation
        }),
      });

      if (!res.ok) throw new Error("Failed to send message.");
      const saved = await res.json(); // Expect { _id, text, createdAt, senderId, tempId }

      // Replace optimistic message with real one if still present
      setMessages((prev) =>
        prev.map((m) =>
          m.tempId && m.tempId === saved.tempId
            ? {
                _id: saved._id,
                text: saved.text,
                createdAt: new Date(saved.createdAt),
                user: { _id: saved.senderId },
              }
            : m
        )
      );
    } catch (err: any) {
      // remove optimistic on failure
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      Alert.alert("Send Failed", err.message);
    }
  };

  const renderItem = ({ item }: { item: MessageType }) => {
    const isMe = item.user._id === currentUserId;
    return (
      <View style={[styles.messageRow, isMe ? styles.sentRow : styles.receivedRow]}>
        <View style={styles.messageContent}>
          <View style={[styles.messageBubble, isMe ? styles.sentBubble : styles.receivedBubble]}>
            <Text style={isMe ? styles.sentText : styles.receivedText}>{item.text}</Text>
          </View>
          <Text style={[styles.timestamp, isMe ? styles.sentTimestamp : styles.receivedTimestamp]}>
            {formatMessageTime(new Date(item.createdAt))}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeaderTitle = () =>
    otherUser && (
      <View style={styles.headerTitleContainer}>
        <Image source={{ uri: otherUser.avatarUrl }} style={styles.headerAvatar} />
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

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.primary[600]} />
          <Text style={styles.backButtonText}>Messages</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrapper}>{renderHeaderTitle()}</View>
        <View style={{ width: 90 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={60}
      >
        {loading ? (
          <ActivityIndicator style={styles.centered} size="large" />
        ) : error ? (
          <Text style={[styles.centered, styles.errorText]}>{error}</Text>
        ) : (
          <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item._id.toString()}
            inverted
            style={styles.messagesList}
          />
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message…"
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
  container: { flex: 1, backgroundColor: Colors.background },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  backButton: { flexDirection: "row", alignItems: "center", width: 90 },
  backButtonText: { marginLeft: 4, color: Colors.primary[600], fontSize: 17 },
  headerTitleWrapper: { flex: 1, alignItems: "center" },
  headerTitleContainer: { flexDirection: "row", alignItems: "center" },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 12 },
  headerName: { fontSize: 16, fontWeight: "600", color: Colors.text.primary },
  headerStatus: { fontSize: 12, color: Colors.text.secondary },
  flex: { flex: 1 },
  messagesList: { flex: 1, paddingHorizontal: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: Colors.error[600], fontSize: 16, textAlign: "center" },
  messageRow: { flexDirection: "row", marginVertical: 4 },
  messageContent: { maxWidth: "75%" },
  sentRow: { justifyContent: "flex-end" },
  receivedRow: { justifyContent: "flex-start" },
  messageBubble: { padding: 10, borderRadius: 20 },
  sentBubble: { backgroundColor: Colors.primary[600], borderBottomRightRadius: 4 },
  receivedBubble: { backgroundColor: Colors.surface, borderBottomLeftRadius: 4 },
  sentText: { color: Colors.white, fontSize: 15 },
  receivedText: { color: Colors.text.primary, fontSize: 15 },
  timestamp: { fontSize: 10, color: Colors.text.tertiary, marginTop: 4 },
  sentTimestamp: { textAlign: "right" },
  receivedTimestamp: { textAlign: "left" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderColor: Colors.border,
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
    justifyContent: "center",
    alignItems: "center",
  },
});

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
import { Colors } from "../../constants/Colors";
import { Send, ChevronLeft } from "lucide-react-native";
import { AuthService } from "../../services/auth";

const API_BASE_URL = "http://localhost:3000/api";

export default function ChatDetailScreen() {
  const { id: chatId, otherUser: otherUserString } = useLocalSearchParams<{
    id: string;
    otherUser: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = user?.id || "1"; // Fallback for mock environment

  // Parse the otherUser object passed from the previous screen
  const otherUser = otherUserString ? JSON.parse(otherUserString) : null;

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);
    setError(null);
    try {
      const token = await AuthService.getStoredToken();
      if (!token) throw new Error("Authentication required.");

      // Corrected URL to match the dynamic route on the server
      const response = await fetch(`${API_BASE_URL}/chat/messages/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages.");
      }
      const data = await response.json();

      // console.log("API response for messages:", data);

      // Map the API response to the format the UI expects
      const mappedMessages = data.map((msg: any) => ({
        _id: msg._id,
        text: msg.text,
        createdAt: new Date(msg.createdAt),
        user: {
          _id: msg.senderId,
        },
      }));

      // FlatList inverted expects data to be in reverse chronological order (newest first)
      setMessages(mappedMessages.reverse());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSend = async () => {
    if (inputText.trim().length === 0) {
      return;
    }
    if (!otherUser) return;

    // Keep a copy of the text to send, then clear the input for a responsive feel.
    const messageToSend = inputText;
    setInputText("");

    try {
      const token = await AuthService.getStoredToken();
      if (!token) throw new Error("Authentication required.");

      const response = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: otherUser.id, text: messageToSend }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            message: "An unknown error occurred on the server.",
          }));
        throw new Error(errorData.message || "Failed to send message.");
      }

      // On success, refetch all messages to ensure the list is up-to-date.
      await fetchMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
      // Show an error alert to the user
      // Restore the input text so the user doesn't lose their message
      setInputText(messageToSend);
      Alert.alert("Send Failed", (error as Error).message);
    }
  };

  const renderMessageItem = ({ item }: { item: any }) => {
    const isCurrentUser = item.user._id === currentUserId;
    return (
      <View
        style={[
          styles.messageRow,
          isCurrentUser ? styles.sentRow : styles.receivedRow,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.sentBubble : styles.receivedBubble,
          ]}
        >
          <Text style={isCurrentUser ? styles.sentText : styles.receivedText}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0} // Header is now part of the view
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
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.primary[600]} />
          <Text style={styles.backButtonText}>Messages</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrapper}>
          {renderHeaderTitle()}
        </View>
        <View style={{ width: 90 }} />{/* Spacer to balance the back button */}
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90, // Give it a fixed width to help with centering the title
  },
  backButtonText: {
    color: Colors.primary[600],
    fontSize: 17,
    marginLeft: 4,
  },
  headerTitleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: Colors.error[600],
    fontSize: 16,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
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
    flexDirection: "row",
    marginVertical: 4,
  },
  sentRow: {
    justifyContent: "flex-end",
  },
  receivedRow: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
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
    flexDirection: "row",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
  },
});

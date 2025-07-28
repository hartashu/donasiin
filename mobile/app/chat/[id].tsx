// mobile/app/(your-stack)/ChatDetailScreen.tsx

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

const PUSHER_KEY     = process.env.NEXT_PUBLIC_PUSHER_KEY!;
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;

// 1) Determine a host your device/emulator can reach:
const API_HOST = Platform.OS === "android"
  ? "http://10.0.2.2:3000"         // Android emulator
  : "http://192.168.68.57:3000";   // ← replace with your Mac/PC LAN IP
const API_BASE = `${API_HOST}/api`; // don’t include `/api` twice

export default function ChatDetailScreen() {
  const { id: chatId, otherUser: otherUserString } =
    useLocalSearchParams<{ id: string; otherUser: string }>();
  const router    = useRouter();
  const { user }  = useAuth();
  const otherUser = otherUserString ? JSON.parse(otherUserString) : null;
  const currentUserId = user?.id!;

  const [messages, setMessages]   = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // 2) Load history
  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    setLoading(true); setError(null);
    try {
      const token = await AuthService.getStoredToken();
      if (!token) throw new Error("Authentication required.");

      const res = await fetch(`${API_BASE}/chat/messages/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch messages.");
      const data = await res.json();

      const mapped = data.map((m: any) => ({
        _id:       m._id,
        text:      m.text,
        createdAt: new Date(m.createdAt),
        user:      { _id: m.senderId },
      }));
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

  // 3) Real‑time subscription
  useEffect(() => {
    if (!chatId) return;
    let pusher: Pusher;

    (async () => {
      const token = await AuthService.getStoredToken();
      if (!token) {
        console.warn("No auth token; real‑time disabled.");
        return;
      }

      Pusher.logToConsole = true;

      pusher = new Pusher(PUSHER_KEY, {
        cluster:      PUSHER_CLUSTER,
        forceTLS:     true,
        disableStats: true,
        authEndpoint: `${API_BASE}/pusher/auth`,
        auth: {
          headers: { Authorization: `Bearer ${token}` },
        },
      });

      pusher.connection.bind("connected", () =>
        console.log("🔌 Pusher connected")
      );
      pusher.connection.bind("error", (err: any) =>
        console.error("❌ Pusher error", err)
      );

      const channelName = `private-conversation-${chatId}`;
      const channel     = pusher.subscribe(channelName);

      channel.bind("pusher:subscription_succeeded", () =>
        console.log(`✅ Subscribed to ${channelName}`)
      );
      channel.bind("pusher:subscription_error", (status: any) =>
        console.error(`❌ Subscription error: ${status}`)
      );

      channel.bind("new-message", (data: any) => {
        console.log("📨 new-message:", data);
        const incoming = {
          _id:       data._id,
          text:      data.text,
          createdAt: new Date(data.createdAt),
          user:      { _id: data.senderId },
        };
        setMessages(prev =>
          prev.some(m => m._id === incoming._id)
            ? prev
            : [incoming, ...prev]
        );
      });
    })();

    return () => {
      if (pusher) {
        pusher.unsubscribe(`private-conversation-${chatId}`);
        pusher.disconnect();
      }
    };
  }, [chatId]);

  // 4) Send new message
  const handleSend = async () => {
    if (!inputText.trim() || !otherUser) return;
    const toSend = inputText;
    setInputText("");
    try {
      const token = await AuthService.getStoredToken();
      if (!token) throw new Error("Authentication required.");

      const res = await fetch(`${API_BASE}/chat/messages`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          Authorization:   `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: otherUser.id, text: toSend }),
      });
      const newMsg = await res.json();
      if (!res.ok) throw new Error(newMsg.message || "Send failed");

      setMessages(prev => [
        {
          _id:       newMsg._id,
          text:      newMsg.text,
          createdAt: new Date(newMsg.createdAt),
          user:      { _id: newMsg.senderId },
        },
        ...prev,
      ]);
    } catch (err: any) {
      console.error("Send failed:", err);
      setInputText(toSend);
      Alert.alert("Send Failed", err.message);
    }
  };

  // 5) Render
  const renderItem = ({ item }: { item: any }) => {
    const isMe = item.user._id === currentUserId;
    return (
      <View style={[
        styles.messageRow,
        isMe ? styles.sentRow : styles.receivedRow
      ]}>
        <View style={[
          styles.messageBubble,
          isMe ? styles.sentBubble : styles.receivedBubble
        ]}>
          <Text style={isMe ? styles.sentText : styles.receivedText}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) return (
      <ActivityIndicator
        style={styles.centered}
        size="large"
        color={Colors.primary[600]}
      />
    );
    if (error) return (
      <Text style={[styles.centered, styles.errorText]}>{error}</Text>
    );
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={item => item._id.toString()}
          inverted
          style={styles.messagesList}
        />
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
    );
  };

  const renderHeaderTitle = () =>
    otherUser && (
      <View style={styles.headerTitleContainer}>
        <Image
          source={{ uri: otherUser.avatarUrl }}
          style={styles.headerAvatar}
        />
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
    <SafeAreaView style={styles.container} edges={["top","left","right"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.customHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={Colors.primary[600]} />
          <Text style={styles.backButtonText}>Messages</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrapper}>
          {renderHeaderTitle()}
        </View>
        <View style={{ width: 90 }} />
      </View>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:            { flex:1, backgroundColor:Colors.background },
  customHeader:         {
    flexDirection:      "row",
    alignItems:         "center",
    justifyContent:     "space-between",
    padding:            8,
    borderBottomWidth:  1,
    borderColor:        Colors.border,
  },
  backButton:           { flexDirection:"row", alignItems:"center", width:90 },
  backButtonText:       { marginLeft:4, color:Colors.primary[600], fontSize:17 },
  headerTitleWrapper:   { flex:1, alignItems:"center" },
  headerTitleContainer: { flexDirection:"row", alignItems:"center" },
  headerAvatar:         { width:32, height:32, borderRadius:16, marginRight:12 },
  headerName:           { fontSize:16, fontWeight:"600", color:Colors.text.primary },
  headerStatus:         { fontSize:12, color:Colors.text.secondary },

  flex:                 { flex:1 },
  messagesList:         { flex:1, paddingHorizontal:16 },
  centered:             { flex:1, justifyContent:"center", alignItems:"center" },
  errorText:            { color:Colors.error[600], fontSize:16 },

  messageRow:           { flexDirection:"row", marginVertical:4 },
  sentRow:              { justifyContent:"flex-end" },
  receivedRow:          { justifyContent:"flex-start" },
  messageBubble:        { maxWidth:"75%", padding:10, borderRadius:20 },
  sentBubble:           { backgroundColor:Colors.primary[600], borderBottomRightRadius:4 },
  receivedBubble:       { backgroundColor:Colors.surface, borderBottomLeftRadius:4 },
  sentText:             { color:Colors.white, fontSize:15 },
  receivedText:         { color:Colors.text.primary, fontSize:15 },

  inputContainer:       {
    flexDirection:      "row",
    alignItems:         "center",
    padding:            12,
    borderTopWidth:     1,
    borderColor:        Colors.border,
  },
  textInput:            {
    flex:               1,
    backgroundColor:    Colors.surface,
    borderRadius:       20,
    paddingHorizontal:  16,
    paddingVertical:    10,
    fontSize:           15,
    maxHeight:          100,
    marginRight:        12,
  },
  sendButton:           {
    width:              44,
    height:             44,
    borderRadius:       22,
    backgroundColor:    Colors.primary[600],
    justifyContent:     "center",
    alignItems:         "center",
  },
});

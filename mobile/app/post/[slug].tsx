// mobile/app/(your-stack)/PostDetailScreen.tsx
import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { DonationPost } from "../../types";
import {
  MessageSquare,
  ChevronLeft,
  MapPin,
  Sparkles,
} from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import { AuthService } from "../../services/auth";
import { Button } from "../../components/ui/Button";
const API_BASE_URL = "http://localhost:3000/api";
const { width } = Dimensions.get("window");

const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)}y ago`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)}mo ago`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)}d ago`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)}h ago`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)}m ago`;
  return `${Math.floor(seconds)}s ago`;
};

export default function PostDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [post, setPost] = useState<DonationPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchPostDetails = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const token = await AuthService.getStoredToken();
      const [postRes, requestsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/posts/${slug}`),
        token
          ? fetch(`${API_BASE_URL}/users/me/requests`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve(null),
      ]);

      if (!postRes.ok) {
        if (postRes.status === 404) throw new Error("Post not found.");
        throw new Error("Failed to fetch post details.");
      }
      const { data: apiPost } = await postRes.json();

      let requestedByMe = false;
      if (requestsRes && requestsRes.ok) {
        const requestsJson = await requestsRes.json();
        requestedByMe = (requestsJson.data || []).some((req: any) => req.postId === apiPost._id);
      }

      setPost({
        id: apiPost._id,
        slug: apiPost.slug,
        title: apiPost.title,
        description: apiPost.description,
        images: apiPost.imageUrls || [],
        tags: [apiPost.category.toLowerCase()],
        ownerId: apiPost.author._id,
        owner: {
          id: apiPost.author._id,
          username: apiPost.author.username,
          fullName: apiPost.author.fullName,
          avatarUrl:
            apiPost.author.avatarUrl || "https://via.placeholder.com/150",
          address: apiPost.author.address,
          email: "",
          dailyRequestLimit: 0,
          usedRequests: 0,
          createdAt: new Date(),
        },
        isAvailable: apiPost.isAvailable,
        aiAnalysis: apiPost.aiAnalysis,
        createdAt: new Date(apiPost.createdAt),
        updatedAt: new Date(apiPost.updatedAt),
        isRequested: requestedByMe,
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPostDetails();
  }, [fetchPostDetails]);

  const handleRequestItem = () => {
    if (!post) return;
    Alert.alert(
      "Confirm Request",
      `Are you sure you want to request "${post.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Request", onPress: submitRequest },
      ]
    );
  };
  const submitRequest = async () => {
    if (!post) return;
    setIsRequesting(true);
    try {
      const token = await AuthService.getStoredToken();
      if (!token) throw new Error("You must be logged in to request an item.");
      const res = await fetch(`${API_BASE_URL}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: post.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to submit request.");
      setPost(prev => prev ? { ...prev, isRequested: true } : null);
      Alert.alert(
        "Request Sent!",
        "Your request has been sent to the owner. You can check its status in your history.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err: any) {
      if (err.message.includes("logged in")) {
        Alert.alert("Login Required", err.message, [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => router.push("/(auth)/login") },
        ]);
      } else {
        Alert.alert("Error", err.message);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleStartChat = async () => {
    if (!post?.owner) return;
    setIsStartingChat(true);
    try {
      const token = await AuthService.getStoredToken();
      if (!token) {
        Alert.alert(
          "Login Required",
          "You must be logged in to start a chat.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Login", onPress: () => router.push("/(auth)/login") },
          ]
        );
        return;
      }
      const res = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: post.owner.id,
          text: `Hi, I'm interested in your donation: "${post.title}"`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to start chat.");
      router.push({
        pathname: `/chat/${json.conversationId}`,
        params: { otherUser: JSON.stringify(post.owner) },
      });
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setIsStartingChat(false);
    }
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }, []);
  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const headerLeft = useCallback(
    () => (
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft size={24} color={Colors.white} />
      </TouchableOpacity>
    ),
    [router]
  );
  const screenOptions = useMemo(
    () => ({
      headerShown: true,
      headerTransparent: true,
      headerTitle: "",
      headerLeft,
      headerLeftContainerStyle: { paddingTop: Math.max(insets.top, 16) },
    }),
    [headerLeft, insets.top]
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </SafeAreaView>
    );
  }
  if (error || !post) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error || "Unknown error."}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const isOwner = user?.id === post.ownerId;

  return (
    <>
      <Stack.Screen options={screenOptions} />
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={styles.imageWrapper}
      >
        <FlatList
          data={post.images}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.headerImage} />
          )}
          keyExtractor={(_, i) => `${i}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
        {post.images.length > 1 && (
          <View style={styles.paginationContainer}>
            {post.images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.paginationDot,
                  i === activeIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </SafeAreaView>

      <SafeAreaView
        edges={["left", "right", "bottom"]}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{post.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.tagBox}>
              <Text style={styles.tag}>{post.tags[0]}</Text>
            </View>
            <Text style={styles.metaText}>
              • Posted {formatDistanceToNow(post.createdAt)}
            </Text>
          </View>
          <View style={styles.separator} />

          <View style={styles.ownerInfo}>
            <Image
              source={{ uri: post.owner.avatarUrl }}
              style={styles.ownerAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.ownerName}>{post.owner.fullName}</Text>
              <Text style={styles.ownerUsername}>@{post.owner.username}</Text>
              {post.owner.address && (
                <View style={styles.addressRow}>
                  <MapPin size={14} color={Colors.text.secondary} />
                  <Text style={styles.addressText}>{post.owner.address}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.separator} />

          {post.aiAnalysis && (
            <>
              <View style={styles.sectionHeader}>
                <Sparkles size={20} color={Colors.primary[600]} />
                <Text style={styles.sectionTitle}>AI Carbon Analysis</Text>
              </View>
              <Text style={styles.description}>{post.aiAnalysis}</Text>
              <View style={styles.separator} />
            </>
          )}

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{post.description}</Text>
        </ScrollView>

        <View style={styles.footer}>
          {!user ? (
            <Button
              title="Login to Request or Chat"
              onPress={() => router.push("/(auth)/login")}
            />
          ) : isOwner ? (
            <Text style={styles.ownerNotice}>
              You are the owner of this item.
            </Text>
          ) : (
            <>
              <Button
                title="Chat"
                onPress={handleStartChat}
                loading={isStartingChat}
                variant="outline"
                icon={<MessageSquare size={18} color={Colors.primary[600]} />}
                style={{ flex: 1, marginRight: 8 }}
                disabled={isRequesting || isStartingChat || !post.isAvailable}
              />
              <Button
                title={post.isRequested ? "Requested" : "Request Item"}
                onPress={handleRequestItem}
                loading={isRequesting}
                style={{ flex: 1 }}
                disabled={!post.isAvailable || isRequesting || isStartingChat || post.isRequested}
              />
            </>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  imageWrapper: { backgroundColor: Colors.background },
  headerImage: { width, height: width * 0.8, resizeMode: "cover" },
  paginationContainer: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: { backgroundColor: Colors.white },

  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  tagBox: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tag: {
    color: Colors.primary[700],
    fontWeight: "600",
    textTransform: "capitalize",
  },
  metaText: { fontSize: 14, color: Colors.text.secondary },
  separator: { height: 1, backgroundColor: Colors.border, marginVertical: 24 },

  ownerInfo: { flexDirection: "row", alignItems: "flex-start" },
  ownerAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 16 },
  ownerName: { fontSize: 18, fontWeight: "600", color: Colors.text.primary },
  ownerUsername: { fontSize: 14, color: Colors.text.secondary },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  addressText: { fontSize: 14, color: Colors.text.secondary, flexShrink: 1 },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  description: { fontSize: 16, lineHeight: 24, color: Colors.text.secondary },

  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "rgba(0,0,0,0.4)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    flex: 1,
    textAlign: "center",
    color: Colors.error[600],
    fontSize: 16,
    marginTop: 20,
  },
  ownerNotice: {
    flex: 1,
    textAlign: "center",
    color: Colors.text.secondary,
    fontStyle: "italic",
  },
});

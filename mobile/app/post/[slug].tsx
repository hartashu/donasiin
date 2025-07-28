// mobile/app/(your-stack)/PostDetailScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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

const { width } = Dimensions.get("window");
const API_BASE_URL = "http://localhost:3000/api";

const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000; // years
  if (interval > 1) return `${Math.floor(interval)}y ago`;
  interval = seconds / 2592000; // months
  if (interval > 1) return `${Math.floor(interval)}mo ago`;
  interval = seconds / 86400; // days
  if (interval > 1) return `${Math.floor(interval)}d ago`;
  interval = seconds / 3600; // hours
  if (interval > 1) return `${Math.floor(interval)}h ago`;
  interval = seconds / 60; // minutes
  if (interval > 1) return `${Math.floor(interval)}m ago`;
  return `${Math.floor(seconds)}s ago`;
};

export default function PostDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [post, setPost] = useState<DonationPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const { user } = useAuth();

  // Fetch post details from backend
  const fetchPostDetails = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${slug}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Post not found.");
        throw new Error("Failed to fetch post details.");
      }
      const { data: apiPost } = await res.json();
      setPost({
        id: apiPost._id,
        slug: apiPost.slug,
        title: apiPost.title,
        description: apiPost.description,
        images: [apiPost.thumbnailUrl, ...(apiPost.imageUrls || [])].filter(
          Boolean
        ),
        tags: [apiPost.category.toLowerCase()],
        ownerId: apiPost.author._id,
        owner: {
          id: apiPost.author._id,
          username: apiPost.author.username,
          fullName: apiPost.author.fullName,
          avatar: apiPost.author.avatarUrl || "https://via.placeholder.com/150",
          address: apiPost.author.address,
          email: "",
          dailyRequestLimit: 0,
          usedRequests: 0,
          createdAt: new Date(),
        },
        isAvailable: apiPost.isAvailable,
        createdAt: new Date(apiPost.createdAt),
        updatedAt: new Date(apiPost.updatedAt),
        aiAnalysis: apiPost.aiAnalysis,
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

  // Ask for confirmation before sending the request
  const handleRequestItem = () => {
    if (!post) return;
    Alert.alert(
      "Confirm Request",
      `Are you sure you want to request "${post.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Request", onPress: () => submitRequest() },
      ]
    );
  };

  // Submit the request to your /requests endpoint
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
      const responseData = await res.json();
      console.log("Response Data:", responseData);
      
      if (!res.ok) throw new Error(responseData.message || "Failed to submit request.");

      Alert.alert(
        "Request Sent!",
        "Your request has been sent to the owner. You can check its status in your history.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err: any) {
      if (err.message.includes("You must be logged in")) {
        Alert.alert("Login Required", err.message, [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => router.push("/(auth)/login") },
        ]);
      } else {
        Alert.alert("Error", err.message || "An unexpected error occurred.");
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleStartChat = async () => {
    if (!post || !post.owner) return;
    setIsStartingChat(true);
    try {
      const token = await AuthService.getStoredToken();
      if (!token) {
        Alert.alert("Login Required", "You must be logged in to start a chat.", [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => router.push("/(auth)/login") },
        ]);
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

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to start chat.");
      }

      router.push({
        pathname: `/chat/${result.conversationId}`,
        params: { otherUser: JSON.stringify(post.owner) },
      });
    } catch (err: any) {
      Alert.alert("Error", err.message || "An unexpected error occurred.");
    } finally {
      setIsStartingChat(false);
    }
  };

  // Custom back button over the image
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
      headerTransparent: true,
      headerTitle: "",
      headerLeft,
      headerLeftContainerStyle: {
        paddingTop: Math.max(insets.top, 16),
      },
    }),
    [headerLeft, insets.top]
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (!post) return null;

  const isOwner = user?.id === post.ownerId;

  // Main UI
  return (
    <>
      {/* 1) Full-bleed image + transparent header */}
      <SafeAreaView edges={["top", "left", "right"]} style={styles.imageContainer}>
        <Stack.Screen options={screenOptions} />
        <Image source={{ uri: post.images[0] }} style={styles.headerImage} />
      </SafeAreaView>

      {/* 2) Scrollable details + footer */}
      <SafeAreaView edges={["left", "right", "bottom"]} style={styles.container}>
        <View style={styles.flexGrow}>
          <ScrollView
            style={styles.flexGrow}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>{post.title}</Text>
            <View style={styles.metaContainer}>
              <View style={styles.tagContainer}>
                <Text style={styles.tag}>{post.tags[0]}</Text>
              </View>
              <Text style={styles.metaText}>•</Text>
              <Text style={styles.metaText}>
                Posted {formatDistanceToNow(post.createdAt)}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.ownerInfo}>
              <Image source={{ uri: post.owner.avatar }} style={styles.ownerAvatar} />
              <View>
                <Text style={styles.ownerName}>{post.owner.fullName}</Text>
                <Text style={styles.ownerUsername}>@{post.owner.username}</Text>
                {post.owner.address && (
                  <View style={styles.addressContainer}>
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
                onPress={() => router.push('/(auth)/login')}
              />
            ) : isOwner ? (
              <Text style={styles.ownerNotice}>You are the owner of this item.</Text>
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
                  title="Request Item"
                  onPress={handleRequestItem}
                  loading={isRequesting}
                  style={{ flex: 1, marginLeft: 8 }}
                  disabled={!post.isAvailable || isRequesting || isStartingChat}
                />
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  imageContainer: { backgroundColor: Colors.background },
  flexGrow: { flex: 1 },

  headerImage: {
    width,
    height: width * 0.8,
    resizeMode: "cover",
  },

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
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  tagContainer: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  tag: {
    color: Colors.primary[700],
    fontWeight: "600",
    textTransform: "capitalize",
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  ownerUsername: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  addressText: {
    fontSize: 14,
    color: Colors.text.secondary,
    flexShrink: 1, // Allow text to wrap
  },
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
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.secondary,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    flexDirection: 'row',
    alignItems: 'center',
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
    textAlign: 'center',
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
});

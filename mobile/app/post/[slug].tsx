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
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { DonationPost } from "../../types";
import { MessageSquare, ChevronLeft } from "lucide-react-native";
import { Button } from "../../components/ui/Button";

const { width } = Dimensions.get("window");
const API_BASE_URL = "http://localhost:3000/api";

// Make sure your app is wrapped in a SafeAreaProvider (e.g. in app/_layout.tsx):
// <SafeAreaProvider><Stack screenOptions={{ headerShown: false }}/></SafeAreaProvider>

export default function PostDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [post, setPost] = useState<DonationPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        images: [apiPost.thumbnailUrl, ...(apiPost.imageUrls||[])].filter(Boolean),
        tags: [apiPost.category.toLowerCase()],
        ownerId: apiPost.author._id,
        owner: {
          id: apiPost.author._id,
          username: apiPost.author.username,
          fullName: apiPost.author.fullName,
          avatar: apiPost.author.avatarUrl || "https://via.placeholder.com/150",
          email: "",
          dailyRequestLimit: 0,
          usedRequests: 0,
          createdAt: new Date(),
        },
        isAvailable: apiPost.isAvailable,
        createdAt: new Date(apiPost.createdAt),
        updatedAt: new Date(apiPost.updatedAt),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPostDetails();
  }, [fetchPostDetails]);

  const handleRequestItem = () =>
    Alert.alert("Request Item", "This feature is coming soon!");

  // Put the back button over the image
  const headerLeft = useCallback(() => (
    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
      <ChevronLeft size={24} color={Colors.white} />
    </TouchableOpacity>
  ), [router]);

  const screenOptions = useMemo(() => ({
    headerTransparent: true,
    headerTitle: "",
    headerLeft,
    headerLeftContainerStyle: {
      paddingTop: Math.max(insets.top, 16),
    },
  }), [headerLeft, insets.top]);

  // ─── Loading ─────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary[600]} />
      </SafeAreaView>
    );
  }

  // ─── Error ───────────────────────────
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (!post) return null;

  // ─── Main UI ──────────────────────────
  return (
    <>
      {/* 1) The image + transparent header under the safe area */}
      <SafeAreaView
        edges={["top","left","right"]}     // respect top inset for image
        style={styles.imageContainer}
      >
        <Stack.Screen options={screenOptions}/>
        <Image source={{ uri: post.images[0] }} style={styles.headerImage}/>
      </SafeAreaView>

      {/* 2) Details + footer, filling the rest of the screen */}
      <SafeAreaView
        edges={["left","right","bottom"]}
        style={styles.container}
      >
        <View style={styles.flexGrow}>
          <ScrollView
            style={styles.flexGrow}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>{post.title}</Text>
            <View style={styles.tagContainer}>
              <Text style={styles.tag}>{post.tags[0]}</Text>
            </View>
            <View style={styles.separator}/>
            <View style={styles.ownerInfo}>
              <Image source={{ uri: post.owner.avatar }} style={styles.ownerAvatar}/>
              <View>
                <Text style={styles.ownerName}>{post.owner.fullName}</Text>
                <Text style={styles.ownerUsername}>@{post.owner.username}</Text>
              </View>
            </View>
            <View style={styles.separator}/>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{post.description}</Text>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Request Item"
              icon={<MessageSquare size={18} color={Colors.white}/>}
              onPress={handleRequestItem}
              disabled={!post.isAvailable}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: Colors.background },
  imageContainer: { backgroundColor: Colors.background },
  flexGrow: { flex:1 },

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
  tagContainer: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 16,
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
    alignItems: "center",
    marginBottom: 24,
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

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 12,
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
    flex:1,
    textAlign:"center",
    color: Colors.error[600],
    fontSize:16,
    marginTop:20,
  },
});

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Search, ArrowUp, ArrowDown, Plus } from "lucide-react-native";
import { Colors } from "../../constants/Colors";
import { Input } from "../../components/ui/Input";
import { DonationCard } from "../../components/DonationCard";
import { DonationPost } from "../../types";
import { useNotifications } from "../../context/NotificationContext";
import { AuthService } from "../../services/auth";

const API_BASE_URL = "http://localhost:3000/api";

const categories = [
  { label: "All", value: "All" },
  { label: "Baby & Kids", value: "baby-kids" },
  { label: "Books, Music & Media", value: "books-music-media" },
  { label: "Electronics", value: "electronics" },
  { label: "Fashion & Apparel", value: "fashion-apparel" },
  { label: "Health & Beauty", value: "health-beauty" },
  { label: "Sports & Outdoors", value: "sports-outdoors" },
  { label: "Automotive & Tools", value: "automotive-tools" },
  { label: "Pet Supplies", value: "pet-supplies" },
  { label: "Office Supplies & Stationery", value: "office-supplies-stationery" },
  { label: "Home & Kitchen", value: "home-kitchen" },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [rawPosts, setRawPosts] = useState<DonationPost[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setNewPostsCount } = useNotifications();

  const router = useRouter();
  const insets = useSafeAreaInsets();

  // This function will ONLY be used to calculate the initial badge count.
  const checkForNotifications = useCallback(async () => {
    try {
      // Fetch all posts without filters just for the count
      const res = await fetch(`${API_BASE_URL}/posts`);
      if (!res.ok) return;
      const result = await res.json();
      const posts = result.data.posts || [];

      const twentyFourHoursAgo = new Date().getTime() - 24 * 60 * 60 * 1000;
      const newPostsCount = posts.filter(
        (p: any) => new Date(p.createdAt).getTime() > twentyFourHoursAgo
      ).length;
      setNewPostsCount(newPostsCount);
    } catch (e) {
      // Silently fail on notification check error
      console.error("Failed to check for post notifications:", e);
    }
  }, [setNewPostsCount]);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AuthService.getStoredToken();
      
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory !== "All")
        params.append("category", selectedCategory);

      const [postsResponse, requestsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/posts?${params.toString()}`),
        token
          ? fetch(`${API_BASE_URL}/users/me/requests`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve(null),
      ]);

      if (!postsResponse.ok) {
        const err = await postsResponse
          .json()
          .catch(() => ({ message: "Failed to fetch posts." }));
        throw new Error(err.message || "Unknown error.");
      }

      let requestedIds = new Set<string>();
      if (requestsResponse && requestsResponse.ok) {
        const requestsJson = await requestsResponse.json();
        const userRequests = requestsJson.data || [];
        requestedIds = new Set(userRequests.map((req: any) => req.postId));
      }

      const result = await postsResponse.json();
      const mapped = result.data.posts.map((p: any) => ({
        id: p._id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        images: [p.thumbnailUrl, ...(p.imageUrls || [])].filter(Boolean),
        tags: [p.category.toLowerCase()],
        ownerId: p.userId,
        owner: {
          id: p.author._id,
          username: p.author.username,
          fullName: p.author.fullName,
          email: p.author.email || "",
          address: p.author.address,
          avatarUrl: p.author.avatarUrl || "https://via.placeholder.com/150",
          dailyRequestLimit: 0,
          usedRequests: 0,
          createdAt: new Date(p.author.createdAt || Date.now()),
        },
        isAvailable: p.isAvailable,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        isRequested: requestedIds.has(p._id),
      }));
      setRawPosts(mapped);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  const sortedPosts = useMemo(() => {
    return [...rawPosts].sort((a, b) => {
      const dateA = a.createdAt.getTime();
      const dateB = b.createdAt.getTime();
      if (sortOrder === "newest") {
        return dateB - dateA;
      }
      return dateA - dateB;
    });
  }, [rawPosts, sortOrder]);

  // Check for notifications only once when the component mounts
  useEffect(() => {
    checkForNotifications();
  }, [checkForNotifications]);

  useFocusEffect(
    useCallback(() => {
      // When the screen is focused, clear the badge and fetch posts.
      setNewPostsCount(0);

      const handler = setTimeout(fetchPosts, 500);
      return () => clearTimeout(handler);
    }, [searchQuery, selectedCategory, fetchPosts, setNewPostsCount])
  );

  const handlePostPress = (post: DonationPost) =>
    router.push(`/post/${post.slug}`);
  const handleCreatePost = () => router.push("/create-post");
  const handleSortToggle = () =>
    setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));

  // Renderers for empty/error/loading
  const renderEmpty = () => (
    <View style={styles.centered}>
      <Text style={styles.emptyText}>No items found.</Text>
      <Text style={styles.emptySubText}>
        Try adjusting your search or filters.
      </Text>
    </View>
  );
  const renderError = () => (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity onPress={fetchPosts} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
  const renderLoading = () => (
    <ActivityIndicator
      size="large"
      color={Colors.primary[600]}
      style={styles.centered}
    />
  );

  // Final FlatList for normal state
  const renderList = () => (
    <FlatList
      data={sortedPosts}
      renderItem={({ item }) => (
        <DonationCard post={item} onPress={() => handlePostPress(item)} />
      )}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      onRefresh={fetchPosts}
      refreshing={isLoading}
      contentContainerStyle={[
        styles.postsContent,
        { paddingBottom: insets.bottom + 16 },
      ]}
      style={styles.postsList}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../../assets/logo2.png")} style={styles.logo} />
        <TouchableOpacity
          onPress={handleCreatePost}
          style={styles.createButton}
        >
          <Plus color={Colors.primary[600]} size={24} />
        </TouchableOpacity>
      </View>

      {/* Search + Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search
            color={Colors.text.tertiary}
            size={20}
            style={styles.searchIcon}
          />
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for items..."
            style={styles.searchInput}
            containerStyle={styles.searchInputWrapper}
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={handleSortToggle}
        >
          {sortOrder === "newest" ? (
            <ArrowDown color={Colors.primary[600]} size={20} />
          ) : (
            <ArrowUp color={Colors.primary[600]} size={20} />
          )}
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScrollView}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[
              styles.categoryButton,
              selectedCategory === cat.value && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(cat.value)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.value && styles.categoryTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {isLoading && rawPosts.length === 0
        ? renderLoading()
        : error
          ? renderError()
          : !isLoading && rawPosts.length === 0
            ? renderEmpty()
            : renderList()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logo: {
    width: 190,
    height: 60,
    resizeMode: "contain",
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 16,
    top: 14,
    zIndex: 1,
  },
  searchInputWrapper: {
    marginBottom: 0,
  },
  searchInput: {
    paddingLeft: 48,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesScrollView: {
    marginBottom: 16,
    flexGrow: 0,
  },
  categoriesContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  postsList: {
    flex: 1,
  },
  postsContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error[600],
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary[600],
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: "600",
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
  },
});

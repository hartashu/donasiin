import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
} from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, ArrowUp, ArrowDown, Plus } from "lucide-react-native";
import { Colors } from "../../constants/Colors";
import { Input } from "../../components/ui/Input";
import { DonationCard } from "../../components/DonationCard";
import { DonationPost } from "../../types";
import { useNotifications } from "../../context/NotificationContext";
import { AuthService } from "../../services/auth";
import { API_BASE_URL } from "../../constants/api";

const categories = [
  { label: "All", value: "All" },
  { label: "Automotive & Tools", value: "automotive-tools" },
  { label: "Baby & Kids", value: "baby-kids" },
  { label: "Books, Music & Media", value: "books-music-media" },
  { label: "Electronics", value: "electronics" },
  { label: "Fashion & Apparel", value: "fashion-apparel" },
  { label: "Health & Beauty", value: "health-beauty" },
  { label: "Home & Kitchen", value: "home-kitchen" },
  { label: "Office Supplies & Stationery", value: "office-supplies-stationery" },
  { label: "Pet Supplies", value: "pet-supplies" },
  { label: "Sports & Outdoors", value: "sports-outdoors" },
];

export default function HomeScreen(): JSX.Element {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest">("newest");

  const [rawPosts, setRawPosts] = React.useState<DonationPost[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isFetchingMore, setIsFetchingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { setNewPostsCount } = useNotifications();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    console.log("[badge] fetching initial badge count");
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/posts`);
        if (!res.ok) return;
        const json = await res.json();
        const cutoff = Date.now() - 60 * 1000;
        const count = (json.data.posts as any[])
          .filter((p) => new Date(p.createdAt).getTime() > cutoff).length;
        console.log("[badge] newPostsCount =", count);
        setNewPostsCount(count);
      } catch (e) {
        console.error("[badge] error", e);
      }
    })();
  }, [setNewPostsCount]);

  const fetchPosts = async (reset = false) => {
    console.log(`[fetchPosts] called reset=${reset}, page=${page}`);
    if (isFetchingMore && !reset) {
      console.log("[fetchPosts] already loading more—skip");
      return;
    }
    const fetchPage = reset ? 1 : page;
    if (!reset && fetchPage > totalPages) {
      console.log("[fetchPosts] no more pages:", fetchPage, totalPages);
      return;
    }

    if (reset) {
      if (page > 1) {
        console.log("[fetchPosts] pull-to-refresh");
        setIsRefreshing(true);
      } else {
        console.log("[fetchPosts] initial load");
        setIsLoading(true);
      }
    } else {
      console.log("[fetchPosts] loading more page", fetchPage);
      setIsFetchingMore(true);
    }
    setError(null);

    try {
      const token = await AuthService.getStoredToken();
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory !== "All")
        params.append("category", selectedCategory);
      params.append("page", fetchPage.toString());

      console.log("[fetchPosts] GET /posts?" + params.toString());
      const res = await fetch(`${API_BASE_URL}/posts?${params}`);
      console.log("[fetchPosts] status", res.status);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ message: "Error" }));
        throw new Error(errJson.message || "Failed to fetch");
      }
      const json = await res.json();
      const { posts, totalPages: tp } = json.data as { posts: any[]; totalPages: number };

      console.log(`[fetchPosts] got ${posts.length} items, totalPages=${tp}`);
      setTotalPages(tp ?? 1);

      const incoming: DonationPost[] = posts.map((p) => ({
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
          avatarUrl: p.author.avatarUrl,
          dailyRequestLimit: 0,
          usedRequests: 0,
          createdAt: new Date(p.author.createdAt),
        },
        isAvailable: p.isAvailable,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        isRequested: false,
      }));

      if (reset) {
        console.log("[fetchPosts] reset list with", incoming.length, "items");
        setRawPosts(incoming);
        setPage(2);
      } else {
        console.log("[fetchPosts] appending", incoming.length, "items");
        setRawPosts((prev) => {
          const ids = new Set(prev.map((x) => x.id));
          const filtered = incoming.filter((x) => !ids.has(x.id));
          console.log("[fetchPosts] deduped count:", filtered.length);
          return [...prev, ...filtered];
        });
        setPage((prev) => prev + 1);
      }
    } catch (err: any) {
      console.error("[fetchPosts] error", err);
      setError(err.message);
    } finally {
      console.log("[fetchPosts] done—clearing flags");
      setIsLoading(false);
      setIsRefreshing(false);
      setIsFetchingMore(false);
    }
  };

  React.useEffect(() => {
    console.log("[filters effect] reset load");
    setPage(1);
    fetchPosts(true);
  }, [searchQuery, selectedCategory]);

  const sortedPosts = React.useMemo(
    () => [...rawPosts].sort((a, b) =>
      sortOrder === "newest"
        ? b.createdAt.getTime() - a.createdAt.getTime()
        : a.createdAt.getTime() - b.createdAt.getTime()
    ),
    [rawPosts, sortOrder]
  );

  const onEndReached = () => {
    console.log("[FlatList] onEndReached");
    if (!isFetchingMore && !isLoading && page <= totalPages) {
      fetchPosts(false);
    }
  };
  const onRefresh = () => {
    console.log("[FlatList] onRefresh");
    setPage(1);
    fetchPosts(true);
  };
  const toggleSort = () => {
    console.log("[UI] toggle sortOrder from", sortOrder);
    setSortOrder((o) => (o === "newest" ? "oldest" : "newest"));
  };

  const renderItem = ({ item, index }: ListRenderItemInfo<DonationPost>) => (
    <Animated.View entering={SlideInDown.duration(400).delay(index * 30)}>
      <DonationCard post={item} onPress={() => router.push(`/post/${item.slug}`)} />
    </Animated.View>
  );
  const renderFooter = () =>
    isFetchingMore ? (
      <ActivityIndicator size="small" color={Colors.primary[600]} style={{ margin: 12 }} />
    ) : null;

  const renderLoading = () => (
    <ActivityIndicator size="large" color={Colors.primary[600]} style={styles.centered} />
  );
  const renderError = () => (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity onPress={() => fetchPosts(true)} style={styles.retryButton}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
  const renderEmpty = () => (
    <View style={styles.centered}>
      <Text style={styles.emptyText}>No items found.</Text>
      <Text style={styles.emptySubText}>Try adjusting filters.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Animated.View entering={FadeIn.duration(300)}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={require("../../assets/logo2.png")} style={styles.logo} />
          <TouchableOpacity onPress={() => router.push("/create-post")} style={styles.createButton}>
            <Plus color={Colors.white} size={22} />
          </TouchableOpacity>
        </View>

        {/* Search & Sort */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search color={Colors.text.tertiary} size={20} style={styles.searchIcon} />
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for items..."
              style={styles.searchInput}
              containerStyle={styles.searchInputWrapper}
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={toggleSort}>
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
              onPress={() => {
                console.log("[UI] setCategory", cat.value);
                setSelectedCategory(cat.value);
              }}
              style={[
                styles.categoryButton,
                selectedCategory === cat.value && styles.categoryButtonActive,
              ]}
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
      </Animated.View>

      {/* Content */}
      {isLoading && rawPosts.length === 0 ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : sortedPosts.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={sortedPosts}
          renderItem={renderItem}
          keyExtractor={(p) => p.id}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary[600]} />
          }
          contentContainerStyle={[styles.postsContent, { paddingBottom: insets.bottom + 16 }]}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  logo: { width: 190, height: 55, resizeMode: "contain" },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[600],
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  searchInputContainer: { flex: 1, position: "relative" },
  searchIcon: { position: "absolute", left: 16, top: 14, zIndex: 1 },
  searchInputWrapper: { marginBottom: 0 },
  searchInput: { paddingLeft: 48, backgroundColor: Colors.gray[100], borderColor: "transparent" },
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
  categoriesScrollView: { paddingVertical: 16, flexGrow: 0 },
  categoriesContainer: { flexDirection: "row", paddingHorizontal: 24, gap: 12 },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary[1000],
    borderColor: Colors.primary[500],
    shadowColor: Colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryText: { fontSize: 14, fontWeight: "600", color: Colors.text.secondary },
  categoryTextActive: { color: Colors.primary[500] },
  postsContent: { paddingHorizontal: 24 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  errorText: { fontSize: 16, color: Colors.error[600], textAlign: "center", marginBottom: 16 },
  retryButton: { backgroundColor: Colors.primary[600], padding: 12, borderRadius: 8 },
  retryButtonText: { color: Colors.white, fontWeight: "600" },
  emptyText: { fontSize: 18, fontWeight: "600", color: Colors.text.primary, marginBottom: 8 },
  emptySubText: { fontSize: 14, color: Colors.text.secondary },
});

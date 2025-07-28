import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Search, Filter, Plus } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Input } from '../../components/ui/Input';
import { DonationCard } from '../../components/DonationCard';
import { DonationPost } from '../../types'; // Assuming types/index.ts exists

const API_BASE_URL = 'http://localhost:3000/api';

const categories = [
'All',
'Baby & Kids',
'Books, Music & Media',
'Electronics',
'Fashion & Apparel',
'Health & Beauty',
'Sports & Outdoors',
'Automotive & Tools',
'Pet Supplies',
'Office Supplies & Stationery',
'Home & Kitchen'
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [posts, setPosts] = useState<DonationPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'All') params.append('category', selectedCategory);

      const response = await fetch(`${API_BASE_URL}/posts?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch posts. Please try again later.' }));
        throw new Error(errorData.message || 'An unknown error occurred.');
      }
      const result = await response.json();
      
      // Map API data to the DonationPost type used by the component
      const mappedPosts = result.data.posts.map((post: any) => ({
        id: post._id,
        slug: post.slug,
        title: post.title,
        description: post.description,
        images: [post.thumbnailUrl, ...(post.imageUrls || [])].filter(Boolean), // Ensure no null/undefined URLs
        tags: [post.category.toLowerCase()],
        ownerId: post.userId,
        owner: {
          id: post.author._id,
          username: post.author.username,
          fullName: post.author.fullName,
          email: post.author.email || '',
          avatarUrl: post.author.avatarUrl || 'https://via.placeholder.com/150',
          dailyRequestLimit: 0,
          usedRequests: 0,
          createdAt: new Date(post.author.createdAt || Date.now()),
        },
        isAvailable: post.isAvailable,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      }));

      setPosts(mappedPosts);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useFocusEffect(
    useCallback(() => {
      // This effect runs when the screen comes into focus, and also when search/category changes.
      // A simple debounce is used to prevent API calls on every keystroke.
      const handler = setTimeout(() => {
        fetchPosts();
      }, 500); // 500ms delay

      // Cleanup the timeout if the screen loses focus or dependencies change
      return () => clearTimeout(handler);
    }, [searchQuery, selectedCategory, fetchPosts])
  );

  const handlePostPress = (post: DonationPost) => {
    router.push(`/post/${post.slug}`);
  };

  const handleCreatePost = () => {
    router.push('/create-post');
  };

  const renderPost = ({ item }: { item: DonationPost }) => (
    <DonationCard post={item} onPress={() => handlePostPress(item)} />
  );

  const renderContent = () => {
    if (isLoading && posts.length === 0) { // Only show full-screen loader on initial load
      return <ActivityIndicator size="large" color={Colors.primary[600]} style={styles.centered} />;
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchPosts()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!isLoading && posts.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No items found.</Text>
          <Text style={styles.emptySubText}>Try adjusting your search or filters.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        style={styles.postsList}
        contentContainerStyle={styles.postsContent}
        showsVerticalScrollIndicator={false}
        // Add pull-to-refresh functionality
        onRefresh={fetchPosts}
        refreshing={isLoading}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Donasiin</Text>
        <TouchableOpacity onPress={handleCreatePost} style={styles.createButton}>
          <Plus color={Colors.primary[600]} size={24} />
        </TouchableOpacity>
      </View>

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
        <TouchableOpacity style={styles.filterButton}>
          <Filter color={Colors.primary[600]} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScrollView}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesScrollView: {
    marginBottom: 16,
    flexGrow: 0, // Prevent ScrollView from taking up all available space
  },
  categoriesContainer: {
    flexDirection: 'row',
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
    fontWeight: '500',
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
    paddingBottom: 16,
    flexGrow: 1, // Ensures the container can grow to fill space for centered content
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error[600],
    textAlign: 'center',
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
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});
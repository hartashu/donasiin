import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Filter, Plus } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Input } from '../../components/ui/Input';
import { DonationCard } from '../../components/DonationCard';
import { DonationPost } from '../../types';

// Mock data
const mockPosts: DonationPost[] = [
  {
    id: '1',
    title: 'Vintage Wooden Coffee Table',
    description: 'Beautiful handcrafted coffee table in excellent condition',
    images: ['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400'],
    tags: ['furniture', 'vintage', 'wood'],
    ownerId: '1',
    owner: {
      id: '1',
      username: 'john_doe',
      fullName: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
      dailyRequestLimit: 5,
      usedRequests: 2,
      createdAt: new Date(),
    },
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Children\'s Books Collection',
    description: 'A wonderful collection of children\'s books suitable for ages 3-8',
    images: ['https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400'],
    tags: ['books', 'children', 'education'],
    ownerId: '2',
    owner: {
      id: '2',
      username: 'sarah_books',
      fullName: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
      dailyRequestLimit: 5,
      usedRequests: 1,
      createdAt: new Date(),
    },
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const categories = ['All', 'Furniture', 'Books', 'Electronics', 'Clothing', 'Kitchen', 'Kids'];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const router = useRouter();

  const filteredPosts = useMemo(() => {
    let posts = mockPosts;

    // Filter by category
    if (selectedCategory !== 'All') {
      posts = posts.filter(post =>
        post.tags.includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      posts = posts.filter(post => post.title.toLowerCase().includes(lowercasedQuery) || post.description.toLowerCase().includes(lowercasedQuery));
    }

    return posts;
  }, [searchQuery, selectedCategory]);

  const handlePostPress = (post: DonationPost) => {
    router.push(`/post/${post.id}`);
  };

  const handleCreatePost = () => {
    router.push('/create-post');
  };

  const renderPost = ({ item }: { item: DonationPost }) => (
    <DonationCard post={item} onPress={() => handlePostPress(item)} />
  );

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

      <View style={styles.categoriesContainer}>
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
      </View>

      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        style={styles.postsList}
        contentContainerStyle={styles.postsContent}
        showsVerticalScrollIndicator={false}
      />
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
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
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
  },
});
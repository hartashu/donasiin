// File: mobile/app/(tabs)/profile.tsx

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Settings,
  CreditCard as Edit,
  LogOut,
  MessageCircle,
} from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/auth';

const API_BASE_URL = 'http://localhost:3000/api';

type MyPostSummary = {
  id: string;
  title: string;
  thumbnailUrl: string;
  slug: string;
};

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();
  const [myPosts, setMyPosts] = useState<MyPostSummary[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const fetchMyPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const token = await AuthService.getStoredToken();
      if (!token) {
        setMyPosts([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/me/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch your posts.");
      }

      const result = await response.json();
      const postsData = result.data || [];

      setMyPosts(
        postsData.map((post: any) => ({
          id: post._id,
          title: post.title,
          thumbnailUrl: post.thumbnailUrl,
          slug: post.slug,
        }))
      );
    } catch (error) {
      console.error("Error fetching user's posts:", error);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  // Call fetchMyPosts whenever this screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchMyPosts();
    }, [fetchMyPosts])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        </View>
      </SafeAreaView>
    );
  }
  console.log(user);
  
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContainer}>
          <Text style={styles.loggedOutText}>You are not logged in.</Text>
          <Button
            title="Go to Login"
            onPress={() => router.push('/(auth)/login')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.settingsButton}
            // onPress={handleSettings}
          >
            <Settings color={Colors.text.secondary} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  user.avatarUrl ||
                  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
              }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.editAvatarButton}
              // onPress={handleEditProfile}
            >
              <Edit color={Colors.white} size={16} />
            </TouchableOpacity>
          </View>

          <Text style={styles.fullName}>{user.fullName}</Text>
          <Text style={styles.username}>@{user.username}</Text>

          {/* <View style={styles.actionButtons}>
            <Button
              title="Edit Profile"
              onPress={handleEditProfile}
              variant="outline"
              style={styles.editButton}
            />
            <TouchableOpacity style={styles.messageButton}>
              <MessageCircle color={Colors.primary[600]} size={20} />
            </TouchableOpacity>
          </View> */}
        </View>
        {/* <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Items Donated</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Items Received</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4.9</Text>
            <Text style={styles.statLabel}>C02 Saved</Text>
          </View>
        </View> */}

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          {/* <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Daily Request Limit</Text>
            <Text style={styles.infoValue}>
              {user.usedRequests} / {user.dailyRequestLimit} used today
            </Text>
          </View> */}
          {user.address && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{user.address}</Text>
            </View>
          )}
        </View>

        <View style={styles.myItemsSection}>
          <Text style={styles.sectionTitle}>My Available Items</Text>
          {postsLoading ? (
            <ActivityIndicator color={Colors.primary[600]} />
          ) : myPosts.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {myPosts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.postCard}
                  onPress={() => router.push(`/post/${post.slug}`)}
                >
                  <Image
                    source={{ uri: post.thumbnailUrl }}
                    style={styles.postImage}
                  />
                  <Text
                    style={styles.postTitle}
                    numberOfLines={2}
                  >
                    {post.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                You haven't posted any items yet.
              </Text>
              <Button
                title="Create Your First Post"
                onPress={() => router.push('/create-post')}
                variant="outline"
                size="sm"
              />
            </View>
          )}
        </View>

        <View style={styles.logoutSection}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loggedOutText: {
    fontSize: 18,
    color: Colors.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.gray[200],
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  fullName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    paddingHorizontal: 24,
  },
  messageButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary[600],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  infoSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  infoItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  myItemsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  postCard: {
    width: 140,
    marginRight: 16,
  },
  postImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    backgroundColor: Colors.gray[200],
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  emptyState: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  logoutSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  logoutButton: {
    borderColor: Colors.error[500],
  },
  logoutButtonText: {
    color: Colors.error[500],
  },
});

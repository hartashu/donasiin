import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { DonationRequest } from '../../types';
import { Clock, CircleCheck as CheckCircle, Truck, Circle as XCircle } from 'lucide-react-native';

// Mock data
const mockRequests: DonationRequest[] = [
  {
    id: '1',
    postId: '1',
    post: {
      id: '1',
      title: 'Vintage Wooden Coffee Table',
      description: 'Beautiful handcrafted coffee table',
      images: ['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=400'],
      tags: ['furniture'],
      ownerId: '2',
      owner: {
        id: '2',
        username: 'john_doe',
        fullName: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
        dailyRequestLimit: 5,
        usedRequests: 2,
        createdAt: new Date(),
      },
      isAvailable: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    requesterId: '1',
    requester: {
      id: '1',
      username: 'current_user',
      fullName: 'Current User',
      email: 'current@example.com',
      dailyRequestLimit: 5,
      usedRequests: 3,
      createdAt: new Date(),
    },
    status: 'shipped',
    trackingCode: 'TR123456789',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    postId: '2',
    post: {
      id: '2',
      title: 'Children\'s Books Collection',
      description: 'A wonderful collection of children\'s books',
      images: ['https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400'],
      tags: ['books'],
      ownerId: '3',
      owner: {
        id: '3',
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
    requesterId: '1',
    requester: {
      id: '1',
      username: 'current_user',
      fullName: 'Current User',
      email: 'current@example.com',
      dailyRequestLimit: 5,
      usedRequests: 3,
      createdAt: new Date(),
    },
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function RequestsScreen() {
  const getStatusIcon = (status: DonationRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock color={Colors.warning[500]} size={20} />;
      case 'accepted':
        return <CheckCircle color={Colors.success[500]} size={20} />;
      case 'shipped':
        return <Truck color={Colors.primary[500]} size={20} />;
      case 'rejected':
        return <XCircle color={Colors.error[500]} size={20} />;
      default:
        return <Clock color={Colors.gray[500]} size={20} />;
    }
  };

  const getStatusColor = (status: DonationRequest['status']) => {
    switch (status) {
      case 'pending':
        return Colors.warning[500];
      case 'accepted':
        return Colors.success[500];
      case 'shipped':
        return Colors.primary[500];
      case 'rejected':
        return Colors.error[500];
      default:
        return Colors.gray[500];
    }
  };

  const renderRequest = ({ item }: { item: DonationRequest }) => (
    <TouchableOpacity style={styles.requestCard}>
      <Image source={{ uri: item.post.images[0] }} style={styles.postImage} />
      
      <View style={styles.requestContent}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {item.post.title}
        </Text>
        
        <View style={styles.ownerInfo}>
          <Image source={{ uri: item.post.owner.avatar }} style={styles.ownerAvatar} />
          <Text style={styles.ownerName}>@{item.post.owner.username}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
        
        {item.status === 'shipped' && item.trackingCode && (
          <View style={styles.trackingContainer}>
            <Text style={styles.trackingLabel}>Tracking:</Text>
            <Text style={styles.trackingCode}>{item.trackingCode}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Requests</Text>
        <Text style={styles.subtitle}>Track your donation requests</Text>
      </View>

      <FlatList
        data={mockRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        style={styles.requestsList}
        contentContainerStyle={styles.requestsContent}
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  requestsList: {
    flex: 1,
  },
  requestsContent: {
    padding: 24,
  },
  requestCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
  },
  postImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.gray[200],
  },
  requestContent: {
    flex: 1,
    marginLeft: 16,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ownerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  ownerName: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginRight: 4,
  },
  trackingCode: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary[600],
  },
});
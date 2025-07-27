import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { DonationRequest } from '../../types';
import { Clock, CheckCircle, Truck, XCircle, X } from 'lucide-react-native';
import { AuthService } from '../../services/auth';
import { Button } from '../../components/ui/Button';

const API_BASE_URL = 'http://localhost:3000/api';

export default function RequestsScreen() {
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AuthService.getStoredToken();
      if (!token) {
        throw new Error("You must be logged in to view your requests.");
      }

      const response = await fetch(`${API_BASE_URL}/users/me/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch requests.");
      }

      const result = await response.json();
      const currentUser = await AuthService.getCurrentUser();

      const mappedRequests = result.data.map((item: any): DonationRequest => ({
        id: item._id,
        postId: item.postId,
        status: item.status.toLowerCase(),
        trackingCode: item.trackingCode,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt || item.createdAt),
        requesterId: item.userId,
        requester: currentUser!, // We know the user is logged in
        post: {
          id: item.postDetails._id,
          slug: item.postDetails.slug,
          title: item.postDetails.title,
          images: [item.postDetails.thumbnailUrl].filter(Boolean),
          // NOTE: The API for requests doesn't provide full post details.
          // We use placeholders for data not provided.
          description: 'Loading description...',
          tags: [],
          isAvailable: true,
          ownerId: 'unknown',
          owner: {
            id: 'unknown',
            username: 'loading...',
            fullName: 'Loading...',
            email: '',
            avatar: 'https://via.placeholder.com/150',
            dailyRequestLimit: 0,
            usedRequests: 0,
            createdAt: new Date(),
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }));

      setRequests(mappedRequests);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [fetchRequests])
  );

  const handleDeleteRequest = (requestId: string) => {
    Alert.alert(
      "Delete Request",
      "Are you sure you want to delete this request? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => proceedWithDeletion(requestId),
        },
      ]
    );
  };

  const proceedWithDeletion = async (requestId: string) => {
    try {
      const token = await AuthService.getStoredToken();
      if (!token) {
        throw new Error("Authentication is required to delete a request.");
      }

      // NOTE: Assuming a DELETE /api/requests/:id endpoint exists.
      const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to delete request." }));
        throw new Error(errorData.message || "Failed to delete request.");
      }

      setRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
      Alert.alert("Success", "The request has been successfully deleted.");
    } catch (error: any) {
      Alert.alert("Deletion Failed", error.message || "An unexpected error occurred.");
    }
  };

  const getStatusIcon = (status: DonationRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock color={Colors.warning[500]} size={20} />;
      case 'accepted':
        return <CheckCircle color={Colors.success[500]} size={20} />;
      case 'shipped':
        return <Truck color={Colors.primary[500]} size={20} />;
      case 'completed':
        return <CheckCircle color={Colors.success[700]} size={20} />;
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
      case 'completed':
        return Colors.success[700];
      case 'rejected':
        return Colors.error[500];
      default:
        return Colors.gray[500];
    }
  };

  const handleRequestPress = (item: DonationRequest) => {
    router.push(`/post/${item.post.slug}`);
  };
  const renderRequest = ({ item }: { item: DonationRequest }) => (
    <TouchableOpacity style={styles.requestCard} onPress={() => handleRequestPress(item)}>
      <Image source={{ uri: item.post.images[0] }} style={styles.postImage} />

      <View style={styles.requestContent}>
        <View style={styles.requestHeader}>
          <Text style={styles.postTitle} numberOfLines={2}>
            {item.post.title}
          </Text>
          <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleDeleteRequest(item.id); }} style={styles.deleteButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X color={Colors.text.tertiary} size={16} />
          </TouchableOpacity>
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

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={Colors.primary[600]} style={styles.centered} />;
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Try Again" onPress={fetchRequests} />
        </View>
      );
    }

    if (requests.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>You haven't made any requests yet.</Text>
          <Text style={styles.emptySubText}>Find an item you like and request it!</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        style={styles.requestsList}
        contentContainerStyle={styles.requestsContent}
        showsVerticalScrollIndicator={false}
        onRefresh={fetchRequests}
        refreshing={isLoading}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Requests</Text>
      </View>
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  postTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginRight: 8,
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
  deleteButton: {
    padding: 4,
  },
});
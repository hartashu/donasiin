import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { Colors } from "../../constants/Colors";
import { DonationRequest } from "../../types";
import { Clock, CheckCircle, XCircle, X, Sparkles } from "lucide-react-native";
import { AuthService } from "../../services/auth";
import { Button } from "../../components/ui/Button";


const API_BASE_URL = "http://localhost:3000/api";

const MAX_TRACKING_LENGTH = 50;

// This is a local type for this screen to handle the `isOutgoing` flag
// and the simplified `post` object that comes from the API.
type DisplayRequest = Omit<DonationRequest, 'post' | 'requester'> & {
  isOutgoing: boolean;
  post: {
    id: string;
    slug: string;
    title: string;
    images: string[];
  };
};

export default function RequestsScreen() {
  const [requests, setRequests] = useState<DisplayRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [ocrLoadingId, setOcrLoadingId] = useState<string | null>(null);
  const [trackingCodes, setTrackingCodes] = useState<Record<string, string>>(
    {}
  );
  const [viewMode, setViewMode] = useState<"outgoing" | "incoming">("outgoing");
  const router = useRouter();

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AuthService.getStoredToken();
      if (!token) throw new Error("You must be logged in.");
      // verify user for auth flow
      await AuthService.getCurrentUser();

      const [outRes, inRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/me/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/users/me/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!outRes.ok || !inRes.ok) throw new Error("Failed to fetch requests.");

      const outJson = await outRes.json();
      const inJson = await inRes.json();

      const mappedOut: DisplayRequest[] = (outJson.data || [])
        .filter((i: any) => i.postDetails)
        .map((i: any) => ({
          id: i._id,
          postId: i.postId,
          status: i.status.toLowerCase(),
          trackingCode: i.trackingCode ?? "",
          createdAt: new Date(i.createdAt),
          updatedAt: new Date(i.updatedAt || i.createdAt),
          requesterId: i.userId,
          isOutgoing: true,
          post: {
            id: i.postDetails._id,
            slug: i.postDetails.slug,
            title: i.postDetails.title,
            images: [i.postDetails.thumbnailUrl].filter(Boolean),
          },
        }));

      const mappedIn: DisplayRequest[] = [];
      (inJson.data || []).forEach((post: any) => {
        (post.requests || []).forEach((req: any) => {
          if (req.requester) {
            mappedIn.push({
              id: req._id,
              postId: post._id,
              status: req.status.toLowerCase(),
              trackingCode: req.trackingCode ?? "",
              createdAt: new Date(req.createdAt),
              updatedAt: new Date(req.updatedAt || req.createdAt),
              requesterId: req.requester._id,
              isOutgoing: false,
              post: {
                id: post._id,
                slug: post.slug,
                title: post.title,
                images: [post.thumbnailUrl].filter(Boolean),
              },
            });
          }
        });
      });

      // combine & sort
      setRequests(
        [...mappedOut, ...mappedIn].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refetch data every time the screen comes into focus
  useFocusEffect(useCallback(() => { fetchRequests() }, [fetchRequests]));

  const patchRequest = async (id: string, body: any) => {
    const token = await AuthService.getStoredToken();
    if (!token) throw new Error("Auth required.");
    const resp = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.message || "Update failed.");
    return json;
  };

  const handleShip = async (id: string) => {
    const code = trackingCodes[id]?.trim();
    if (!code) {
      Alert.alert("Validation", "Please enter a tracking code.");
      return;
    }
    setUpdatingId(id);
    try {
      await patchRequest(id, { status: "SHIPPED", trackingCode: code });
      setRequests((rs) =>
        rs.map((r) =>
          r.id === id ? { ...r, status: "shipped", trackingCode: code } : r
        )
      );
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAction = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    setUpdatingId(id);
    try {
      await patchRequest(id, { status });
      setRequests(rs =>
        rs.map(r => (r.id === id ? { ...r, status: status.toLowerCase() as DonationRequest['status'] } : r))
      );
      Alert.alert('Success', `Request has been ${status.toLowerCase()}.`);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOcrScan = async (requestId: string) => {
    setOcrLoadingId(requestId);
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need photo library access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (result.canceled || !result.assets.length) return;

      const image = result.assets[0];
      const formData = new FormData();
      const uriParts = image.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('receiptImage', {
        uri: image.uri,
        name: image.fileName ?? `scan.${fileType}`,
        type: image.type ?? `image/${fileType}`,
      } as any);
      formData.append('requestId', requestId);
      
      const token = await AuthService.getStoredToken();
      const res = await fetch(`${API_BASE_URL}/ocr-ai`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "OCR failed.");

      setTrackingCodes((c) => ({ ...c, [requestId]: json.trackingNumber }));
      Alert.alert("Success", "Tracking code auto‑filled!");
    } catch (e: any) {
      Alert.alert("Scan Error", e.message);
    } finally {
      setOcrLoadingId(null);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Request",
      "Are you sure you want to permanently delete this request? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AuthService.getStoredToken();
              if (!token) throw new Error("Authentication required.");

              const response = await fetch(`${API_BASE_URL}/requests/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!response.ok) throw new Error("Failed to delete request.");

              setRequests((prev) => prev.filter((req) => req.id !== id));
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const getStatusIcon = (status: DonationRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Clock color={Colors.warning[500]} size={20} />;
      case "accepted":
      case "completed":
        return (
          <CheckCircle
            color={Colors.success[status === "completed" ? 700 : 500]}
            size={20}
          />
        );
      case "rejected":
        return <XCircle color={Colors.error[500]} size={20} />;
      default:
        return <Clock color={Colors.gray[500]} size={20} />;
    }
  };

  const getStatusColor = (status: DonationRequest["status"]) => {
    switch (status) {
      case "pending":
        return Colors.warning[500];
      case "accepted":
        return Colors.success[500];
      case "completed":
        return Colors.success[700];
      case "rejected":
        return Colors.error[500];
      default:
        return Colors.gray[500];
    }
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const renderItem = ({ item }: { item: DisplayRequest }) => {
    const incoming = !item.isOutgoing;
    return (
      <View style={styles.card}>
        {item.post.images?.[0] ? (
          <Image source={{ uri: item.post.images[0] }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.title} numberOfLines={2}>
              {item.post.title}
            </Text>
            {item.isOutgoing && item.status === "pending" && (
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
              >
                <X color={Colors.text.tertiary} size={16} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.row}>
            {getStatusIcon(item.status)}
            <Text
              style={[styles.status, { color: getStatusColor(item.status) }]}
            >
              {capitalize(item.status)}
            </Text>
          </View>

          {incoming && item.status === 'pending' && (
            <View style={styles.actionRow}>
              <Button
                title="Reject"
                onPress={() => handleAction(item.id, 'REJECTED')}
                variant="outline"
                size="sm"
                style={{ flex: 1, marginRight: 8 }}
                disabled={!!updatingId}
                loading={updatingId === item.id}
              />
              <Button
                title="Accept"
                onPress={() => handleAction(item.id, 'ACCEPTED')}
                size="sm"
                style={{ flex: 1 }}
                disabled={!!updatingId}
                loading={updatingId === item.id}
              />
            </View>
          )}

          {incoming && item.status === "accepted" && (
            <View style={styles.shipRow}>
              <TextInput
                placeholder="Tracking code"
                value={trackingCodes[item.id] || ""}
                onChangeText={(t) =>
                  setTrackingCodes((c) => ({ ...c, [item.id]: t }))
                }
                style={styles.input}
                maxLength={MAX_TRACKING_LENGTH}
              />

              <TouchableOpacity
                style={styles.ocrButton}
                onPress={() => handleOcrScan(item.id)}
                disabled={!!ocrLoadingId}
              >
                {ocrLoadingId === item.id ? (
                  <ActivityIndicator size="small" color={Colors.primary[600]} />
                ) : (
                  <Sparkles size={20} color={Colors.primary[600]} />
                )}
              </TouchableOpacity>

              <Button
                title="Submit"
                onPress={() => handleShip(item.id)}
                loading={updatingId === item.id}
                disabled={!trackingCodes[item.id]?.trim()}
                size="sm"
                style={styles.btnShip}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  const displayed = requests.filter((r) =>
    viewMode === "outgoing" ? r.isOutgoing : !r.isOutgoing
  );

  const renderContent = () => {
    if (isLoading)
      return (
        <ActivityIndicator
          style={styles.centered}
          size="large"
          color={Colors.primary[600]}
        />
      );
    if (error)
      return (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <Button title="Retry" onPress={fetchRequests} />
        </View>
      );
    if (!displayed.length)
      return (
        <View style={styles.centered}>
          <Text style={styles.empty}>
            {viewMode === "outgoing"
              ? "You haven't made any requests yet."
              : "No one has requested your items yet."}
          </Text>
        </View>
      );
    return (
      <FlatList
        data={displayed}
        renderItem={renderItem}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Requests</Text>
      <View style={styles.tabsContainer}>
        {(["outgoing", "incoming"] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[styles.tab, viewMode === mode && styles.tabActive]}
            onPress={() => setViewMode(mode)}
          >
            <Text
              style={[
                styles.tabText,
                viewMode === mode && styles.tabTextActive,
              ]}
            >
              {mode === "outgoing" ? "My Requests" : "Incoming"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    fontSize: 24,
    fontWeight: "700",
    padding: 16,
    color: Colors.text.primary,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  tabActive: { borderColor: Colors.primary[600] },
  tabText: { fontSize: 16, color: Colors.text.secondary },
  tabTextActive: { color: Colors.primary[600], fontWeight: "600" },
  list: { paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 },
  card: {
    flexDirection: "row",
    marginVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: { width: 80, height: 80 },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.border,
  },
  placeholderText: { fontSize: 12, color: Colors.text.secondary },
  content: { flex: 1, padding: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginRight: 8,
  },
  status: { fontSize: 14, fontWeight: "600", marginLeft: 6 },
  shipRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  actionRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Platform.OS === "ios" ? 12 : 8,
    marginRight: 8,
  },
  ocrButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
  },
  btnShip: {},
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: Colors.error[600], marginBottom: 12 },
  empty: { color: Colors.text.secondary },
});

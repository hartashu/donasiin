import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  TextInput,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "../constants/Colors";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { AuthService } from "../services/auth";
import { Plus, X, CheckCircle, Send } from "lucide-react-native";
import { User } from "../types";
const MAX_IMAGES = 5;
const categories = [
  "Baby & Kids",
  "Books, Music & Media",
  "Electronics",
  "Fashion & Apparel",
  "Health & Beauty",
  "Sports & Outdoors",
  "Automotive & Tools",
  "Pet Supplies",
  "Office Supplies & Stationery",
  "Home & Kitchen",
];

type Asset = { uri: string; fileName?: string; type?: string };
const API_BASE_URL = "http://localhost:3000/api";

export default function CreatePostScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [itemImages, setItemImages] = useState<Asset[]>([]);
  const [loadingPick, setLoadingPick] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [postSuccessData, setPostSuccessData] = useState<{
    slug: string;
    message: string;
    title: string;
  } | null>(null);
  const [recommendations, setRecommendations] = useState<User[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const router = useRouter();

  const fetchRecommendations = async (slug: string) => {
    setLoadingRecs(true);
    try {
      const token = await AuthService.getStoredToken();
      if (!token)
        throw new Error("Authentication required for recommendations.");
      const res = await fetch(`${API_BASE_URL}/posts/${slug}/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("result", res);

      const json = await res.json();
      console.log("result json", json);

      if (!res.ok)
        throw new Error(json.error || "Failed to fetch recommendations.");
      // The API returns an array of users with `_id`. We need to map it to our `User` type.
      const mappedRecs: User[] = (json.data || []).map((rec: any) => ({
        id: rec._id, // Map _id to id
        username: rec.username,
        fullName: rec.fullName,
        avatarUrl: rec.avatarUrl,
        address: rec.address, // This might be undefined, which is fine as it's optional
        // Add other required fields from User type with default values
        email: rec.email || "",
        dailyRequestLimit: 0,
        usedRequests: 0,
        createdAt: new Date(),
      }));
      setRecommendations(mappedRecs);
    } catch (err: any) {
      Alert.alert("Recommendation Error", err.message);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleImagePick = async () => {
    setLoadingPick(true);
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "We need photo access to pick images!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      console.log("🎨 picker result:", result);
      if (result.canceled) return;

      const picks: Asset[] =
        Array.isArray((result as any).assets) &&
        (result as any).assets.length > 0
          ? (result as any).assets.map((a: any) => ({
              uri: a.uri,
              fileName: a.fileName,
              type: a.type,
            }))
          : [{ uri: (result as any).uri }];

      setItemImages((prev) => [...prev, ...picks].slice(0, MAX_IMAGES));
    } catch (err: any) {
      console.error("Image picker error:", err);
      Alert.alert(
        "Picker Error",
        err.message || "Could not open image picker."
      );
    } finally {
      setLoadingPick(false);
    }
  };

  const handleRemoveImage = (idx: number) =>
    setItemImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!title || !description || itemImages.length === 0) {
      Alert.alert(
        "Incomplete",
        "Please fill title, description, and add at least one image."
      );
      return;
    }

    setSubmitting(true);
    try {
      const token = await AuthService.getStoredToken();
      if (!token) throw new Error("You must be logged in.");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);

      itemImages.forEach((asset) => {
        const parts = asset.uri.split(".");
        const ext = parts[parts.length - 1];
        formData.append("itemImages", {
          uri: asset.uri,
          name: asset.fileName ?? `photo.${ext}`,
          type: asset.type ?? `image/${ext}`,
        } as any);
      });

      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok)
        throw new Error(json.error || json.message || "Upload failed.");

      setPostSuccessData({
        slug: json.data.slug,
        message: "Donation posted successfully!",
        title: title,
      });
      fetchRecommendations(json.data.slug);
    } catch (err: any) {
      console.error("Submit error:", err);
      Alert.alert("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartChatWithRecommendation = async (recommendedUser: User) => {
    if (!postSuccessData) return;
    try {
      const token = await AuthService.getStoredToken();
      if (!token) throw new Error("You must be logged in to start a chat.");
      const res = await fetch(`${API_BASE_URL}/chat/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: recommendedUser.id,
          text: `Hi, I saw you were recommended for my donation: "${postSuccessData.title}"`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to start chat.");
      router.push({
        pathname: `/chat/${json.conversationId}`,
        params: { otherUser: JSON.stringify(recommendedUser) },
      });
    } catch (err: any) {
      Alert.alert("Error starting chat", err.message);
    }
  };

  const RecommendationCard = ({ user }: { user: User }) => (
    <View style={styles.recCard}>
      <Image source={{ uri: user.avatarUrl }} style={styles.recAvatar} />
      <View style={styles.recDetails}>
        <Text style={styles.recName}>{user.fullName}</Text>
        <Text style={styles.recLocation} numberOfLines={1}>
          {user.address}
        </Text>
      </View>
      <Button
        title="Chat User"
        onPress={() => handleStartChatWithRecommendation(user)}
        size="sm"
        variant="outline"
        icon={<Send size={14} color={Colors.primary[600]} />}
      />
    </View>
  );

  if (postSuccessData) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: "Recommendations",
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        />
        <View style={styles.successContainer}>
          <View style={styles.successHeader}>
            <CheckCircle size={32} color={Colors.success[600]} />
            <Text style={styles.successTitle}>{postSuccessData.message}</Text>
          </View>
          <Text style={styles.successSubtitle}>
            Based on your item and location, here are some potential recipients
            you can notify:
          </Text>
          {loadingRecs ? (
            <ActivityIndicator
              style={{ marginVertical: 40 }}
              size="large"
              color={Colors.primary[600]}
            />
          ) : (
            <FlatList
              data={recommendations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <RecommendationCard user={item} />}
              ListEmptyComponent={
                <View style={styles.emptyRecs}>
                  <Text style={styles.emptyRecsText}>
                    No specific recommendations found at this time.
                  </Text>
                </View>
              }
              contentContainerStyle={{ paddingTop: 16 }}
            />
          )}
          <Button
            title="Done"
            onPress={() => router.back()}
            style={{ marginTop: "auto" }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Create Donation",
          headerBackTitle: "Back",
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Images (up to {MAX_IMAGES})</Text>
        <ScrollView
          horizontal
          style={styles.imageScrollView}
          showsHorizontalScrollIndicator={false}
        >
          {itemImages.map((img, i) => (
            <View key={i} style={styles.imageContainer}>
              <Image source={{ uri: img.uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemoveImage(i)}
              >
                <X size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          ))}

          {loadingPick ? (
            <View style={styles.addBtn}>
              <ActivityIndicator />
            </View>
          ) : itemImages.length < MAX_IMAGES ? (
            <TouchableOpacity style={styles.addBtn} onPress={handleImagePick}>
              <Plus size={24} color={Colors.primary[600]} />
            </TouchableOpacity>
          ) : null}
        </ScrollView>

        <Input
          label="Item Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Vintage Wooden Coffee Table"
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the item, its condition, dimensions, etc."
          multiline
          numberOfLines={4}
          style={styles.descriptionInput}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={styles.picker}
          >
            {categories.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        <Button
          title="Submit Donation"
          onPress={handleSubmit}
          loading={submitting}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 24 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.primary,
    marginTop: 16,
  },
  imageScrollView: { marginTop: 8, marginBottom: 16 },
  imageContainer: { position: "relative", marginRight: 10 },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: Colors.gray[200],
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.primary[200],
    alignItems: "center",
    justifyContent: "center",
  },
  descriptionInput: { height: 120, textAlignVertical: "top" },
  pickerContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    justifyContent: "center",
  },
  picker: { height: Platform.OS === "ios" ? undefined : 50 },
  successContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.background,
  },
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  recCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  recDetails: {
    flex: 1,
    marginRight: 12,
  },
  recName: {
    fontSize: 16,
    fontWeight: "600",
  },
  recLocation: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  emptyRecs: { padding: 20, alignItems: "center" },
  emptyRecsText: { color: Colors.text.secondary, fontStyle: "italic" },
});

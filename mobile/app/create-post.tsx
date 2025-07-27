import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '../constants/Colors';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AuthService } from '../services/auth';
import { Plus, X } from 'lucide-react-native';

const API_BASE_URL = 'http://localhost:3000/api';

// Same categories as HomeScreen, without 'All'
const categories = [
  'Bayi & Anak',
  'Buku, Musik & Media',
  'Elektronik',
  'Fashion & Pakaian',
  'Kesehatan & Kecantikan',
  'Olahraga & Luar Ruangan',
  'Otomotif & Peralatan',
  'Perlengkapan Hewan Peliharaan',
  'Perlengkapan Kantor & Alat Tulis',
  'Rumah & Dapur',
];

export default function CreatePostScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImagePick = async () => {
    try {
      console.log('Requesting media library permissions...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission status:', status);

      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      console.log('Launching image library...');
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5 - images.length,
        quality: 0.8,
      });
      console.log('Image picker result:', result);

      if (!result.canceled) {
        setImages((prevImages) => [...prevImages, ...result.assets].slice(0, 5));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Image Picker Error', 'An error occurred while trying to open the image library. Check the console for more details.');
    }
  };

  const handleRemoveImage = (uri: string) => {
    setImages(images.filter((image) => image.uri !== uri));
  };

  const handleSubmit = async () => {
    if (!title || !description || images.length === 0) {
      Alert.alert('Incomplete Form', 'Please fill in the title, description, and add at least one image.');
      return;
    }

    console.log('Submitting post with data:', { title, description, category, imageCount: images.length });

    setLoading(true);
    try {
      const token = await AuthService.getStoredToken();
      if (!token) {
        throw new Error('You must be logged in to create a post.');
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);

      images.forEach((image) => {
        const uriParts = image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('images', {
          uri: image.uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      });

      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          // 'Content-Type': 'multipart/form-data' is set automatically by fetch when using FormData
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('API Response Status:', response.status);
      const responseData = await response.json();
      console.log('API Response Data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create post.');
      }

      Alert.alert('Success', 'Your post has been created successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerTitle: 'Create New Donation', headerBackTitle: 'Back' }} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={styles.label}>Images (up to 5)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScrollView}>
            {images.map((image) => (
              <View key={image.uri} style={styles.imageContainer}>
                <Image source={{ uri: image.uri }} style={styles.image} />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => handleRemoveImage(image.uri)}>
                  <X size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageButton} onPress={handleImagePick}>
                <Plus size={24} color={Colors.primary[600]} />
              </TouchableOpacity>
            )}
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
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
            >
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
          </View>

          <Button title="Submit Donation" onPress={handleSubmit} loading={loading} style={styles.submitButton} />
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
  scrollContent: {
    padding: 24,
  },
  form: {},
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  imageScrollView: {
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: Colors.gray[200],
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary[200],
    borderStyle: 'dashed',
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    marginBottom: 24,
  },
  picker: {
    height: Platform.OS === 'ios' ? undefined : 50,
  },
  submitButton: {
    marginTop: 16,
  },
});
// CreatePostScreen.tsx

import React, { useState } from 'react'
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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, Stack } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { Picker } from '@react-native-picker/picker'
import { Colors } from '../constants/Colors'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { AuthService } from '../services/auth'
import { Plus, X } from 'lucide-react-native'

const API_BASE_URL = 'http://localhost:3000/api/posts'
const MAX_IMAGES = 5

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
]

type Asset = { uri: string; fileName?: string; type?: string }

export default function CreatePostScreen() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [itemImages, setItemImages] = useState<Asset[]>([])
  const [loadingPick, setLoadingPick] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const handleImagePick = async () => {
    setLoadingPick(true)
    try {
      // 1) ask for permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need photo access to pick images!')
        return
      }

      // 2) launch picker (no selectionLimit here)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true, // iOS only, but safe to leave
        quality: 0.8,
      })

      // 3) log raw result so you can inspect in Metro console
      console.log('🎨 picker result:', result)

      if (result.canceled) {
        return
      }

      // 4) normalize into an array of {uri, fileName?, type?}
      const picks: Asset[] =
        Array.isArray((result as any).assets) && (result as any).assets.length > 0
          ? (result as any).assets.map((a: any) => ({
              uri: a.uri,
              fileName: a.fileName,
              type: a.type,
            }))
          : // fallback for older shape: {uri: string}
            [{ uri: (result as any).uri }]

      // 5) merge with existing and cap at MAX_IMAGES
      setItemImages(prev => [...prev, ...picks].slice(0, MAX_IMAGES))
    } catch (err: any) {
      console.error('Image picker error:', err)
      Alert.alert('Picker Error', err.message || 'Something went wrong.')
    } finally {
      setLoadingPick(false)
    }
  }

  const handleRemoveImage = (idx: number) =>
    setItemImages(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async () => {
    if (!title || !description || itemImages.length === 0) {
      Alert.alert('Incomplete', 'Please fill title, description, and add at least one image.')
      return
    }
    setSubmitting(true)

    try {
      const token = await AuthService.getStoredToken()
      if (!token) throw new Error('You must be logged in.')

      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('category', category)

      // append every image under the key "itemImages"
      itemImages.forEach(asset => {
        const parts = asset.uri.split('.')
        const ext = parts[parts.length - 1]
        formData.append(
          'itemImages',
          {
            uri: asset.uri,
            name: asset.fileName ?? `photo.${ext}`,
            type: asset.type ?? `image/${ext}`,
          } as any
        )
      })

      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || json.message || 'Upload failed.')
      }

      Alert.alert('Success', 'Donation posted!', [
        { text: 'View it', onPress: () => router.push(`/posts/${json.data.slug}`) },
      ])
    } catch (err: any) {
      console.error('Submit error:', err)
      Alert.alert('Error', err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerTitle: 'Create Donation', headerBackTitle: 'Back' }} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Images (up to {MAX_IMAGES})</Text>
        <ScrollView horizontal style={styles.imageScrollView} showsHorizontalScrollIndicator={false}>
          {itemImages.map((img, i) => (
            <View key={i} style={styles.imageContainer}>
              <Image source={{ uri: img.uri }} style={styles.image} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveImage(i)}>
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
          <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
            {categories.map(cat => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        <Button title="Submit Donation" onPress={handleSubmit} loading={submitting} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: 24 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.text.primary, marginTop: 16 },
  imageScrollView: { marginTop: 8, marginBottom: 16 },
  imageContainer: { position: 'relative', marginRight: 10 },
  image: { width: 100, height: 100, borderRadius: 12, backgroundColor: Colors.gray[200] },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionInput: { height: 120, textAlignVertical: 'top' },
  pickerContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    justifyContent: 'center',
  },
  picker: { height: Platform.OS === 'ios' ? undefined : 50 },
})

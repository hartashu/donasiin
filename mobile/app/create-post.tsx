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

const API_BASE_URL = 'http://localhost:3000/api'

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
]

type AnalysisResult = {
  itemName: string
  quantity: number
  carbonKg: number
  aiAnalysis: string
  imageUrl: string
}

export default function CreatePostScreen() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(categories[0])

  // we no longer keep raw ImagePicker assets for upload
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])

  const [loadingPick, setLoadingPick] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  // call your backend analyze-item endpoint
  const analyzeImage = async (
    uri: string,
    filename: string,
    mimeType: string
  ): Promise<AnalysisResult> => {
    const token = await AuthService.getStoredToken()
    if (!token) throw new Error('Not authenticated')

    const formData = new FormData()
    formData.append('itemImage', {
      uri,
      name: filename,
      type: mimeType,
    } as any)

    const res = await fetch(`${API_BASE_URL}/analyze-item`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Analysis failed')
    }

    const json = await res.json()
    return json.data as AnalysisResult
  }

  const handleImagePick = async () => {
    setLoadingPick(true)
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'We need photo library permissions to analyze an item!'
        )
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 5 - analysisResults.length,
        quality: 0.8,
      })

      if (!result.canceled) {
        // for each new asset, call analyzeImage
        const promises = result.assets.map(async (asset) => {
          const uri = asset.uri
          const parts = uri.split('.')
          const ext = parts[parts.length - 1]
          const name = `photo.${ext}`
          const mime = `image/${ext}`

          return await analyzeImage(uri, name, mime)
        })

        const newAnalyses = await Promise.all(promises)
        setAnalysisResults((prev) => [...prev, ...newAnalyses].slice(0, 5))
      }
    } catch (err: any) {
      console.error(err)
      Alert.alert('Image Analysis Error', err.message || '')
    } finally {
      setLoadingPick(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    setAnalysisResults((prev) =>
      prev.filter((_, idx) => idx !== index)
    )
  }

  const handleSubmit = async () => {
    if (!title || !description || analysisResults.length === 0) {
      Alert.alert(
        'Incomplete Form',
        'Please fill in title, description, and add at least one image.'
      )
      return
    }

    setSubmitting(true)
    try {
      const token = await AuthService.getStoredToken()
      if (!token) throw new Error('You must be logged in.')

      // gather just the hosted URLs
      const imageUrls = analysisResults.map((r) => r.imageUrl)

      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          category,
          images: imageUrls,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to create post.')
      }

      Alert.alert('Success', 'Your donation has been posted!', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (err: any) {
      console.error(err)
      Alert.alert('Submission Error', err.message || '')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Create New Donation',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.label}>Images & AI Analysis (up to 5)</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScrollView}
          >
            {analysisResults.map((r, idx) => (
              <View key={idx} style={styles.imageContainer}>
                <Image
                  source={{ uri: r.imageUrl }}
                  style={styles.image}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(idx)}
                >
                  <X size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ))}

            {loadingPick ? (
              <View style={styles.imageContainer}>
                <ActivityIndicator size="small" color={Colors.primary[600]} />
              </View>
            ) : analysisResults.length < 5 ? (
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handleImagePick}
              >
                <Plus size={24} color={Colors.primary[600]} />
              </TouchableOpacity>
            ) : null}
          </ScrollView>

          {/* show aiAnalysis under each image */}
          {analysisResults.map((r, idx) => (
            <Text key={idx} style={styles.analysisText}>
              📊 {r.aiAnalysis}
            </Text>
          ))}

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
              onValueChange={(v) => setCategory(v)}
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
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  scrollContent: { padding: 24 },
  form: {},
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  imageScrollView: { marginBottom: 16 },
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
  descriptionInput: { height: 120, textAlignVertical: 'top' },
  pickerContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    marginBottom: 24,
  },
  picker: { height: Platform.OS === 'ios' ? undefined : 50 },
  submitButton: { marginTop: 16 },
  analysisText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
})

// screens/RequestsScreen.tsx

import React, { useCallback, useState } from 'react'
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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router'
import { Colors } from '../../constants/Colors'
import { DonationRequest } from '../../types'
import { Clock, CheckCircle, Truck, XCircle, X } from 'lucide-react-native'
import { AuthService } from '../../services/auth'
import { Button } from '../../components/ui/Button'

const API_BASE_URL = 'http://localhost:3000/api'
const MAX_TRACKING_LENGTH = 50

export default function RequestsScreen() {
  const [requests, setRequests] = useState<DonationRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [trackingCodes, setTrackingCodes] = useState<Record<string, string>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const router = useRouter()

  const fetchRequests = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = await AuthService.getStoredToken()
      if (!token) throw new Error('You must be logged in.')

      const user = await AuthService.getCurrentUser()
      if (!user) throw new Error('Could not get current user.')
      setCurrentUserId(user.id)

      // Fetch both outgoing and incoming requests in parallel
      const [outgoingRes, incomingRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/me/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/users/me/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!outgoingRes.ok || !incomingRes.ok) {
        throw new Error('Failed to fetch one or more request types.')
      }

      const outgoingJson = await outgoingRes.json()
      const incomingJson = await incomingRes.json()

      // Map outgoing requests (requests you made)
      const mappedOutgoing: DonationRequest[] = (outgoingJson.data || [])
        .filter((item: any) => item.postDetails) // FIX: Prevents crash if post is deleted
        .map(
          (item: any): DonationRequest => ({
            id: item._id,
            postId: item.postId,
            status: item.status.toLowerCase(),
            trackingCode: item.trackingCode ?? '',
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt || item.createdAt),
            requesterId: item.userId,
            isOutgoing: true, // This is an outgoing request
            post: {
              id: item.postDetails._id,
              slug: item.postDetails.slug,
              title: item.postDetails.title,
              images: [item.postDetails.thumbnailUrl].filter(Boolean),
            },
          })
        )

      // Map incoming requests (requests for your items)
      const mappedIncoming: DonationRequest[] = []
      ;(incomingJson.data || []).forEach((post: any) => {
        ;(post.requests || []).forEach((req: any) => {
          if (req.requester) { // Ensure requester data exists
            mappedIncoming.push({
              id: req._id,
              postId: post._id,
              status: req.status.toLowerCase(),
              trackingCode: req.trackingCode ?? '',
              createdAt: new Date(req.createdAt),
              updatedAt: new Date(req.updatedAt || req.createdAt),
              requesterId: req.requester._id,
              isOutgoing: false, // This is an incoming request
              post: {
                id: post._id,
                slug: post.slug,
                title: post.title,
                images: [post.thumbnailUrl].filter(Boolean),
              },
            })
          }
        })
      })

      // Combine, sort by most recent, and update state
      const allRequests = [...mappedOutgoing, ...mappedIncoming].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      )
      setRequests(allRequests)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => {
    fetchRequests()
  }, [fetchRequests]))

  // Generic PATCH helper
  const patchRequest = async (id: string, body: any) => {
    const token = await AuthService.getStoredToken()
    if (!token) throw new Error('Auth required.')
    const resp = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    const json = await resp.json()
    
    console.log("data !!!",json);
    
    if (!resp.ok) {
      throw new Error(json.message || 'Update failed.')
    }
    return json
  }

  // ---- HANDLERS ----

  const handleAccept = async (id: string) => {
    setUpdatingId(id)
    try {
      await patchRequest(id, { status: 'ACCEPTED' })
      setRequests(r =>
        r.map(x => x.id === id ? { ...x, status: 'accepted' } : x)
      )
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleReject = async (id: string) => {
    setUpdatingId(id)
    try {
      await patchRequest(id, { status: 'REJECTED' })
      setRequests(r =>
        r.map(x => x.id === id ? { ...x, status: 'rejected' } : x)
      )
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleShip = async (id: string) => {
    const code = trackingCodes[id]?.trim()
    if (!code) {
      Alert.alert('Validation', 'Please enter a tracking code.')
      return
    }
    setUpdatingId(id)
    try {
      await patchRequest(id, {
        status: 'SHIPPED',
        trackingCode: code,
      })
      setRequests(r =>
        r.map(x => x.id === id ? { ...x, status: 'shipped', trackingCode: code } : x)
      )
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Request',
      'Are you sure you want to delete?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              const token = await AuthService.getStoredToken()
              if (!token) throw new Error('Auth required.')
              const resp = await fetch(`${API_BASE_URL}/requests/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              })
              if (!resp.ok) {
                const err = await resp.json().catch(() => ({}))
                throw new Error(err.message || 'Delete failed.')
              }
              setRequests(r => r.filter(x => x.id !== id))
            } catch (e: any) {
              Alert.alert('Error', e.message)
            }
          }
        }
      ]
    )
  }

  // ---- RENDER ----

  const getStatusIcon = (status: DonationRequest['status']) => {
    switch (status) {
      case 'pending':   return <Clock color={Colors.warning[500]} size={20}/>
      case 'accepted':  return <CheckCircle color={Colors.success[500]} size={20}/>
      case 'rejected':  return <XCircle color={Colors.error[500]} size={20}/>
      case 'completed': return <CheckCircle color={Colors.success[700]} size={20}/>
      default:          return <Clock color={Colors.gray[500]} size={20}/>
    }
  }

  const renderItem = ({ item }: {item: DonationRequest}) => {
    const incoming = !item.isOutgoing

    return (
      <View style={styles.card}>
        <Image source={{ uri: item.post.images[0] }} style={styles.image} />

        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.title} numberOfLines={2}>{item.post.title}</Text>
            {item.isOutgoing && (
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <X color={Colors.text.tertiary} size={16}/>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.row}>
            {getStatusIcon(item.status)}
            <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
              {capitalize(item.status)}
            </Text>
          </View>

          {incoming && item.status === 'pending' && (
            <View style={styles.actionsRow}>
              <Button
                title="Accept"
                onPress={() => handleAccept(item.id)}
                loading={updatingId===item.id}
                size="sm"
                style={styles.btnAccept}
              />
              <Button
                title="Reject"
                onPress={() => handleReject(item.id)}
                loading={updatingId===item.id}
                size="sm"
                variant="outline"
                style={styles.btnReject}
              />
            </View>
          )}

          {incoming && item.status === 'accepted' && (
            <View style={styles.shipRow}>
              <TextInput
                placeholder="Tracking code"
                value={trackingCodes[item.id] || ''}
                onChangeText={text =>
                  setTrackingCodes(c => ({ ...c, [item.id]: text }))
                }
                style={styles.input}
                maxLength={MAX_TRACKING_LENGTH}
              />
              <Button
                title="Submit Ship"
                onPress={() => handleShip(item.id)}
                loading={updatingId===item.id}
                disabled={!trackingCodes[item.id]?.trim()}
                size="sm"
                style={styles.btnShip}
              />
            </View>
          )}
        </View>
      </View>
    )
  }

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator style={styles.centered} size="large" color={Colors.primary[600]}/>
    }
    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <Button title="Retry" onPress={fetchRequests}/>
        </View>
      )
    }
    if (!requests.length) {
      return (
        <View style={styles.centered}>
          <Text style={styles.empty}>No requests yet.</Text>
        </View>
      )
    }
    return (
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={i=>i.id}
        contentContainerStyle={styles.list}
      />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Requests</Text>
      {renderContent()}
    </SafeAreaView>
  )
}

// helper
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const getStatusColor = (status: DonationRequest['status']) => {
  switch (status) {
    case 'pending':   return Colors.warning[500]
    case 'accepted':  return Colors.success[500]
    case 'rejected':  return Colors.error[500]
    case 'completed': return Colors.success[700]
    default:          return Colors.gray[500]
  }
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: Colors.background },
  header:    { fontSize:24, fontWeight:'700', padding:16, color:Colors.text.primary },
  list:      { paddingHorizontal:16, paddingBottom:24 },
  card:      { flexDirection:'row', marginVertical:8, backgroundColor:Colors.surface, borderRadius:12, overflow:'hidden' },
  image:     { width:80, height:80 },
  content:   { flex:1, padding:12 },
  row:       { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  title:     { flex:1, fontSize:16, fontWeight:'600', color:Colors.text.primary, marginRight:8 },
  status:    { fontSize:14, fontWeight:'600', marginLeft:6 },
  actionsRow:{ flexDirection:'row', marginTop:8 },
  btnAccept: { marginRight:8 },
  btnReject: {},
  shipRow:   { flexDirection:'row', alignItems:'center', marginTop:8 },
  input:     {
    flex:1,
    borderWidth:1,
    borderColor:Colors.border,
    borderRadius:8,
    padding: Platform.OS==='ios'?12:8,
    marginRight:8,
  },
  btnShip:   {},
  centered:  { flex:1, justifyContent:'center', alignItems:'center' },
  error:     { color:Colors.error[600], marginBottom:12 },
  empty:     { color:Colors.text.secondary },
})

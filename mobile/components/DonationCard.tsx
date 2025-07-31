import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../constants/Colors";
import { DonationPost } from "../types";
import {
  Baby,
  BookOpen,
  Smartphone,
  Shirt,
  HeartPulse,
  Bike,
  Wrench,
  Dog,
  PenSquare,
  Home,
  Tag as DefaultIcon,
  MapPin,
  Handshake,
} from "lucide-react-native";

interface DonationCardProps {
  post: DonationPost;
  onPress: () => void;
}

const categoryMap: { [key: string]: { label: string; icon: React.ElementType } } = {
  "baby-kids": { label: "Baby & Kids", icon: Baby },
  "books-music-media": { label: "Books, Music & Media", icon: BookOpen },
  electronics: { label: "Electronics", icon: Smartphone },
  "fashion-apparel": { label: "Fashion & Apparel", icon: Shirt },
  "health-beauty": { label: "Health & Beauty", icon: HeartPulse },
  "sports-outdoors": { label: "Sports & Outdoors", icon: Bike },
  "automotive-tools": { label: "Automotive & Tools", icon: Wrench },
  "pet-supplies": { label: "Pet Supplies", icon: Dog },
  "office-supplies-stationery": {
    label: "Office Supplies & Stationery",
    icon: PenSquare,
  },
  "home-kitchen": { label: "Home & Kitchen", icon: Home },
};

const getCategoryInfo = (slug: string) => {
  const normalizedSlug = slug
    .toLowerCase()
    .replace(/, | & /g, "-")
    .replace(/ /g, "-");
  return (
    categoryMap[normalizedSlug] || { label: slug, icon: DefaultIcon }
  );
};

const formatDistanceToNow = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `now`;

  const intervals: { [key: string]: number } = {
    y: 31536000,
    mo: 2592000,
    d: 86400,
    h: 3600,
    m: 60,
  };
  for (const key in intervals) {
    const interval = Math.floor(seconds / intervals[key]);
    if (interval >= 1) return `${interval}${key} ago`;
  }
  return `${Math.floor(seconds)}s ago`;
};

export function DonationCard({ post, onPress }: DonationCardProps) {
  const imageUrl = post.images && post.images.length > 0 ? post.images[0] : null;

  return (
    <TouchableOpacity
      style={[styles.container, post.isRequested && styles.requestedContainer]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        {post.isRequested ? (
          <View style={[styles.availableTag, styles.requestedTag]}>
            <Handshake size={12} color={Colors.white} />
            <Text style={styles.availableText}>Requested</Text>
          </View>
        ) : post.isAvailable ? (
          <View style={styles.availableTag}>
            <Text style={styles.availableText}>Available</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>
        <Text style={styles.description} numberOfLines={1}>
          {post.description}
        </Text>

        <View style={styles.ownerInfo}>
          <View style={styles.ownerDetails}>
            <Image
              source={{ uri: post.owner.avatarUrl ? post.owner.avatarUrl : 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150' }}
              style={styles.avatar}
            />
            <Text style={styles.ownerName} numberOfLines={1}>
              @{post.owner.username}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {formatDistanceToNow(post.createdAt)}
          </Text>
        </View>

        {post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.slice(0, 3).map((tag, index) => {
              const { label, icon: Icon } = getCategoryInfo(tag);
              const iconProps = { color: Colors.primary[700], size: 14 };
              return (
                <View key={index} style={styles.tag}>
                  <Icon {...iconProps} />
                  <Text style={styles.tagText}>{label}</Text>
                </View>
              );
            })}
            {post.owner.address && (
              <View style={[styles.tag, styles.locationTag]}>
                <MapPin size={12} color={Colors.text.secondary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {post.owner.address.split(" ").pop()?.replace(/,$/, "")}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'visible', // Ensure shadow isn't clipped
    shadowColor: Colors.primary[600],
    shadowOffset: { width: 0, height: 4 }, // Adjusted offset
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  requestedContainer: {
    opacity: 0.7,
  },
  imageContainer: {
    position: "relative",
},
  image: {
    width: "100%",
    height: 200,
    backgroundColor: Colors.gray[200],
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.border,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  availableTag: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: Colors.primary[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  requestedTag: {
    backgroundColor: Colors.warning[500],
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  availableText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  ownerDetails: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  ownerName: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  dateText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: "500",
    flexShrink: 0,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationTag: {
    backgroundColor: Colors.gray[100],
    borderColor: Colors.gray[200],
    paddingHorizontal: 10,
  },
  locationText: {
    color: Colors.text.secondary,
  },
  tagText: {
    marginLeft: 4,
    fontSize: 12,
    color: Colors.primary[700],
    fontWeight: "500",
  },
});

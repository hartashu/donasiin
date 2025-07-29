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
} from "lucide-react-native";

interface DonationCardProps {
  post: DonationPost;
  onPress: () => void;
}

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

const getCategoryIcon = (category: string) => {
  const iconProps = { color: Colors.primary[700], size: 14 };
  const categoryLower = category.toLowerCase();

  switch (categoryLower) {
    case "baby & kids":
      return <Baby {...iconProps} />;
    case "books, music & media":
      return <BookOpen {...iconProps} />;
    case "electronics":
      return <Smartphone {...iconProps} />;
    case "fashion & apparel":
      return <Shirt {...iconProps} />;
    case "health & beauty":
      return <HeartPulse {...iconProps} />;
    case "sports & outdoors":
      return <Bike {...iconProps} />;
    case "automotive & tools":
      return <Wrench {...iconProps} />;
    case "pet supplies":
      return <Dog {...iconProps} />;
    case "office supplies & stationery":
      return <PenSquare {...iconProps} />;
    case "home & kitchen":
      return <Home {...iconProps} />;
    default:
      return <DefaultIcon {...iconProps} />;
  }
};

export function DonationCard({ post, onPress }: DonationCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: post.images[0] }} style={styles.image} />
        {post.isAvailable && (
          <View style={styles.availableTag}>
            <Text style={styles.availableText}>Available</Text>
          </View>
        )}
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
              source={{ uri: post.owner.avatarUrl }}
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
            {post.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                {getCategoryIcon(tag)}
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {post.owner.address && (
              <View style={[styles.tag, styles.locationTag]}>
                <MapPin size={12} color={Colors.text.secondary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {post.owner.address.split(",")[0]}
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
    backgroundColor: Colors.primary[100],
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 200,
    backgroundColor: Colors.gray[200],
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
    fontWeight: "600",
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
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary[200],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationTag: {
    backgroundColor: "transparent",
    borderColor: Colors.border,
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
    textTransform: "capitalize",
  },
});

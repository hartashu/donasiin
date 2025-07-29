import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "../constants/Colors";
import { Button } from "../components/ui/Button";
import { Leaf, Users, Package } from "lucide-react-native";
import { BlurView } from "expo-blur";

const API_BASE_URL = "http://localhost:3000/api";

type Stats = {
  totalCarbonSavedKg: string;
  totalUsers: number;
  totalPosts: number;
};

export default function WelcomeScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/stats/home`);
        if (!response.ok) throw new Error("Failed to fetch stats");
        const result = await response.json();
        setStats(result.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats({
          totalCarbonSavedKg: "10340.9",
          totalUsers: 14,
          totalPosts: 32,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/earth.gif")}
        style={styles.earthImage}
      // source={{ uri: 'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg' }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentWrapper}>
          {/* 👇 The BlurView container creates the frosted glass effect */}
          <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
            <Text style={styles.title}>Welcome to Donasiin</Text>
            <Text style={styles.subtitle}>
              Give your pre-loved items a second life and save the planet.
            </Text>

            <View style={styles.statsContainer}>
              {loading ? (
                <ActivityIndicator color={Colors.white} size="large" />
              ) : (
                <>
                  <View style={styles.statBox}>
                    <Users color={Colors.white} size={24} />
                    <Text style={styles.statNumber}>{stats?.totalUsers}</Text>
                    <Text style={styles.statLabel}>Active Users</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Leaf color={Colors.white} size={24} />
                    <Text style={styles.statNumber}>
                      {parseFloat(stats?.totalCarbonSavedKg || "0").toFixed(1)}{" "}
                      kg
                    </Text>
                    <Text style={styles.statLabel}>Carbon avoidance</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Package color={Colors.white} size={24} />
                    <Text style={styles.statNumber}>{stats?.totalPosts}</Text>
                    <Text style={styles.statLabel}>Items Donated</Text>
                  </View>
                </>
              )}
            </View>

            <Button
              title="Get Started"
              onPress={() => router.push("/(auth)/login")}
              style={styles.button}
              textStyle={{ color: Colors.white }}
            />
          </BlurView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary[700],
  },
  earthImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    resizeMode: "cover",
  },
  safeArea: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  blurContainer: {
    padding: 24,
    borderRadius: 24,
    overflow: "hidden",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.white,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary[200],
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 32,
    paddingVertical: 10,
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.white,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.primary[200],
    marginTop: 4,
    textTransform: "uppercase",
    textAlign: "center",
  },
  button: {
    backgroundColor: Colors.primary[500],
  },
});

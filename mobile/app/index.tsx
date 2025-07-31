import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Leaf, Package } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { API_BASE_URL } from '../constants/api';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay: number;
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, label, delay }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 100 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 12, stiffness: 100 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[styles.statItem, animatedStyle]}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

export default function WelcomeScreen() {
  const [stats, setStats] = useState<{ totalUsers: number; totalCarbonSavedKg: number; totalPosts: number } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // animation values
  const backgroundScale = useSharedValue(1.2);
  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(-30);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    // fetch stats
    fetch(`${API_BASE_URL}/stats/home`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
      })
      .then(json => {
        setStats({
          totalUsers: json.data.totalUsers,
          totalCarbonSavedKg: parseFloat(json.data.totalCarbonSavedKg),
          totalPosts: json.data.totalPosts,
        });
      })
      .catch(err => {
        console.warn(err);
        setStats({ totalUsers: 0, totalCarbonSavedKg: 0, totalPosts: 0 });
      })
      .finally(() => setLoadingStats(false));

    // animations
    backgroundScale.value = withTiming(1, { duration: 2000 });
    cardScale.value     = withDelay(300, withSpring(1, { damping: 15, stiffness: 100 }));
    cardOpacity.value   = withDelay(300, withTiming(1, { duration: 800 }));
    titleOpacity.value  = withDelay(600, withTiming(1, { duration: 800 }));
    titleTranslateY.value = withDelay(600, withSpring(0, { damping: 12, stiffness: 100 }));
    subtitleOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));
    subtitleTranslateY.value = withDelay(800, withSpring(0, { damping: 12, stiffness: 100 }));
    buttonScale.value   = withDelay(1400, withSpring(1, { damping: 15, stiffness: 100 }));
    buttonOpacity.value = withDelay(1400, withTiming(1, { duration: 600 }));
  }, []);

  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backgroundScale.value }],
  }));
  const cardStyle       = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));
  const titleStyle      = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));
  const subtitleStyle   = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));
  const buttonStyle     = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const handleGetStarted = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen gradient background */}
      <LinearGradient
        colors={['#29C88B', '#06916C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* GIF background */}
      <Image
        source={require('../assets/earth.gif')}
        style={styles.gifBackground}
        resizeMode="cover"
      />

      {/* Gradient overlay */}
      <Animated.View style={[styles.backgroundContainer, backgroundStyle]}>
        <LinearGradient
          colors={['rgba(15,23,42,0.2)', 'rgba(30,41,59,0.2)', 'rgba(51,65,85,0.2)']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Centered content card */}
      <Animated.View style={[styles.contentCard, cardStyle]}>
        <Animated.View style={titleStyle}>
          <Text style={styles.title}>Welcome</Text>
        </Animated.View>
        <Animated.View style={subtitleStyle}>
          <Text style={styles.subtitle}>
            Give your pre-loved items a second life and{'\n'}save the planet.
          </Text>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {loadingStats || !stats ? (
            <ActivityIndicator color="#FFF" size="large" />
          ) : (
            <>
              <StatItem
                icon={<Users size={24} color="#FFF" />}
                value={stats.totalUsers.toString()}
                label="ACTIVE USERS"
                delay={1000}
              />
              <StatItem
                icon={<Leaf size={24} color="#FFF" />}
                value={`${stats.totalCarbonSavedKg.toFixed(1)} kg`}
                label="CARBON AVOIDANCE"
                delay={1100}
              />
              <StatItem
                icon={<Package size={24} color="#FFF" />}
                value={stats.totalPosts.toString()}
                label="ITEMS DONATED"
                delay={1200}
              />
            </>
          )}
        </View>

        {/* Button */}
        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
            <LinearGradient
              colors={['#14B8A6', '#0D9488']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  gifBackground: {
    position: 'absolute',
    width,
    height,
    top: 0,
    left: 0,
  },

  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },

  contentCard: {
    position: 'absolute',
    top: height * 0.25,
    left: width * 0.05,
    width: width * 0.9,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',    borderRadius: 24,
    padding: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary[300],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(20,184,166,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(20,184,166,0.3)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.primary[300],
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  buttonContainer: {
    alignItems: 'center',
  },
  getStartedButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

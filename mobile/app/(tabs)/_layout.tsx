import React from "react";
import { View, Text } from "react-native";
import { Tabs } from "expo-router";
import {
  House as Home,
  MessageCircle,
  User,
  Handshake,
} from "lucide-react-native";
import { Colors } from "../../constants/Colors";
import {
  NotificationProvider,
  useNotifications,
} from "../../context/NotificationContext";

const TabBarIconWithBadge = ({
  icon: Icon,
  count,
  color,
  size,
}: {
  icon: React.ElementType;
  count: number;
  color: string;
  size: number;
}) => {
  return (
    <View>
      <Icon color={color} size={size} />
      {count > 0 && (
        <View
          style={{
            position: "absolute",
            right: -10,
            top: -5,
            backgroundColor: Colors.error[500],
            borderRadius: 9,
            minWidth: 18,
            height: 18,
            paddingHorizontal: 4,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: Colors.surface,
          }}
        >
          <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
            {count > 9 ? "9+" : count}
          </Text>
        </View>
      )}
    </View>
  );
};

function TabScreens() {
  const { newPostsCount, newRequestsCount, unreadMessagesCount } =
    useNotifications();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary[600],
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <TabBarIconWithBadge
              icon={Home}
              count={newPostsCount}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: "Requests",
          tabBarIcon: ({ color, size }) => (
            <TabBarIconWithBadge
              icon={Handshake}
              count={newRequestsCount}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size }) => (
            <TabBarIconWithBadge
              icon={MessageCircle}
              count={unreadMessagesCount}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <NotificationProvider>
      <TabScreens />
    </NotificationProvider>
  );
}

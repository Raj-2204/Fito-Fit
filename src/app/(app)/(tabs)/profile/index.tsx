import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View, Alert, ScrollView, Image, ActivityIndicator } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { client } from "@/lib/sanity/client";
import { GetWorkoutQueryResult } from "@/lib/sanity/types";
import { getWorkoutQuery } from "../history/history";
import { formatDuration } from "lib/utils";
import { useFocusEffect } from "expo-router";

export default function Page() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [workouts, setWorkouts] = useState<GetWorkoutQueryResult>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const results = await client.fetch(getWorkoutQuery, { userId: user.id });
      setWorkouts(results);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchWorkouts();
    }, [user?.id])
  );

  const handleLogout = async () => {
    try {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => signOut()
        }
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to sign out. Please try again.");
      console.error("Sign out error:", error);
    }
  };

  const formatJoinDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });
  };

  const getDaysSinceJoining = () => {
    if (!user?.createdAt) return 0;
    const joinDate = typeof user.createdAt === 'string' ? new Date(user.createdAt) : user.createdAt;
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTotalWorkoutTime = () => {
    return workouts.reduce((total, workout) => total + (workout.duration || 0), 0);
  };

  const getAverageDuration = () => {
    if (workouts.length === 0) return 0;
    return (getTotalWorkoutTime() / workouts.length).toFixed(2);
  };

  const menuItems = [
    { icon: "person-outline", title: "Edit Profile", subtitle: "Update your personal information" },
    { icon: "notifications-outline", title: "Notifications", subtitle: "Manage your notification preferences" },
    { icon: "settings-outline", title: "Preferences", subtitle: "Customize your app experience" },
    { icon: "help-circle-outline", title: "Help & Support", subtitle: "Get help and contact support" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View className="bg-white px-6 py-8">
          <View className="items-center mb-6">
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                className="w-24 h-24 rounded-full mb-4"
                resizeMode="cover"
              />
            ) : (
              <View className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full items-center justify-center mb-4">
                <Ionicons name="person" size={40} color="white" />
              </View>
            )}
            
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              {user?.fullName || "User"}
            </Text>
            <Text className="text-gray-600 mb-2">
              {user?.emailAddresses[0]?.emailAddress}
            </Text>
            <Text className="text-sm text-gray-500">
              Joined {user?.createdAt ? formatJoinDate(user.createdAt) : "Recently"}
            </Text>
          </View>
        </View>

        {/* Fitness Stats Section */}
        <View className="px-6 py-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Fitness Stats</Text>
          
          {loading ? (
            <View className="bg-white rounded-2xl p-6 items-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-600 mt-2">Loading stats...</Text>
            </View>
          ) : (
            <>
              {/* Main Stats Grid */}
              <View className="flex-row mb-4 gap-3">
                <View className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <View className="items-center">
                    <Ionicons name="fitness" size={32} color="#3B82F6" />
                    <Text className="text-2xl font-bold text-gray-900 mt-2">
                      {workouts.length}
                    </Text>
                    <Text className="text-gray-600 text-center text-sm">
                      Total Workouts
                    </Text>
                  </View>
                </View>
                
                <View className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <View className="items-center">
                    <Ionicons name="time" size={32} color="#10B981" />
                    <Text className="text-2xl font-bold text-gray-900 mt-2">
                      {formatDuration(getTotalWorkoutTime()).split(' ')[0]}
                    </Text>
                    <Text className="text-gray-600 text-center text-sm">
                      Total Time
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row mb-6 gap-3">
                <View className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <View className="items-center">
                    <Ionicons name="calendar" size={32} color="#F59E0B" />
                    <Text className="text-2xl font-bold text-gray-900 mt-2">
                      {getDaysSinceJoining()}
                    </Text>
                    <Text className="text-gray-600 text-center text-sm">
                      Days Since Joining
                    </Text>
                  </View>
                </View>
                
                <View className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <View className="items-center">
                    <Ionicons name="trending-up" size={32} color="#8B5CF6" />
                    <Text className="text-2xl font-bold text-gray-900 mt-2">
                      {workouts.length > 0 ? formatDuration(getAverageDuration()).split(' ')[0] : '0'}
                    </Text>
                    <Text className="text-gray-600 text-center text-sm">
                      Avg Duration
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Account Settings Section */}
        <View className="px-6 pb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Account Settings</Text>
          
          <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className={`p-6 flex-row items-center ${
                  index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
                }`}
                activeOpacity={0.7}
                onPress={() => {
                  // TODO: Implement navigation to respective settings pages
                  Alert.alert("Coming Soon", `${item.title} functionality will be available soon.`);
                }}
              >
                <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4">
                  <Ionicons name={item.icon as any} size={24} color="#6B7280" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900 mb-1">
                    {item.title}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {item.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-600 rounded-xl py-4 shadow-sm mt-6"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text className="text-white font-semibold text-lg ml-2">
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
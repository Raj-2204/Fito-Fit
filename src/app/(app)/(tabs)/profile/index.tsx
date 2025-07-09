import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View, Alert } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

export default function Page() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        {
          text:"Cancel",
          style:"cancel"
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => signOut()
        }
      ])
      
    } catch (error) {
      Alert.alert("Error", "Failed to sign out. Please try again.");
      console.error("Sign out error:", error);
    }
  };

  return (
    <SafeAreaView className="flex flex-1 bg-gray-50">
      <View className="flex-1 px-6 py-8">
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">Profile</Text>
          <Text className="text-gray-600 text-center">
            Manage your account settings
          </Text>
        </View>

        <View className="flex-1">
          {/* Profile content can go here */}
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Account Settings
            </Text>
            <Text className="text-gray-600">
              Your profile settings and preferences will appear here.
            </Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-600 rounded-xl py-4 shadow-sm"
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
      </View>
    </SafeAreaView>
  );
}

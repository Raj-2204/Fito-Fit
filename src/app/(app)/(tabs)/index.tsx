import React, { useState } from "react";
import { SafeAreaView, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { client } from "@/lib/sanity/client";
import { GetWorkoutQueryResult } from "@/lib/sanity/types";
import { getWorkoutQuery } from "./history/history";
import { formatDuration } from "lib/utils";
import { useFocusEffect, useRouter } from "expo-router";

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
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

  const getTotalWorkoutTime = () => {
    return workouts.reduce((total, workout) => total + (workout.duration || 0), 0);
  };

  const getAverageDuration = () => {
    if (workouts.length === 0) return 0;
    return getTotalWorkoutTime() / workouts.length;
  };

  const getDaysSinceJoining = () => {
    if (!user?.createdAt) return 0;
    const joinDate = typeof user.createdAt === 'string' ? new Date(user.createdAt) : user.createdAt;
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getLastWorkout = () => {
    return workouts.length > 0 ? workouts[0] : null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
      });
    }
  };

  const getTotalExercises = (workout: any) => {
    return workout.sets?.reduce((total: number, set: any) => {
      return total + (set.exercises?.length || 0);
    }, 0) || 0;
  };

  const getExerciseNames = (workout: any) => {
    const exerciseNames: string[] = [];
    workout.sets?.forEach((set: any) => {
      set.exercises?.forEach((exercise: any) => {
        if (exercise.exercise?.name && !exerciseNames.includes(exercise.exercise.name)) {
          exerciseNames.push(exercise.exercise.name);
        }
      });
    });
    return exerciseNames;
  };

  const quickActions = [
    {
      icon: "fitness",
      title: "Start Workout",
      subtitle: "Begin a new workout session",
      color: "#3B82F6",
      bgColor: "#EFF6FF",
      onPress: () => router.push("/(app)/(tabs)/active-workout")
    },
    {
      icon: "time",
      title: "Workout History",
      subtitle: "View your past workouts",
      color: "#10B981",
      bgColor: "#F0FDF4",
      onPress: () => router.push("/(app)/(tabs)/history/history")
    },
    {
      icon: "barbell",
      title: "Browse Exercises",
      subtitle: "Explore exercise library",
      color: "#8B5CF6",
      bgColor: "#F5F3FF",
      onPress: () => router.push("/(app)/(tabs)/exercises")
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white px-6 py-8">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || "User"}!
          </Text>
          <Text className="text-gray-600">
            Ready for your next workout?
          </Text>
        </View>

        {/* Stats Section */}
        <View className="px-6 py-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Your Progress</Text>
          
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

        {/* Quick Actions */}
        <View className="px-6 pb-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>
          
          <View className="gap-3">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={action.onPress}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-row items-center"
                activeOpacity={0.7}
              >
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: action.bgColor }}
                >
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900 mb-1">
                    {action.title}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {action.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Last Workout Section */}
        {!loading && getLastWorkout() && (
          <View className="px-6 pb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Last Workout</Text>
            
            <TouchableOpacity
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              activeOpacity={0.7}
              onPress={() => 
                router.push({
                  pathname: "/history/workout-record",
                  params: { workoutId: getLastWorkout()?._id }
                })
              }
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    {formatDate(getLastWorkout()?.date || "")}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 ml-2">
                      {formatDuration(getLastWorkout()?.duration || 0)}
                    </Text>
                  </View>
                </View>
                <View className="bg-blue-100 rounded-full w-12 h-12 items-center justify-center">
                  <Ionicons name="fitness-outline" size={24} color="#3B82F6" />
                </View>
              </View>

              <View className="mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="bg-gray-100 rounded-lg px-3 py-2 mr-3">
                    <Text className="text-sm font-medium text-gray-700">
                      {getTotalExercises(getLastWorkout())} exercises
                    </Text>
                  </View>
                  <View className="bg-gray-100 rounded-lg px-3 py-2">
                    <Text className="text-sm font-medium text-gray-700">
                      {getLastWorkout()?.sets?.length || 0} sets
                    </Text>
                  </View>
                </View>
                
                {/* Exercise Names */}
                <View className="flex-row flex-wrap">
                  {getExerciseNames(getLastWorkout()).slice(0, 3).map((exerciseName: string, index: number) => (
                    <View key={index} className="bg-blue-50 rounded-full px-3 py-1 mr-2 mb-2">
                      <Text className="text-xs font-medium text-blue-700">
                        {exerciseName}
                      </Text>
                    </View>
                  ))}
                  {getExerciseNames(getLastWorkout()).length > 3 && (
                    <View className="bg-gray-50 rounded-full px-3 py-1 mr-2 mb-2">
                      <Text className="text-xs font-medium text-gray-600">
                        +{getExerciseNames(getLastWorkout()).length - 3} more
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State for No Workouts */}
        {!loading && workouts.length === 0 && (
          <View className="px-6 pb-6">
            <View className="bg-white rounded-2xl p-8 items-center">
              <Ionicons name="barbell-outline" size={64} color="#9CA3AF" />
              <Text className="text-xl font-semibold text-gray-900 mt-4">
                Start Your Fitness Journey
              </Text>
              <Text className="text-gray-600 text-center mt-2 mb-6">
                Complete your first workout to see your progress here
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(app)/(tabs)/active-workout")}
                className="bg-blue-600 rounded-xl py-3 px-6"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold">
                  Start First Workout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
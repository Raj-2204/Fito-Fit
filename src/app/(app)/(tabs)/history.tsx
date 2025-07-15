import { defineQuery } from "groq";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { client } from "@/lib/sanity/client";
import { useUser } from "@clerk/clerk-expo";
import { GetWorkoutQueryResult, Workout } from "@/lib/sanity/types";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { formatDuration } from "lib/utils";
import { Ionicons } from "@expo/vector-icons";

export const getWorkoutQuery = defineQuery(`*[_type == "workout" && userId == $userId] | order(date desc) {
  _id,
  date,
  duration,
  sets[]{
    setNumber,
    exercises[]{
      exercise->{
        _id,
        name
      },
      reps,
      weight,
      weightUnit,
      _key
    },
    _key
  }
}`)

export default function HistoryPage() {
  const {user} = useUser();
  const [workouts, setWorkouts] = useState<GetWorkoutQueryResult>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefershing] = useState(true)
  const {refresh} = useLocalSearchParams();
  const router = useRouter();

  console.log(user.id)
  const fetchWorkouts = async () => {
    if(!user?.id) return;
    try{
      const results = await client.fetch(getWorkoutQuery, { userId: user.id })
      setWorkouts(results);
    }catch(error){
      console.error("Error fetching workouts:", error)
    }finally{
      setLoading(false);
      setRefershing(false);
    }
  }
  useEffect(()=> {
    fetchWorkouts();
  }, [user?.id])

  useEffect(() =>{
    if(refresh === "true"){
      fetchWorkouts();
      router.replace("/(apps)/(tabs)/history")
    }
  }, [refresh]);

  const onRefresh = () =>{
    setRefershing(true);
    fetchWorkouts();
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate()-1)

    if(date.toDateString() === today.toDateString()){
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()){
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
      })
    }
  };
  const getTotalExercises = (workout: any) => {
    return workout.sets?.reduce((total: number, set: any) => {
      return total + (set.exercises?.length || 0)
    }, 0) || 0
  }
  
  const getTotalSets = (workout: any) => {
    return workout.sets?.length || 0
  }
  const formatWorkoutDuration = (seconds?: number) =>{
    if(!seconds) return "Duration not recorded";
    return formatDuration(seconds);
  }
  if(loading){
    return(
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">
            Workout History
          </Text>  
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6"/>
          <Text className="text-gray-600 mt-4"> Loading your workouts</Text>
        </View>
      </SafeAreaView>
    )
  }
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">
          Workout History
        </Text>
        <Text className="text-gray-600 mt-1">
          {workouts.length} workout{workouts.length !== 1 ? "s": ""} completed
        </Text>
      </View>
      <ScrollView
        className="flex-1"

        contentContainerStyle={{padding:24}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {workouts.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center">
            <Ionicons name ="barbell-outline" size={64} color="#9CA3AF"/>
            <Text className="text-xl font-semibold text-gray-900 mt-4">
              No workouts yet
            </Text>
            <Text className="text-gray-600 text-center mt-2">
              Your completed workouts will appear here
            </Text>
          </View>
        ):(
          <View className="space-y-4 gap-4"
          >{
            workouts.map((workout)=>(
              <TouchableOpacity
                key={workout._id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                activeOpacity={0.7}
                onPress={()=>
                  router.push({
                    pathname: "/history/workout-record",
                    params: {
                      workoutId: workout._id
                    }
                  })
                }
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900">
                      {formatDate(workout.date || "")}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="time-outline" size={16} color="#6B7280"/>
                      <Text className="text-gray-600 ml-2">
                        {formatWorkoutDuration(workout.duration)}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-blue-100 rounded-full w-12 h-12 items-center justify-center">
                    <Ionicons name="fitness-outline" size={24} color="#3B82F6" />
                  </View>
                </View>
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <View className="bg-gray-100 rounded-lg px-3 py-2 mr-3">
                      <Text className="text-sm font-medium text-gray-700">
                        {getTotalExercises(workout)} exercises                     
                      </Text>
                    </View>
                    <View className="bg-gray-100 rounded-lg px-3 py-2">
                      <Text className="text-sm font-medium text-gray-700">
                        {getTotalSets(workout)} sets
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          }</View>
        )}

      </ScrollView>
      
    </SafeAreaView>
  );
}

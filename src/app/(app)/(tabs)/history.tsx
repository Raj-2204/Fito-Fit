import { defineQuery } from "groq";
import React, { useEffect, useState } from "react";
import { SafeAreaView, Text } from "react-native";
import { client } from "@/lib/sanity/client";
import { useUser } from "@clerk/clerk-expo";
import { GetWorkoutQueryResult, Workout } from "@/lib/sanity/types";
import { router, useLocalSearchParams } from "expo-router";

export const getWorkoutQuery = defineQuery(`*[_type == "workout" && userId == $userId] | order(date desc) {
  _id,
  date,
  duration,
  exercises[]{
    exercise->{
    _id,
    name
    },
    sets[]{
      reps,
      weight,
      weightUnit,
      _type,
      _key
    },
    _type,
    _key
  }
}`)

export default function HistoryPage() {
  const {user} = useUser();
  const [workouts, setWorkouts] = useState<GetWorkoutQueryResult>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefershing] = useState(true)
  const {refresh} = useLocalSearchParams();

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
  return (
    <SafeAreaView className="flex flex-1">
      <Text>History</Text>
    </SafeAreaView>
  );
}

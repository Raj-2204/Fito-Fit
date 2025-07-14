import { View, Text, TextInput, TouchableOpacity, Touchable, FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

import { defineQuery } from 'groq'
import {client} from "@/lib/sanity/client"
import groq from 'groq';
import { Exercise } from '@/lib/sanity/types';
import ExerciseCard from '@/app/components/ExerciseCard';

export const exerciseQuery = defineQuery(`*[_type == "exercise"]{
  ...
}`);


const Exercises = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const[refreshing, setRefershing] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilterExercises] = useState([]);
  const onRefresh = async () =>{
    setRefershing(true);
    await fetchExercises();
    setRefershing(false);
  }
  const fetchExercises = async() =>{
    try{
      const exercises = await client.fetch(exerciseQuery);
      setExercises(exercises);
      setFilterExercises(exercises);
    }catch(error){
      console.error("error fetching exercises", error)
    }
  }
  useEffect(()=> {fetchExercises()}, [])
  useEffect(()=>{
    const filtered = exercises.filter((exercise: Exercise) =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()))
    setFilterExercises(filtered)
  }, [searchQuery, exercises])
  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
        <View className='px-6 py-4 bg-white border-b border-gray-200'>
          <Text className='text-2xl font-bold text-gray-900'>
            Exercise Library
          </Text>
          <Text className='text-gray-600 mt-1'>
            Discover and master new exercises
          </Text>
          <View className='flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mt-4'>
            <Ionicons name='search' size={20} color="#6B7280"/>
            <TextInput 
            className='flex-1 ml-3 text-gray-800'
            placeholder='Search exercises..'
            placeholderTextColor='black'
            value={searchQuery}
            onChangeText={setSearchQuery}/>
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={()=> setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#6B7280"/>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <FlatList
        data ={filteredExercises}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{padding: 24}}
        renderItem ={
          (
            {item}
          )=>(
          <ExerciseCard
          item ={item}
          onPress = {()=> router.push(`/exercise-detail?id=${item._id}`)}/>
        )}
        refreshControl={
          <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#3B82F6"]}
          tintColor="#3B82F6"
          title="Pull to refresh"
          titleColor="#6B7280"
          />
        }
        ListEmptyComponent={
          <View className='bg-white rounded-2xl p-8 items-center'>
           <Ionicons name='fitness-outline' size={64} color="#9CA3AF"/> 
           <Text className='text-xl font-semibold text-gray-900 mt-4'>
            {searchQuery ? "No exercises found ": "Loading exercises...."}
           </Text>
           <Text className='text-gray-600 text center mt-2'>
            {
              searchQuery ? "Try adjusting your search": "Your exercises will appear here"
            }

           </Text>
          </View>
        }
        />
    </SafeAreaView>
  )
}

export default Exercises
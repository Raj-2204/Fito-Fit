import { View, Text, StatusBar, TouchableOpacity, ScrollView, Image, Linking, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { client, urlFor } from '@/lib/sanity/client'
import { Exercise } from '@/lib/sanity/types'
import { defineQuery } from 'groq'
import { generateExerciseGuidance } from '@/lib/ai/googleAI'

const exerciseDetailQuery = defineQuery(`*[_type == "exercise" && _id == $id][0]{
  ...
}`);

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiGuidance, setAiGuidance] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  useEffect(() => {
    const fetchExercise = async () => {
      if (!id) return;
      try {
        const exerciseData = await client.fetch(exerciseDetailQuery, { id });
        setExercise(exerciseData);
      } catch (error) {
        console.error('Error fetching exercise:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Exercise not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAIGuidance = async () => {
    if (!exercise?.name) return;
    
    setLoadingAI(true);
    try {
      const guidance = await generateExerciseGuidance(exercise.name, exercise.description);
      setAiGuidance(guidance);
      setShowGuidance(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate AI guidance. Please check your internet connection and try again.');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Exercise Details</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Exercise Image */}
        {exercise.image?.asset && (
          <View className="h-64 bg-gray-100">
            <Image 
              source={{ uri: urlFor(exercise.image?.asset?._ref).url() }} 
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        )}

        <View className="p-6">
          {/* Exercise Name & Difficulty */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-3">
              {exercise.name}
            </Text>
            {exercise.difficulty && (
              <View className="self-start">
                <Text className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getDifficultyColor(exercise.difficulty)}`}>
                  {exercise.difficulty}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {exercise.description && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Description
              </Text>
              <Text className="text-gray-600 leading-6">
                {exercise.description}
              </Text>
            </View>
          )}

          {/* Video URL */}
          {exercise.videoURL && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Video Tutorial
              </Text>
              <TouchableOpacity className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex-row items-center"
              onPress={()=> Linking.openURL(exercise.videoURL)}>
                <Ionicons name="play-circle" size={24} color="#3B82F6" />
                <Text className="ml-3 text-blue-600 font-medium">
                  Watch Exercise Video
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* AI Guidance Section */}
          {showGuidance && aiGuidance && (
            <View className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="sparkles" size={20} color="#7C3AED" />
                <Text className="ml-2 text-lg font-semibold text-purple-900">
                  AI Guidance
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowGuidance(false)}
                  className="ml-auto p-1"
                >
                  <Ionicons name="close" size={20} color="#7C3AED" />
                </TouchableOpacity>
              </View>
              <Text className="text-purple-800 leading-6">
                {aiGuidance}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="mt-8 space-y-3">
            <TouchableOpacity 
              className="bg-purple-600 rounded-xl py-4 items-center flex-row justify-center"
              onPress={handleAIGuidance}
              disabled={loadingAI}
            >
              {loadingAI ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="white" />
                  <Text className="ml-2 text-white font-semibold text-lg">
                    Get AI Guidance
                  </Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-blue-600 rounded-xl py-4 items-center">
              <Text className="text-white font-semibold text-lg">
                Add to Workout
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="bg-gray-100 rounded-xl py-4 items-center">
              <Text className="text-gray-700 font-semibold text-lg">
                Mark as Favorite
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { client, adminClient } from '@/lib/sanity/client'
import { useUser } from '@clerk/clerk-expo'
import { defineQuery } from 'groq'
import { formatDuration } from 'lib/utils'

const workoutDetailQuery = defineQuery(`*[_type == "workout" && _id == $workoutId][0]{
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
}`);

function WorkoutRecord() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const router = useRouter();
  const { user } = useUser();
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!workoutId) return;
      try {
        const workoutData = await client.fetch(workoutDetailQuery, { workoutId });
        setWorkout(workoutData);
      } catch (error) {
        console.error('Error fetching workout:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [workoutId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalVolume = () => {
    let totalVolume = 0;
    workout?.sets?.forEach((set: any) => {
      set.exercises?.forEach((exercise: any) => {
        const weight = exercise.weight || 0;
        const reps = exercise.reps || 0;
        totalVolume += weight * reps;
      });
    });
    return totalVolume;
  };

  const getTotalSets = () => {
    return workout?.sets?.length || 0;
  };

  const getUniqueExercises = () => {
    const exercises: any[] = [];
    const exerciseMap = new Map();

    workout?.sets?.forEach((set: any) => {
      set.exercises?.forEach((exercise: any) => {
        const exerciseId = exercise.exercise?._id;
        if (exerciseId && !exerciseMap.has(exerciseId)) {
          exerciseMap.set(exerciseId, {
            ...exercise.exercise,
            sets: []
          });
          exercises.push(exerciseMap.get(exerciseId));
        }
        if (exerciseId) {
          exerciseMap.get(exerciseId).sets.push({
            setNumber: set.setNumber,
            reps: exercise.reps,
            weight: exercise.weight,
            weightUnit: exercise.weightUnit
          });
        }
      });
    });

    return exercises;
  };

  const handleDeleteWorkout = () => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    if (!workoutId || !user?.id) return;
    
    setDeleting(true);
    try {
      // First verify the workout belongs to the current user
    //   if (workout.userId !== user.id) {
    //     Alert.alert('Error', 'You can only delete your own workouts.');
    //     return;
    //   }
      
      await adminClient.delete(workoutId);
      Alert.alert(
        'Success',
        'Workout deleted successfully',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(app)/(tabs)/history')
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting workout:', error);
      Alert.alert('Error', 'Failed to delete workout. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading workout details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">Workout not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header with Delete Button */}
      <View className="bg-white px-6 py-4 border-b border-gray-200 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">Workout Details</Text>
        </View>
        <TouchableOpacity
          onPress={handleDeleteWorkout}
          disabled={deleting}
          className="bg-red-50 px-4 py-2 rounded-lg flex-row items-center"
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text className="ml-2 text-red-600 font-medium">Delete</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Workout Summary Header */}
        <View className="bg-white p-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {formatDate(workout.date)}
          </Text>
          <Text className="text-gray-600 mb-4">
            Started at {formatTime(workout.date)}
          </Text>
          
          {/* Stats Grid */}
          <View className="flex-row justify-between">
            <View className="items-center">
              <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                <Ionicons name="time-outline" size={24} color="#3B82F6" />
              </View>
              <Text className="text-sm text-gray-600">Duration</Text>
              <Text className="font-semibold text-gray-900">
                {formatDuration(workout.duration)}
              </Text>
            </View>
            
            <View className="items-center">
              <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                <Ionicons name="fitness-outline" size={24} color="#10B981" />
              </View>
              <Text className="text-sm text-gray-600">Exercises</Text>
              <Text className="font-semibold text-gray-900">
                {getUniqueExercises().length}
              </Text>
            </View>
            
            <View className="items-center">
              <View className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                <Ionicons name="layers-outline" size={24} color="#8B5CF6" />
              </View>
              <Text className="text-sm text-gray-600">Sets</Text>
              <Text className="font-semibold text-gray-900">
                {getTotalSets()}
              </Text>
            </View>
            
            <View className="items-center">
              <View className="bg-orange-100 w-12 h-12 rounded-full items-center justify-center mb-2">
                <Ionicons name="barbell-outline" size={24} color="#F59E0B" />
              </View>
              <Text className="text-sm text-gray-600">Volume</Text>
              <Text className="font-semibold text-gray-900">
                {getTotalVolume().toLocaleString()}
              </Text>
              <Text className="text-xs text-gray-500">lbs</Text>
            </View>
          </View>
        </View>

        {/* Exercise Details */}
        <View className="p-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Exercises
          </Text>
          
          {getUniqueExercises().map((exercise, index) => (
            <View key={exercise._id} className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                {exercise.name}
              </Text>
              
              {/* Sets Table Header */}
              <View className="flex-row border-b border-gray-200 pb-2 mb-3">
                <Text className="flex-1 text-sm font-medium text-gray-600 text-center">
                  Set
                </Text>
                <Text className="flex-1 text-sm font-medium text-gray-600 text-center">
                  Weight
                </Text>
                <Text className="flex-1 text-sm font-medium text-gray-600 text-center">
                  Reps
                </Text>
                <Text className="flex-1 text-sm font-medium text-gray-600 text-center">
                  Volume
                </Text>
              </View>
              
              {/* Sets Data */}
              {exercise.sets.map((set: any, setIndex: number) => {
                const volume = (set.weight || 0) * (set.reps || 0);
                return (
                  <View key={setIndex} className="flex-row py-2 border-b border-gray-100 last:border-b-0">
                    <Text className="flex-1 text-center text-gray-900">
                      {set.setNumber || setIndex + 1}
                    </Text>
                    <Text className="flex-1 text-center text-gray-900">
                      {set.weight || 0} {set.weightUnit || 'lbs'}
                    </Text>
                    <Text className="flex-1 text-center text-gray-900">
                      {set.reps || 0}
                    </Text>
                    <Text className="flex-1 text-center text-gray-700 font-medium">
                      {volume.toLocaleString()}
                    </Text>
                  </View>
                );
              })}
              
              {/* Exercise Summary */}
              <View className="mt-4 pt-3 border-t border-gray-200">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">
                    Total Sets: {exercise.sets.length}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Exercise Volume: {exercise.sets.reduce((total: number, set: any) => total + ((set.weight || 0) * (set.reps || 0)), 0).toLocaleString()} lbs
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default WorkoutRecord

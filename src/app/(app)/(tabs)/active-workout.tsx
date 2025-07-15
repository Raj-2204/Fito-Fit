import { View, Text, StatusBar, Platform, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, TextInput, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import {useStopwatch} from "react-timer-hook"
import { useWorkoutStore } from 'store/workout-store'
import { useRouter, useFocusEffect } from 'expo-router'
import workout from 'sanity/schemaTypes/workout'
import { Ionicons } from '@expo/vector-icons'
import ExerciseSelectionModal from '@/app/components/ExerciseSelectionModal'
import { adminClient } from '@/lib/sanity/client'
import { useUser } from '@clerk/clerk-expo'

const Workout = () => {
  const[showExeciseSelection, setShowExerciseSelection] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useUser();
  const {seconds, minutes, hours, totalSeconds, reset} = useStopwatch({
    autoStart: true,
  })
  const {
    workoutExercises,
    setWorkoutExercises,
    resetWorkout,
    removeExerciseFromWorkout,
    addSetToExercise,
    removeSetFromExercise,
    updateSetInExercise,
    weightUnit,
    setWeightUnit
  } = useWorkoutStore();
  const getWorkoutDuration = () => {
    return `${minutes.toString().padStart(2, "0")}: ${
      seconds.toString().padStart(2, "0")
    }`
  }
  useFocusEffect(
    React.useCallback(()=>{
      if(workoutExercises.length === 0){
        reset();
      }
    }, [workoutExercises.length, reset])
  )
  const router = useRouter();
  const cancelWorkout = () =>{
    Alert.alert(
      "Cancel Workout",
      "Are you sure you want to cancel workout?",
      [
        {text : "No", style : "cancel"},
        {
          text: "End workout",
          onPress: () => {
            resetWorkout();
            router.back();
          }
        }
      ]
    )
  }
  const addExercise = () =>{
    setShowExerciseSelection(true);
  }
  
  const deleteExercise = (exerciseId: string) => {
    Alert.alert(
      "Delete Exercise",
      "Are you sure you want to delete this exercise?",
      [
        {text: "Cancel", style: "cancel"},
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeExerciseFromWorkout(exerciseId)
        }
      ]
    );
  }
  
  const navigateToExerciseDetail = (sanityId: string) => {
    router.push(`/exercise-details?id=${sanityId}`);
  }
  
  const deleteSet = (exerciseId: string, setId: string) => {
    Alert.alert(
      "Delete Set",
      "Are you sure you want to delete this set?",
      [
        {text: "Cancel", style: "cancel"},
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeSetFromExercise(exerciseId, setId)
        }
      ]
    );
  }

  const completeWorkout = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    if (workoutExercises.length === 0) {
      Alert.alert("No Exercises", "Add at least one exercise to complete the workout");
      return;
    }

    Alert.alert(
      "Complete Workout",
      "Are you sure you want to finish this workout?",
      [
        {text: "Cancel", style: "cancel"},
        {
          text: "Complete",
          onPress: async () => {
            setSaving(true);
            try {
              // Transform the workout data to match Sanity schema
              const workoutData = {
                _type: "workout",
                userId: user.id,
                date: new Date().toISOString(),
                duration: totalSeconds,
                sets: workoutExercises.map((exercise, exerciseIndex) => ({
                  _key: `set-${exerciseIndex}`,
                  setNumber: exerciseIndex + 1,
                  exercises: exercise.sets.map((set, setIndex) => ({
                    _key: `exercise-${exerciseIndex}-${setIndex}`,
                    exercise: {
                      _type: "reference",
                      _ref: exercise.sanity
                    },
                    reps: parseInt(set.reps) || 0,
                    weight: parseFloat(set.weight) || 0,
                    weightUnit: set.weightUnit
                  }))
                }))
              };

              await adminClient.create(workoutData);
              
              // Reset workout and navigate to history
              resetWorkout();
              router.push("/(app)/(tabs)/history/history?refresh=true");
            } catch (error) {
              console.error("Error saving workout:", error);
              Alert.alert("Error", "Failed to save workout. Please try again.");
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  }
  return (
    <View className='flex-1'>
      <StatusBar barStyle='light-content' backgroundColor="#1F2937" />
      <View
      className='bg-gray-800' style={{
        paddingTop: Platform.OS === "ios" ? 55 : StatusBar.currentHeight || 0
      }} />
        <View className='bg-gray-800 px-6 py-4'>
          <View className='flex-row items-center justify-between'>
            <View>
              <Text className='text-whit text-xl font-semibold'>
                Active Workout
              </Text>
              <Text className='text-gray-300'>{getWorkoutDuration()}</Text>
            </View>
            <View className='flex-row items-center space-x-3 gap-2'>
              <View className='flex-row bg-gray-700 rounded-lg p-1'>
                <TouchableOpacity
                onPress={() => setWeightUnit("lbs")}
                className={`px-3 py-1 rounded ${
                  weightUnit === "lbs" ? "bg-blue-600" : ""
                }`}
                >
                  <Text className={`text-sm font-medium
                    ${weightUnit === "lbs" ? "text-white" : "text-gray-300"}`}>
                      lbs
                    </Text>
              
                </TouchableOpacity>
                <TouchableOpacity
                onPress={() => setWeightUnit("kg")}
                className={`px-3 py-1 rounded ${
                  weightUnit === "kg" ? "bg-blue-600" : ""
                }`}
                >
                  <Text className={`text-sm font-medium
                    ${weightUnit === "kg" ? "text-white" : "text-gray-300"}`}>
                      kg
                    </Text>
              
                </TouchableOpacity>
              </View>
              <TouchableOpacity
              onPress={cancelWorkout}
              className='bg-red-600 px-4 py-2 rounded-lg'>
                <Text className='text-white font-medium'>End Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View className='flex-1 bg-white'>
        <View className='px-5 mt-4'>
          <Text className='text-center text-gray-600 mb-2'>
            {workoutExercises.length} exercises
          </Text>
        </View>
        {workoutExercises.length === 0 && (
          <View className='flex-1 justify-center items-center px-6'>
            <Ionicons name='barbell-outline' size={100} color="#9CA3AF"/>
            <Text className='text-gray-400 text-lg font-medium text-center mb-2'>
              No exercises added yet
            </Text>
            <Text className='text-gray-500 text-center'>
              Add exercises to start your workout
            </Text>
          </View>
        )}
        <KeyboardAvoidingView
        behavior={Platform.OS == "ios"? "padding": "height"}
        className='flex-1'>
            <ScrollView className='flex-1 px-1 mt-4'>
              {workoutExercises.map((exercise)=>(
                <View key={exercise.id} className='mb-8'>
                    {/*Exercise Header */}
                    <View className='bg-white rounded-lg p-4 mx-4 shadow-sm border border-gray-100'>
                      <View className='flex-row items-center justify-between'>
                        <TouchableOpacity 
                          onPress={() => navigateToExerciseDetail(exercise.sanity)}
                          className='flex-1'
                        >
                          <View className='flex-row items-center'>
                            <View className='flex-1'>
                              <Text className='text-lg font-semibold text-gray-900'>
                                {exercise.name}
                              </Text>
                              <Text className='text-gray-500 text-sm'>
                                {exercise.sets.length} sets
                              </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => deleteExercise(exercise.id)}
                          className='ml-3 p-2'
                        >
                          <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                      
                      {/* Exercise Sets */}
                      <View className='mt-4'>
                        {exercise.sets.length === 0 ? (
                          <View className='items-center py-6'>
                            <Text className='text-gray-500 text-base mb-2'>
                              No sets yet
                            </Text>
                            <Text className='text-gray-400 text-sm mb-4'>
                              Add your first set below
                            </Text>
                            <TouchableOpacity
                              onPress={() => addSetToExercise(exercise.id)}
                              className='bg-blue-600 rounded-lg px-6 py-3'
                            >
                              <View className='flex-row items-center'>
                                <Ionicons name='add' size={16} color="white" style={{marginRight: 6}}/>
                                <Text className='text-white font-medium'>Add Set</Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <>
                            {/* Sets Header */}
                            <View className='flex-row bg-gray-50 p-3 rounded-lg mb-2'>
                              <Text className='flex-1 text-center text-gray-600 font-medium text-sm'>Set</Text>
                              <Text className='flex-1 text-center text-gray-600 font-medium text-sm'>Reps</Text>
                              <Text className='flex-1 text-center text-gray-600 font-medium text-sm'>Weight ({weightUnit})</Text>
                              <View className='w-8' />
                              <View className='w-8' />
                            </View>
                            
                            {/* Sets List */}
                            {exercise.sets.map((set, index) => (
                              <View key={set.id} className={`flex-row items-center p-3 border-b border-gray-100 last:border-b-0 ${
                                set.isCompleted ? 'bg-green-50' : 'bg-white'
                              }`}>
                                <Text className='flex-1 text-center text-gray-900 font-medium'>
                                  {index + 1}
                                </Text>
                                <View className='flex-1 items-center'>
                                  <TextInput
                                    value={set.reps}
                                    onChangeText={(text) => updateSetInExercise(exercise.id, set.id, { reps: text })}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    className='bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center text-gray-900 w-16'
                                    placeholderTextColor="#9CA3AF"
                                  />
                                </View>
                                <View className='flex-1 items-center'>
                                  <TextInput
                                    value={set.weight}
                                    onChangeText={(text) => updateSetInExercise(exercise.id, set.id, { weight: text })}
                                    placeholder="0"
                                    keyboardType="numeric"
                                    className='bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center text-gray-900 w-16'
                                    placeholderTextColor="#9CA3AF"
                                  />
                                </View>
                                <View className='w-8 items-center'>
                                  <TouchableOpacity
                                    onPress={() => updateSetInExercise(exercise.id, set.id, { isCompleted: !set.isCompleted })}
                                  >
                                    <View className={`w-5 h-5 rounded-full border-2 ${
                                      set.isCompleted 
                                        ? 'bg-green-500 border-green-500' 
                                        : 'border-gray-300'
                                    }`}>
                                      {set.isCompleted && (
                                        <View className='flex-1 items-center justify-center'>
                                          <Ionicons name="checkmark" size={12} color="white" />
                                        </View>
                                      )}
                                    </View>
                                  </TouchableOpacity>
                                </View>
                                <View className='w-8 items-center'>
                                  <TouchableOpacity
                                    onPress={() => deleteSet(exercise.id, set.id)}
                                    className='p-1'
                                  >
                                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            ))}
                            
                            {/* Add Set Button */}
                            <TouchableOpacity
                              onPress={() => addSetToExercise(exercise.id)}
                              className='bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg py-3 mt-3 items-center'
                            >
                              <View className='flex-row items-center'>
                                <Ionicons name='add' size={16} color="#3B82F6" style={{marginRight: 6}}/>
                                <Text className='text-blue-600 font-medium'>Add Set</Text>
                              </View>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </View>
                </View>
                ))}
              <TouchableOpacity
              onPress={addExercise}
              className='bg-blue-600 rounded-2xl py-4 items-center mb-4 active:bg-blue-700'>
                <View className='flex-row items-center'>
                  <Ionicons name='add' size={20} color="white" style={{marginRight: 8}}/>
                  <Text className='text-white font-semibold text-lg'>Add Exercise</Text>
                </View>
              </TouchableOpacity>
              
              {workoutExercises.length > 0 && (
                <TouchableOpacity
                  onPress={completeWorkout}
                  disabled={saving}
                  className={`rounded-2xl py-4 items-center mb-8 ${
                    saving ? 'bg-gray-400' : 'bg-green-600 active:bg-green-700'
                  }`}>
                  <View className='flex-row items-center'>
                    {saving ? (
                      <ActivityIndicator color="white" size="small" style={{marginRight: 8}} />
                    ) : (
                      <Ionicons name='checkmark-circle' size={20} color="white" style={{marginRight: 8}}/>
                    )}
                    <Text className='text-white font-semibold text-lg'>
                      {saving ? 'Saving...' : 'Complete Workout'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </ScrollView>
        </KeyboardAvoidingView>
        </View>
        <ExerciseSelectionModal visible={showExeciseSelection}
        onClose={() => setShowExerciseSelection(false)}/>
      </View>
    
  )
}

export default Workout
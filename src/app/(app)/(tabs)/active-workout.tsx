import { View, Text, StatusBar, Platform, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView } from 'react-native'
import React from 'react'
import {useStopwatch} from "react-timer-hook"
import { useWorkoutStore } from 'store/workout-store'
import { useRouter, useFocusEffect } from 'expo-router'
import workout from 'sanity/schemaTypes/workout'
import { Ionicons } from '@expo/vector-icons'

const Workout = () => {
  const {seconds, minutes, hours, totalSeconds, reset} = useStopwatch({
    autoStart: true,
  })
  const {
    workoutExercises,
    setWorkoutExercises,
    resetWorkout,
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
                      lbs
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

                </View>
                ))}
              <TouchableOpacity
              onPress={addExercise}
              className='bg-blue-600 rounded-2xl py-4 items-center mb-8 active:bg-blue-700'>
                <View className='flex-row items-center'>
                  <Ionicons name='add' size={20} color="white" style={{marginRight: 8}}/>
                  <Text className='text-whit font-semibol text-lg'>Add Exercise</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
        </View>
        <ExerciseSelectionModal visible={showExeciseSelection}
        onClose={() => setShowExerciseSelection(false)}/>
      </View>
    
  )
}

export default Workout
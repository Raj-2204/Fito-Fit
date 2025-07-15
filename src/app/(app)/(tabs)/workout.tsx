import React from 'react'
import { SafeAreaView, Text, View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

function Workout() {
  const router = useRouter();

  const startWorkout = () => {
    router.push('/active-workout');
  };

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      {/* Header */}
      <View className='px-6 py-4 bg-white border-b border-gray-200'>
        <Text className='text-2xl font-bold text-gray-900'>
          Workout
        </Text>
        <Text className='text-gray-600 mt-1'>
          Ready to start your training session?
        </Text>
      </View>

      {/* Main Content */}
      <View className='flex-1 justify-center items-center px-6'>
        <View className='bg-white rounded-2xl p-8 w-full items-center shadow-sm border border-gray-100'>
          {/* Icon */}
          <View className='bg-blue-100 w-20 h-20 rounded-full items-center justify-center mb-6'>
            <Ionicons name='fitness' size={40} color='#3B82F6' />
          </View>
          
          {/* Title */}
          <Text className='text-2xl font-bold text-gray-900 mb-3 text-center'>
            Begin Your Training Session
          </Text>
          
          {/* Description */}
          <Text className='text-gray-600 text-center mb-8 leading-6'>
            Track your exercises, sets, and reps during your workout. 
            Stay motivated and reach your fitness goals!
          </Text>
          
          {/* Start Workout Button */}
          <TouchableOpacity 
            className='bg-blue-600 rounded-xl py-4 px-8 w-full items-center'
            onPress={startWorkout}
            activeOpacity={0.8}
          >
            <View className='flex-row items-center'>
              <Ionicons name='play' size={20} color='white' />
              <Text className='text-white font-semibold text-lg ml-2'>
                Start Workout
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Additional Info */}
        <View className='mt-8 px-6'>
          <Text className='text-sm text-gray-500 text-center'>
            Your workout will be automatically tracked and saved to your history
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Workout

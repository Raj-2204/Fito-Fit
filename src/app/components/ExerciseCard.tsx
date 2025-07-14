import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { Exercise } from '@/lib/sanity/types'
import { Ionicons } from '@expo/vector-icons'
import { urlFor } from '@/lib/sanity/client';

interface ExerciseCardProps {
    item: Exercise;
    onPress: () => void;
    showChevron?: boolean
}

export default function ExerciseCard({
    item,
    onPress,
    showChevron = false,
}: ExerciseCardProps) {
    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty) {
            case 'beginner':
                return 'bg-green-100 text-green-800'
            case 'intermediate':
                return 'bg-yellow-100 text-yellow-800'
            case 'advanced':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-white rounded-2xl p-4 mb-4 mx-6 shadow-sm border border-gray-100"
            activeOpacity={0.7}
        >
            <View className="flex-row items-center">
                {item.image?.asset && (
                    <Image
                        source={{ uri: urlFor(item.image?.asset?._ref).url()}}
                        className="w-16 h-16 rounded-xl bg-gray-200"
                        resizeMode="cover"
                    />
                )}
                
                <View className="flex-1 ml-4">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-lg font-semibold text-gray-900" numberOfLines={1}>
                            {item.name || 'Unnamed Exercise'}
                        </Text>
                        {showChevron && (
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        )}
                    </View>
                    
                    {item.description && (
                        <Text className="text-gray-600 mt-1" numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                    
                    <View className="flex-row items-center justify-between mt-2">
                        {item.difficulty && (
                            <View className={`px-3 py-1 rounded-full ${getDifficultyColor(item.difficulty)}`}>
                                <Text className="text-xs font-medium capitalize">
                                    {item.difficulty}
                                </Text>
                            </View>
                        )}
                        
                        {item.videoURL && (
                            <View className="flex-row items-center">
                                <Ionicons name="play-circle-outline" size={16} color="#6B7280" />
                                <Text className="text-xs text-gray-500 ml-1">Video</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}
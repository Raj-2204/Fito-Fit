import { View, Text, Modal, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'expo-router';
import { useWorkoutStore } from 'store/workout-store';
import { Exercise } from 'src/lib/sanity/types';
import { client } from '../../lib/sanity/client';
import { Ionicons } from '@expo/vector-icons';

interface ExerciseSelectionModalProps{
    visible: boolean,
    onClose: () => void;
}

const exerciseQuery = `*[_type == "exercise" && isActive == true] | order(name asc) {
  _id,
  name,
  description,
  difficulty,
  image {
    asset->{
      _id,
      url
    },
    alt
  },
  videoURL
}`;

export default function ExerciseSelectionModal({
    visible,
    onClose,
}: ExerciseSelectionModalProps) {
    const router = useRouter();
    const { addExerciseToWorkout } = useWorkoutStore();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

    const fetchExercises = async () => {
        try {
            setLoading(true);
            const data = await client.fetch(exerciseQuery);
            setExercises(data);
            setFilteredExercises(data);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            Alert.alert('Error', 'Failed to load exercises');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchExercises();
        }
    }, [visible]);

    useEffect(() => {
        const filtered = exercises.filter(exercise =>
            exercise.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            exercise.description?.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredExercises(filtered);
    }, [searchText, exercises]);

    const handleSelectExercise = (exercise: Exercise) => {
        if (exercise._id && exercise.name) {
            addExerciseToWorkout({
                name: exercise.name,
                sanityId: exercise._id
            });
            onClose();
        }
    };

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty) {
            case 'beginner':
                return '#22c55e';
            case 'intermediate':
                return '#f59e0b';
            case 'advanced':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    const renderExerciseItem = ({ item }: { item: Exercise }) => (
        <TouchableOpacity
            onPress={() => handleSelectExercise(item)}
            className="bg-white p-4 mx-4 my-2 rounded-lg shadow-sm border border-gray-100"
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-900 mb-1">
                        {item.name}
                    </Text>
                    <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                        {item.description}
                    </Text>
                    <View className="flex-row items-center">
                        <View
                            className="px-2 py-1 rounded-full mr-2"
                            style={{ backgroundColor: getDifficultyColor(item.difficulty) }}
                        >
                            <Text className="text-white text-xs font-medium capitalize">
                                {item.difficulty || 'Unknown'}
                            </Text>
                        </View>
                        {item.videoURL && (
                            <Ionicons name="play-circle-outline" size={16} color="#6b7280" />
                        )}
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View className="flex-1 bg-gray-50">
                {/* Header */}
                <View className="bg-white px-4 py-3 border-b border-gray-200">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-xl font-bold text-gray-900">
                            Select Exercise
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#6b7280" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <View className="bg-white px-4 py-3 border-b border-gray-200">
                    <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
                        <Ionicons name="search" size={20} color="#6b7280" />
                        <TextInput
                            placeholder="Search exercises..."
                            value={searchText}
                            onChangeText={setSearchText}
                            className="flex-1 ml-2 text-gray-900"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                {/* Content */}
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text className="text-gray-600 mt-2">Loading exercises...</Text>
                    </View>
                ) : filteredExercises.length === 0 ? (
                    <View className="flex-1 justify-center items-center px-6">
                        <Ionicons name="search" size={64} color="#d1d5db" />
                        <Text className="text-gray-400 text-lg font-medium text-center mt-4">
                            {searchText ? 'No exercises found' : 'No exercises available'}
                        </Text>
                        <Text className="text-gray-500 text-center mt-2">
                            {searchText ? 'Try a different search term' : 'Check back later'}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredExercises}
                        renderItem={renderExerciseItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={{ paddingVertical: 8 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </Modal>
    );
}
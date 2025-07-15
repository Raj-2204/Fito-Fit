import {create} from "zustand"
import {persist, createJSONStorage} from "zustand/middleware"
import AsyncStorage from '@react-native-async-storage/async-storage';


export interface WorkoutSet{
    id: string;
    reps: string;
    weight: string;
    weightUnit: "kg" | "lbs";
    isCompleted: boolean;
}

interface WorkoutExercise {
    id: string;
    sanity: string;
    name: string;
    sets: WorkoutSet[]
}

interface WorkoutStore {
    workoutExercises: WorkoutExercise[];
    weightUnit: "kg" | "lbs";

    addExerciseToWorkout: (exercise: {name: string; sanityId: string }) => void;
    removeExerciseFromWorkout: (exerciseId: string) => void;
    addSetToExercise: (exerciseId: string) => void;
    removeSetFromExercise: (exerciseId: string, setId: string) => void;
    updateSetInExercise: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
    setWorkoutExercises: (
        exercises:
        | WorkoutExercise[]
        |((prev: WorkoutExercise[])=> WorkoutExercise[])
    ) => void;
    setWeightUnit: (unit:"kg" | "lbs") => void;
    resetWorkout: () => void;

}

export const useWorkoutStore = create<WorkoutStore>()(
    persist((set) => ({
        workoutExercises: [],
        weightUnit: "lbs",
        addExerciseToWorkout:(exercise) =>
            set((state) => {
                const newExercise: WorkoutExercise = {
                    id: Math.random().toString(),
                    sanity: exercise.sanityId,
                    name: exercise.name,
                    sets: []
                };
                return {
                    workoutExercises: [...state.workoutExercises, newExercise]
                };
            }),
        removeExerciseFromWorkout: (exerciseId) =>
            set((state) => ({
                workoutExercises: state.workoutExercises.filter(
                    (exercise) => exercise.id !== exerciseId
                )
            })),
        addSetToExercise: (exerciseId) =>
            set((state) => ({
                workoutExercises: state.workoutExercises.map((exercise) => {
                    if (exercise.id === exerciseId) {
                        const newSet: WorkoutSet = {
                            id: Math.random().toString(),
                            reps: "",
                            weight: "",
                            weightUnit: state.weightUnit,
                            isCompleted: false
                        };
                        return {
                            ...exercise,
                            sets: [...exercise.sets, newSet]
                        };
                    }
                    return exercise;
                })
            })),
        removeSetFromExercise: (exerciseId, setId) =>
            set((state) => ({
                workoutExercises: state.workoutExercises.map((exercise) => {
                    if (exercise.id === exerciseId) {
                        return {
                            ...exercise,
                            sets: exercise.sets.filter((set) => set.id !== setId)
                        };
                    }
                    return exercise;
                })
            })),
        updateSetInExercise: (exerciseId, setId, updates) =>
            set((state) => ({
                workoutExercises: state.workoutExercises.map((exercise) => {
                    if (exercise.id === exerciseId) {
                        return {
                            ...exercise,
                            sets: exercise.sets.map((set) => {
                                if (set.id === setId) {
                                    return { ...set, ...updates };
                                }
                                return set;
                            })
                        };
                    }
                    return exercise;
                })
            })),
            setWorkoutExercises: (exercises) =>
                set((state)=>({
                    workoutExercises:
                    typeof exercises === "function"
                    ? exercises(state.workoutExercises)
                    : exercises,
                })),
            setWeightUnit: (unit) =>
                set({
                    weightUnit: unit
                 }),
                 resetWorkout: ()=>
                    set({
                        workoutExercises: []
                    })
    }),{
        name: "workout-store",
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state)=>(
            {
                weightUnit: state.weightUnit,

            }
        ),
    })
)
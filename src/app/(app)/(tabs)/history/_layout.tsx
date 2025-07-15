import { Stack } from 'expo-router'
import React from 'react'

function Layout() {
  return (
    <Stack>
        <Stack.Screen 
            name= "history" 
            options={{headerShown: false}}
            />
        <Stack.Screen
            name='workout-record'
            options={{
                headerShown: true,
                headerTitle: "Workout Record",
                headerBackTitle: "History"
            }}
        />

    </Stack>
  )
}

export default Layout

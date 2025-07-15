import { View, Text, ActivityIndicator } from 'react-native'
import React from 'react'
import {Stack} from "expo-router"
import { useAuth } from "@clerk/clerk-expo"

const Layout = () => {
    const { isLoaded, isSignedIn, userId, sessionId, getToken} = useAuth();
    if(!isLoaded){
      return(
        <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='large' color="black"></ActivityIndicator>
        </View>
      );
    }
  return (
    <Stack>
        <Stack.Protected guard= {isSignedIn}>
            <Stack.Screen name='(tabs)' options={{headerShown: false }}></Stack.Screen>
            <Stack.Screen
             name='exercise-details' 
             options={{
              headerShown: false, 
              presentation:"modal",
              gestureEnabled: true,
              animationTypeForReplace: "push",
            }}
            ></Stack.Screen>
        </Stack.Protected>
        <Stack.Protected guard={!isSignedIn}>
            <Stack.Screen name="sign-in" options={{headerShown: false}}></Stack.Screen>
            <Stack.Screen name="sign-up" options={{headerShown: false}}></Stack.Screen>
        </Stack.Protected>
    </Stack>
  )
}

export default Layout
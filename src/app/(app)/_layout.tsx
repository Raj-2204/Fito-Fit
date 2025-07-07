import { View, Text } from 'react-native'
import React from 'react'
import {Stack} from "expo-router"

const Layout = () => {
  return (
    <Stack>
        <Stack.Screen name='(tabs)' options={{headerShown: false }}></Stack.Screen>
    </Stack>
  )
}

export default Layout
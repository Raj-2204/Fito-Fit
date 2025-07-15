import { Stack } from "expo-router";
import React from "react";

function Layout() {
  return <Stack>
    <Stack.Screen 
            name= "index" 
            options={{headerShown: false}}
            />
  </Stack>;
}

export default Layout;

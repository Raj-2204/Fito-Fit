import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';


const Layout = () => {
  return (
    <Tabs>
        <Tabs.Screen name= "index" options={{
            headerShown: false, 
            title:"Home",
            tabBarIcon: ({color, size}) =>(
                <FontAwesome5 name="home" size={24} color="black" />
            ),
            
            }}/>
            <Tabs.Screen name= "exercises" options={{
            headerShown: false, 
            title:"Exercises",
            tabBarIcon: ({color, size}) =>(
                <Entypo name="open-book" size={24} color="black" />
            ),
            
            }}/>
            <Tabs.Screen name= "workout" options={{
            headerShown: false, 
            title:"Workout",
            tabBarIcon: ({color, size}) =>(
                <AntDesign name="pluscircle" size={24} color="black" />
            ),
            
            }}/>
            <Tabs.Screen 
            name= "active-workout" 
            options={{
            headerShown: false, 
            href: null,
            title:"Active Workout",
            tabBarStyle: {
                display: "none",
            }
            
            }}/>
            <Tabs.Screen 
            name= "history" 
            options={{
            headerShown: false, 
            title:"History",
            tabBarIcon: ({color, size}) =>(
                <FontAwesome5 name="clock" size={24} color="black" />
            ),
            
            }}/>
            <Tabs.Screen 
            name= "profile" 
            options={{
            headerShown: false, 
            title:"Profile",
            // tabBarIcon: ({color, size}) =>(
            //     <FontAwesome5 name="clock" size={24} color="black" />
            // ),
            
            }}/>
            
        
    </Tabs>
    
  )
}

export default Layout
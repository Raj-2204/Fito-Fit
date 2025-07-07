import "../global.css";
import { Stack, Tabs } from "expo-router";
import { ClerkProvider } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import AntDesign from "@expo/vector-icons/AntDesign";

export default function Layout() {
  return (
    <ClerkProvider>
      <Slot />
    </ClerkProvider>
  );
}

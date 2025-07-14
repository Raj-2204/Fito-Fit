import { Link } from "expo-router";
import React from "react";
import { SafeAreaView, Text, View } from "react-native";

export default function Page() {
  return (
    <SafeAreaView className="flex flex-1">
      <Header />
      <Content />
    </SafeAreaView>
  );
}

function Content() {
  return (
    <View className="flex-1">
      
    </View>
  );
}

function Header() {
  return (
    <View>
      <View className="px-4 lg:px-6 h-14 flex items-center flex-row justify-between ">
        <Link className="font-bold flex-1 items-center justify-center" href="/">
          PAPAFAM
        </Link>
        <View className="">
          <Link
            className="text-md font-medium hover:underline web:underline-offset-4"
            href="https://www.papareact.com/course"
          >
            Join My Course ❤️
          </Link>
        </View>
      </View>
    </View>
  );
}

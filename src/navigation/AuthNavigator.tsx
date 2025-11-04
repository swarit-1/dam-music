import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import ProfileCustomizationScreen from "../screens/auth/ProfileCustomizationScreen";
import ProfileGenresScreen from "../screens/auth/ProfileGenresScreen";

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ProfileCustomization" component={ProfileCustomizationScreen} />
            <Stack.Screen name="ProfileGenres" component={ProfileGenresScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;

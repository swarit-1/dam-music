import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ManagementScreen from "../screens/ManagementScreen";
import ProjectWorkflowScreen from "../screens/ProjectWorkflowScreen";

export type ManagementStackParamList = {
    ManagementHome: undefined;
    ProjectWorkflow: {
        projectId: string;
        projectName: string;
        collaborator: string;
    };
};

const Stack = createStackNavigator<ManagementStackParamList>();

const ManagementNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="ManagementHome" component={ManagementScreen} />
            <Stack.Screen
                name="ProjectWorkflow"
                component={ProjectWorkflowScreen}
            />
        </Stack.Navigator>
    );
};

export default ManagementNavigator;

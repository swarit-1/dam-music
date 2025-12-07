import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { Task, PriorityLevel } from "../types/workflow";
import TaskModal from "./TaskModal";

interface TaskCardProps {
    task: Task;
    collaborators: string[];
    onUpdate: (updatedTask: Task) => void;
    onDelete: () => void;
    onComplete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
    task,
    collaborators,
    onUpdate,
    onDelete,
    onComplete,
}) => {
    const [editMode, setEditMode] = useState(false);

    const getPriorityColor = (priority: PriorityLevel) => {
        switch (priority) {
            case "urgent":
                return "#FF3B30";
            case "high":
                return "#FF9500";
            case "medium":
                return "#FFCC00";
            case "low":
                return "#34C759";
            default:
                return colors.gray300;
        }
    };

    const getPriorityLabel = (priority: PriorityLevel) => {
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    };

    const handleSave = (
        updatedTaskData: Omit<Task, "id" | "createdAt" | "updatedAt">
    ) => {
        const updatedTask: Task = {
            ...task,
            ...updatedTaskData,
            updatedAt: new Date(),
        };
        onUpdate(updatedTask);
        setEditMode(false);
    };

    const handleDelete = () => {
        setEditMode(false);
        onDelete();
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.card, task.completed && styles.cardCompleted]}
                onPress={() => setEditMode(true)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            onComplete();
                        }}
                        style={styles.checkbox}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <MaterialIcons
                            name={
                                task.completed
                                    ? "check-box"
                                    : "check-box-outline-blank"
                            }
                            size={22}
                            color={
                                task.completed
                                    ? colors.brandPurple
                                    : colors.gray400
                            }
                        />
                    </TouchableOpacity>
                    <View style={styles.content}>
                        <Text
                            style={[
                                styles.taskTitle,
                                task.completed && styles.taskTitleCompleted,
                            ]}
                            numberOfLines={1}
                        >
                            {task.title}
                        </Text>
                        {task.description && (
                            <Text
                                style={[
                                    styles.description,
                                    task.completed && styles.taskTitleCompleted,
                                ]}
                                numberOfLines={1}
                            >
                                {task.description}
                            </Text>
                        )}
                        <View style={styles.metadata}>
                            <View style={styles.metaItem}>
                                <MaterialIcons
                                    name="flag"
                                    size={14}
                                    color={getPriorityColor(task.priority)}
                                />
                                <Text style={styles.metaText}>
                                    {getPriorityLabel(task.priority)}
                                </Text>
                            </View>
                            {task.assignedTo && (
                                <View style={styles.metaItem}>
                                    <MaterialIcons
                                        name="person"
                                        size={14}
                                        color={colors.gray400}
                                    />
                                    <Text style={styles.metaText}>
                                        {task.assignedTo}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Edit Modal */}
            <TaskModal
                visible={editMode}
                mode="edit"
                task={task}
                collaborators={collaborators}
                onSave={handleSave}
                onCancel={() => setEditMode(false)}
                onDelete={handleDelete}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 14,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    cardCompleted: {
        opacity: 0.6,
        backgroundColor: colors.gray100,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    checkbox: {
        marginTop: 2,
    },
    content: {
        flex: 1,
        gap: 4,
    },
    taskTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.surfaceDark,
        lineHeight: 20,
    },
    taskTitleCompleted: {
        textDecorationLine: "line-through",
        color: colors.gray500,
    },
    description: {
        fontSize: 13,
        color: colors.gray500,
        lineHeight: 18,
    },
    metadata: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginTop: 2,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: colors.gray600,
        fontWeight: "500",
    },
});

export default TaskCard;

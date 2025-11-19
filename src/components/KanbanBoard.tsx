import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { Board, Task } from "../types/workflow";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";

interface KanbanBoardProps {
    board: Board;
    collaborators: string[]; // List of collaborator names
    onUpdateTask: (taskId: string, updatedTask: Task) => void;
    onDeleteTask: (taskId: string) => void;
    onAddTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
    board,
    collaborators,
    onUpdateTask,
    onDeleteTask,
    onAddTask,
}) => {
    const [showAddModal, setShowAddModal] = useState(false);

    const handleAddTask = (
        task: Omit<Task, "id" | "createdAt" | "updatedAt">
    ) => {
        onAddTask(task);
        setShowAddModal(false);
    };

    return (
        <View style={styles.container}>
            {/* Board Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.boardTitle}>{board.name}</Text>
                    <Text style={styles.taskCount}>
                        {board.tasks.filter((t) => !t.completed).length} active
                        tasks
                    </Text>
                </View>
            </View>

            {/* Tasks List */}
            <FlatList
                data={board.tasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TaskCard
                        task={item}
                        collaborators={collaborators}
                        onUpdate={(updatedTask) =>
                            onUpdateTask(item.id, updatedTask)
                        }
                        onDelete={() => onDeleteTask(item.id)}
                        onComplete={() =>
                            onUpdateTask(item.id, {
                                ...item,
                                completed: !item.completed,
                            })
                        }
                    />
                )}
                contentContainerStyle={styles.taskList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialIcons
                            name="task-alt"
                            size={48}
                            color={colors.gray300}
                        />
                        <Text style={styles.emptyText}>No tasks yet</Text>
                        <Text style={styles.emptySubtext}>
                            Add your first task to get started
                        </Text>
                    </View>
                }
            />

            {/* Add Task Button */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
                activeOpacity={0.8}
            >
                <MaterialIcons name="add" size={24} color={colors.white} />
                <Text style={styles.addButtonText}>Add Task</Text>
            </TouchableOpacity>

            {/* Add Task Modal */}
            <TaskModal
                visible={showAddModal}
                mode="create"
                collaborators={collaborators}
                onSave={handleAddTask}
                onCancel={() => setShowAddModal(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E8D9F5",
        margin: 12,
        marginBottom: 0,
        borderRadius: 16,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "transparent",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(157, 89, 226, 0.15)",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    boardTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: colors.surfaceDark,
    },
    taskCount: {
        fontSize: 13,
        color: colors.gray500,
        marginTop: 2,
    },
    taskList: {
        padding: 16,
        paddingBottom: 80,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.gray500,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.gray400,
        marginTop: 8,
        textAlign: "center",
    },
    addButton: {
        position: "absolute",
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: colors.brandPurple,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    addButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.surfaceDark,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.gray300,
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        color: colors.surfaceDark,
        backgroundColor: colors.white,
        minHeight: 80,
        textAlignVertical: "top",
    },
    modalActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: colors.gray200,
    },
    saveButton: {
        backgroundColor: colors.brandPurple,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.surfaceDark,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.white,
    },
});

export default KanbanBoard;

import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Alert,
    Modal,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { colors } from "../theme/colors";
import { Board, Task } from "../types/workflow";
import KanbanBoard from "../components/KanbanBoard";

type RootStackParamList = {
    ProjectWorkflow: {
        projectId: string;
        projectName: string;
        collaborator: string;
    };
};

type ProjectWorkflowScreenRouteProp = RouteProp<
    RootStackParamList,
    "ProjectWorkflow"
>;
type ProjectWorkflowScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "ProjectWorkflow"
>;

interface Props {
    route: ProjectWorkflowScreenRouteProp;
    navigation: ProjectWorkflowScreenNavigationProp;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ProjectWorkflowScreen: React.FC<Props> = ({ route, navigation }) => {
    const { projectId, projectName, collaborator } = route.params;

    // List of all collaborators (including user and project collaborators)
    const collaborators = ["You", collaborator];

    // Initialize with two boards: user's board and collaborator's board
    const [boards, setBoards] = useState<Board[]>([
        {
            id: "board-1",
            name: "My Tasks",
            userId: "current-user",
            userName: "You",
            tasks: [
                {
                    id: "task-1",
                    title: "Record lead vocals",
                    description: "Focus on verses 1 and 2",
                    priority: "high",
                    assignedTo: "You",
                    completed: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: "task-2",
                    title: "Mix and master final track",
                    priority: "medium",
                    completed: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
        },
        {
            id: "board-2",
            name: `${collaborator}'s Tasks`,
            userId: "collaborator-1",
            userName: collaborator,
            tasks: [
                {
                    id: "task-3",
                    title: "Produce beat for chorus",
                    priority: "high",
                    assignedTo: collaborator,
                    completed: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
        },
    ]);

    const [currentBoardIndex, setCurrentBoardIndex] = useState(0);
    const [showAddBoardModal, setShowAddBoardModal] = useState(false);
    const [newBoardName, setNewBoardName] = useState("");

    const handleUpdateTask = (
        boardId: string,
        taskId: string,
        updatedTask: Task
    ) => {
        // Update task in all boards where it should appear based on assignment
        setBoards((prevBoards) =>
            prevBoards.map((board) => {
                const taskExists = board.tasks.some((t) => t.id === taskId);
                const shouldShowInBoard =
                    !updatedTask.assignedTo ||
                    updatedTask.assignedTo === "Both" ||
                    updatedTask.assignedTo === board.userName;

                if (taskExists) {
                    if (shouldShowInBoard) {
                        // Update the task
                        return {
                            ...board,
                            tasks: board.tasks.map((task) =>
                                task.id === taskId ? updatedTask : task
                            ),
                        };
                    } else {
                        // Remove task from this board if it's no longer assigned here
                        return {
                            ...board,
                            tasks: board.tasks.filter(
                                (task) => task.id !== taskId
                            ),
                        };
                    }
                } else {
                    // Task doesn't exist in this board yet
                    if (shouldShowInBoard) {
                        // Add task to this board if it should now appear here
                        return {
                            ...board,
                            tasks: [...board.tasks, updatedTask],
                        };
                    }
                    return board;
                }
            })
        );
    };

    const handleDeleteTask = (boardId: string, taskId: string) => {
        // Delete task from all boards where it appears
        setBoards((prevBoards) =>
            prevBoards.map((board) => ({
                ...board,
                tasks: board.tasks.filter((task) => task.id !== taskId),
            }))
        );
    };

    const handleAddTask = (
        boardId: string,
        task: Omit<Task, "id" | "createdAt" | "updatedAt">
    ) => {
        const newTask: Task = {
            ...task,
            id: `task-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Add task to boards based on assignment
        setBoards((prevBoards) =>
            prevBoards.map((board) => {
                const shouldShowInBoard =
                    !newTask.assignedTo ||
                    newTask.assignedTo === "Both" ||
                    newTask.assignedTo === board.userName;

                if (shouldShowInBoard) {
                    return { ...board, tasks: [...board.tasks, newTask] };
                }
                return board;
            })
        );
    };

    const handleAddBoard = () => {
        if (!newBoardName.trim()) {
            Alert.alert("Error", "Please enter a board name");
            return;
        }

        const newBoard: Board = {
            id: `board-${Date.now()}`,
            name: newBoardName,
            userId: `user-${Date.now()}`,
            userName: newBoardName,
            tasks: [],
        };

        setBoards([...boards, newBoard]);
        setNewBoardName("");
        setShowAddBoardModal(false);

        // Switch to the new board
        setTimeout(() => {
            setCurrentBoardIndex(boards.length);
        }, 100);
    };

    const renderBoard = ({ item, index }: { item: Board; index: number }) => (
        <View style={styles.boardContainer}>
            <KanbanBoard
                board={item}
                collaborators={collaborators}
                onUpdateTask={(taskId, updatedTask) =>
                    handleUpdateTask(item.id, taskId, updatedTask)
                }
                onDeleteTask={(taskId) => handleDeleteTask(item.id, taskId)}
                onAddTask={(task) => handleAddTask(item.id, task)}
            />
        </View>
    );

    return (
        <LinearGradient
            colors={[colors.brandPurple, colors.brandPurple700]}
            style={styles.gradient}
        >
            <SafeAreaView style={styles.container} edges={["top"]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialIcons
                            name="arrow-back"
                            size={24}
                            color={colors.white}
                        />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.projectName}>{projectName}</Text>
                        <Text style={styles.boardIndicator}>
                            {boards[currentBoardIndex]?.name} (
                            {currentBoardIndex + 1}/{boards.length})
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowAddBoardModal(true)}
                        style={styles.addBoardButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialIcons
                            name="add"
                            size={24}
                            color={colors.white}
                        />
                    </TouchableOpacity>
                </View>

                {/* Horizontal Swipeable Boards */}
                <FlatList
                    data={boards}
                    renderItem={renderBoard}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={SCREEN_WIDTH}
                    decelerationRate="fast"
                    onMomentumScrollEnd={(event) => {
                        const index = Math.round(
                            event.nativeEvent.contentOffset.x / SCREEN_WIDTH
                        );
                        setCurrentBoardIndex(index);
                    }}
                    getItemLayout={(data, index) => ({
                        length: SCREEN_WIDTH,
                        offset: SCREEN_WIDTH * index,
                        index,
                    })}
                />

                {/* Board Navigation Dots */}
                <View style={styles.dotsContainer}>
                    {boards.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentBoardIndex && styles.dotActive,
                            ]}
                        />
                    ))}
                </View>

                {/* Add Board Modal */}
                <Modal
                    visible={showAddBoardModal}
                    animationType="slide"
                    transparent={true}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>New Board</Text>
                                <TouchableOpacity
                                    onPress={() => setShowAddBoardModal(false)}
                                >
                                    <MaterialIcons
                                        name="close"
                                        size={24}
                                        color={colors.gray400}
                                    />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>Board Name</Text>
                            <TextInput
                                style={styles.input}
                                value={newBoardName}
                                onChangeText={setNewBoardName}
                                placeholder="e.g., Sarah's Tasks"
                                placeholderTextColor={colors.gray400}
                                autoFocus
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[
                                        styles.modalButton,
                                        styles.cancelButton,
                                    ]}
                                    onPress={() => {
                                        setShowAddBoardModal(false);
                                        setNewBoardName("");
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.modalButton,
                                        styles.saveButton,
                                    ]}
                                    onPress={handleAddBoard}
                                >
                                    <Text style={styles.saveButtonText}>
                                        Add Board
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "transparent",
    },
    backButton: {
        padding: 4,
    },
    headerCenter: {
        flex: 1,
        alignItems: "center",
        marginHorizontal: 16,
    },
    projectName: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.white,
    },
    boardIndicator: {
        fontSize: 13,
        color: "rgba(255, 255, 255, 0.8)",
        marginTop: 2,
    },
    addBoardButton: {
        padding: 4,
    },
    boardContainer: {
        width: SCREEN_WIDTH,
        flex: 1,
    },
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 12,
        backgroundColor: "transparent",
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
    dotActive: {
        backgroundColor: colors.white,
        width: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        width: "100%",
        maxWidth: 400,
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
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.surfaceDark,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.gray300,
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        color: colors.surfaceDark,
        backgroundColor: colors.white,
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

export default ProjectWorkflowScreen;

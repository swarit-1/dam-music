import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { Task, PriorityLevel } from "../types/workflow";

interface TaskModalProps {
    visible: boolean;
    mode: "create" | "edit";
    task?: Task;
    collaborators: string[]; // List of collaborator names for dropdown
    onSave: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
    onCancel: () => void;
    onDelete?: () => void; // Optional delete handler for edit mode
}

const TaskModal: React.FC<TaskModalProps> = ({
    visible,
    mode,
    task,
    collaborators,
    onSave,
    onCancel,
    onDelete,
}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<PriorityLevel>("medium");
    const [assignee, setAssignee] = useState<string>("");
    const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
    const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

    useEffect(() => {
        if (visible) {
            if (mode === "edit" && task) {
                setTitle(task.title);
                setDescription(task.description || "");
                setPriority(task.priority);
                setAssignee(task.assignedTo || "");
            } else {
                setTitle("");
                setDescription("");
                setPriority("medium");
                setAssignee("");
            }
        }
    }, [visible, mode, task]);

    const getPriorityColor = (level: PriorityLevel) => {
        switch (level) {
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

    const getPriorityLabel = (level: PriorityLevel) => {
        return level.charAt(0).toUpperCase() + level.slice(1);
    };

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert("Error", "Please enter a task title");
            return;
        }

        onSave({
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            assignedTo: assignee || undefined,
            completed: task?.completed || false,
        });
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {mode === "create" ? "New Task" : "Edit Task"}
                        </Text>
                        <TouchableOpacity onPress={onCancel}>
                            <MaterialIcons
                                name="close"
                                size={24}
                                color={colors.gray400}
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>Title *</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="What needs to be done?"
                            placeholderTextColor={colors.gray400}
                            autoFocus={mode === "create"}
                        />

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Add details..."
                            placeholderTextColor={colors.gray400}
                            multiline
                            numberOfLines={4}
                        />

                        <Text style={styles.label}>Priority</Text>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() =>
                                setShowPriorityDropdown(!showPriorityDropdown)
                            }
                        >
                            <View style={styles.dropdownLeft}>
                                <View
                                    style={[
                                        styles.priorityDot,
                                        {
                                            backgroundColor:
                                                getPriorityColor(priority),
                                        },
                                    ]}
                                />
                                <Text style={styles.dropdownText}>
                                    {getPriorityLabel(priority)}
                                </Text>
                            </View>
                            <MaterialIcons
                                name={
                                    showPriorityDropdown
                                        ? "keyboard-arrow-up"
                                        : "keyboard-arrow-down"
                                }
                                size={24}
                                color={colors.gray400}
                            />
                        </TouchableOpacity>

                        {showPriorityDropdown && (
                            <View style={styles.dropdownMenu}>
                                {(
                                    [
                                        "low",
                                        "medium",
                                        "high",
                                        "urgent",
                                    ] as PriorityLevel[]
                                ).map((level) => (
                                    <TouchableOpacity
                                        key={level}
                                        style={[
                                            styles.dropdownItem,
                                            priority === level &&
                                                styles.dropdownItemSelected,
                                        ]}
                                        onPress={() => {
                                            setPriority(level);
                                            setShowPriorityDropdown(false);
                                        }}
                                    >
                                        <View
                                            style={styles.dropdownItemContent}
                                        >
                                            <View
                                                style={[
                                                    styles.priorityDot,
                                                    {
                                                        backgroundColor:
                                                            getPriorityColor(
                                                                level
                                                            ),
                                                    },
                                                ]}
                                            />
                                            <Text
                                                style={[
                                                    styles.dropdownItemText,
                                                    priority === level &&
                                                        styles.dropdownItemTextSelected,
                                                ]}
                                            >
                                                {getPriorityLabel(level)}
                                            </Text>
                                        </View>
                                        {priority === level && (
                                            <MaterialIcons
                                                name="check"
                                                size={20}
                                                color={colors.brandPurple}
                                            />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <Text style={styles.label}>Assigned To</Text>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() =>
                                setShowAssigneeDropdown(!showAssigneeDropdown)
                            }
                        >
                            <View style={styles.dropdownLeft}>
                                <MaterialIcons
                                    name="person"
                                    size={20}
                                    color={colors.gray400}
                                />
                                <Text
                                    style={[
                                        styles.dropdownText,
                                        !assignee && styles.placeholderText,
                                    ]}
                                >
                                    {assignee || "Select assignee"}
                                </Text>
                            </View>
                            <MaterialIcons
                                name={
                                    showAssigneeDropdown
                                        ? "keyboard-arrow-up"
                                        : "keyboard-arrow-down"
                                }
                                size={24}
                                color={colors.gray400}
                            />
                        </TouchableOpacity>

                        {showAssigneeDropdown && (
                            <View style={styles.dropdownMenu}>
                                <TouchableOpacity
                                    style={[
                                        styles.dropdownItem,
                                        !assignee &&
                                            styles.dropdownItemSelected,
                                    ]}
                                    onPress={() => {
                                        setAssignee("");
                                        setShowAssigneeDropdown(false);
                                    }}
                                >
                                    <View style={styles.dropdownItemContent}>
                                        <MaterialIcons
                                            name="person-outline"
                                            size={20}
                                            color={colors.gray400}
                                        />
                                        <Text
                                            style={[
                                                styles.dropdownItemText,
                                                !assignee &&
                                                    styles.dropdownItemTextSelected,
                                            ]}
                                        >
                                            Unassigned
                                        </Text>
                                    </View>
                                    {!assignee && (
                                        <MaterialIcons
                                            name="check"
                                            size={20}
                                            color={colors.brandPurple}
                                        />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.dropdownItem,
                                        assignee === "Both" &&
                                            styles.dropdownItemSelected,
                                    ]}
                                    onPress={() => {
                                        setAssignee("Both");
                                        setShowAssigneeDropdown(false);
                                    }}
                                >
                                    <View style={styles.dropdownItemContent}>
                                        <MaterialIcons
                                            name="people"
                                            size={20}
                                            color={colors.gray400}
                                        />
                                        <Text
                                            style={[
                                                styles.dropdownItemText,
                                                assignee === "Both" &&
                                                    styles.dropdownItemTextSelected,
                                            ]}
                                        >
                                            Both
                                        </Text>
                                    </View>
                                    {!assignee && (
                                        <MaterialIcons
                                            name="check"
                                            size={20}
                                            color={colors.brandPurple}
                                        />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.dropdownItem,
                                        assignee === "Both" &&
                                            styles.dropdownItemSelected,
                                    ]}
                                    onPress={() => {
                                        setAssignee("Both");
                                        setShowAssigneeDropdown(false);
                                    }}
                                >
                                    <View style={styles.dropdownItemContent}>
                                        <MaterialIcons
                                            name="people"
                                            size={20}
                                            color={colors.gray400}
                                        />
                                        <Text
                                            style={[
                                                styles.dropdownItemText,
                                                assignee === "Both" &&
                                                    styles.dropdownItemTextSelected,
                                            ]}
                                        >
                                            Both
                                        </Text>
                                    </View>
                                    {assignee === "Both" && (
                                        <MaterialIcons
                                            name="check"
                                            size={20}
                                            color={colors.brandPurple}
                                        />
                                    )}
                                </TouchableOpacity>
                                {collaborators.map((name) => (
                                    <TouchableOpacity
                                        key={name}
                                        style={[
                                            styles.dropdownItem,
                                            assignee === name &&
                                                styles.dropdownItemSelected,
                                        ]}
                                        onPress={() => {
                                            setAssignee(name);
                                            setShowAssigneeDropdown(false);
                                        }}
                                    >
                                        <View
                                            style={styles.dropdownItemContent}
                                        >
                                            <MaterialIcons
                                                name="person"
                                                size={20}
                                                color={colors.gray400}
                                            />
                                            <Text
                                                style={[
                                                    styles.dropdownItemText,
                                                    assignee === name &&
                                                        styles.dropdownItemTextSelected,
                                                ]}
                                            >
                                                {name}
                                            </Text>
                                        </View>
                                        {assignee === name && (
                                            <MaterialIcons
                                                name="check"
                                                size={20}
                                                color={colors.brandPurple}
                                            />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </ScrollView>

                    {mode === "edit" && onDelete && (
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => {
                                Alert.alert(
                                    "Delete Task",
                                    "Are you sure you want to delete this task?",
                                    [
                                        { text: "Cancel", style: "cancel" },
                                        {
                                            text: "Delete",
                                            style: "destructive",
                                            onPress: onDelete,
                                        },
                                    ]
                                );
                            }}
                        >
                            <MaterialIcons
                                name="delete"
                                size={20}
                                color={colors.danger}
                            />
                            <Text style={styles.deleteButtonText}>
                                Delete Task
                            </Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onCancel}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.saveButton]}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>
                                {mode === "create" ? "Add Task" : "Save"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
        maxHeight: "90%",
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
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.gray300,
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: colors.surfaceDark,
        backgroundColor: colors.white,
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    dropdown: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: colors.gray300,
        borderRadius: 8,
        padding: 12,
        backgroundColor: colors.white,
    },
    dropdownLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    dropdownText: {
        fontSize: 15,
        color: colors.surfaceDark,
        fontWeight: "500",
    },
    placeholderText: {
        color: colors.gray400,
        fontWeight: "400",
    },
    priorityDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    dropdownMenu: {
        borderWidth: 1,
        borderColor: colors.gray300,
        borderRadius: 8,
        backgroundColor: colors.white,
        marginTop: 4,
        overflow: "hidden",
    },
    dropdownItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    dropdownItemSelected: {
        backgroundColor: "rgba(157, 89, 226, 0.05)",
    },
    dropdownItemContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    dropdownItemText: {
        fontSize: 15,
        color: colors.surfaceDark,
    },
    dropdownItemTextSelected: {
        fontWeight: "600",
        color: colors.brandPurple,
    },
    modalActions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 24,
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
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 12,
        marginTop: 16,
        marginBottom: 16,
        borderRadius: 10,
        backgroundColor: "rgba(255, 59, 48, 0.08)",
    },
    deleteButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.danger,
    },
});

export default TaskModal;

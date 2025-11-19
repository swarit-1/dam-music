export type PriorityLevel = "low" | "medium" | "high" | "urgent";

export interface Task {
    id: string;
    title: string;
    description?: string;
    priority: PriorityLevel;
    assignedTo?: string; // user ID or name
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Board {
    id: string;
    name: string;
    userId: string; // owner of this board
    userName: string; // display name
    tasks: Task[];
}

export interface ProjectWorkflow {
    projectId: string;
    projectName: string;
    boards: Board[];
}

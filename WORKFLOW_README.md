# Project Workflow - Kanban Board Implementation

## ✅ Completed Features

### Navigation & Structure

-   **ManagementNavigator**: Stack navigator handling workflow screens
-   **ProjectWorkflowScreen**: Main screen with horizontal swipeable boards
-   **KanbanBoard**: Individual board component with task list
-   **TaskCard**: Expandable task card with full CRUD operations

### Core Functionality

1. **Multiple Boards**

    - Horizontal swipe between boards (user board + collaborator boards)
    - Add new boards with custom names
    - Visual dots indicator showing current board
    - Board count display in header

2. **Task Management**

    - Add new tasks via bottom "Add Task" button
    - Click to expand task details
    - Edit: title, description, priority, assignee
    - Mark as complete (checkbox)
    - Delete tasks with confirmation
    - Priority levels: low, medium, high, urgent (color-coded)

3. **UI/UX**
    - Clean, modern card-based design
    - Modal overlays for editing and adding
    - Avatar display for board owners
    - Active task counter per board
    - Empty state messaging
    - Smooth animations and transitions

### File Structure

```
src/
├── types/
│   └── workflow.ts              # Task, Board, ProjectWorkflow types
├── components/
│   ├── TaskCard.tsx             # Individual task card with expand/edit
│   └── KanbanBoard.tsx          # Board with vertical task list
├── screens/
│   ├── ManagementScreen.tsx     # Project list (entry point)
│   └── ProjectWorkflowScreen.tsx # Kanban workflow screen
└── navigation/
    └── ManagementNavigator.tsx  # Stack navigator
```

## 🚧 Future Enhancement: Drag & Drop

### Implementation Options

#### Option 1: react-native-draggable-flatlist

```bash
npm install react-native-draggable-flatlist
```

-   Best for reordering within a single board
-   Smooth native animations
-   Simple API

#### Option 2: react-native-gesture-handler + Reanimated

```bash
npm install react-native-gesture-handler react-native-reanimated
```

-   Full control over drag behavior
-   Support for dragging between boards
-   More complex implementation

#### Option 3: @dnd-kit (React DnD)

-   Web-first but has React Native support
-   Accessibility built-in
-   Best for complex multi-board scenarios

### Recommended Implementation (Option 2)

1. **Install dependencies**

    ```bash
    npm install react-native-gesture-handler react-native-reanimated
    npx pod-install # iOS only
    ```

2. **Update babel.config.js**

    ```js
    plugins: ["react-native-reanimated/plugin"];
    ```

3. **Wrap boards in PanGestureHandler**

    - Detect long-press to initiate drag
    - Track gesture position
    - Show visual feedback (shadow/opacity)
    - Drop on release over valid target

4. **State management for drag**
    - Track dragged task ID
    - Track source/target board IDs
    - Update boards state on drop
    - Animate task removal/addition

### Quick Start Example

```tsx
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
    useAnimatedGestureHandler,
    useSharedValue,
} from "react-native-reanimated";

// In TaskCard component
const translateX = useSharedValue(0);
const translateY = useSharedValue(0);

const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
        ctx.startX = translateX.value;
        ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
        translateX.value = ctx.startX + event.translationX;
        translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
        // Handle drop logic
    },
});
```

## Usage

### Navigate to Workflow

From ManagementScreen, tap the arrow button on any project card:

```tsx
navigation.navigate("ProjectWorkflow", {
    projectId: item.id,
    projectName: item.title,
    collaborator: item.partner,
});
```

### Add a Task

1. Tap "Add Task" button at bottom of board
2. Enter task title
3. Tap "Add"
4. Task appears with default priority (medium)

### Edit a Task

1. Tap task card to expand
2. Tap "Edit" button
3. Modify fields (title, description, priority, assignee)
4. Tap "Save"

### Complete/Delete Tasks

-   Tap checkbox to mark complete (strikethrough styling)
-   Tap "Delete" in expanded view (confirmation alert)

## Mock Data

Currently uses hardcoded mock data. To integrate with backend:

1. Replace initial state with API call
2. Add board/task CRUD service functions
3. Update state management (consider Context API or Zustand)
4. Add real-time sync (Firebase Firestore listeners)

## Next Steps

1. Implement drag-and-drop between boards
2. Add task filtering (by priority, assignee, completion)
3. Add task search functionality
4. Persist changes to Firebase/backend
5. Add real-time collaboration updates
6. Add task attachments/comments
7. Add due dates and reminders

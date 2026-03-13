# Agent Rules and Guidelines

This document defines strict rules and conventions for the component-connector project. All code contributions must follow these guidelines.

## 🚫 File Creation Rules

**NEVER create the following files unless explicitly and rigidly requested by the user:**

- Markdown documentation files (`.md`)
- Example files
- Demo files
- Sample files
- Tutorial files

Focus on implementing functional code that solves the actual problem, not documentation or examples.

## � Code Quality Automation

**MANDATORY RULE: After ANY code changes, ALWAYS run linting and formatting commands.**

### Required Commands After Code Changes

Whenever you complete any action that modifies code files (`.ts`, `.tsx`, `.js`, `.jsx`, `.css`, etc.), you MUST execute these commands in sequence:

```bash
yarn format
yarn lint:fix
```

### When to Run These Commands

Run the commands after:

- Creating new files (components, hooks, utilities, etc.)
- Editing existing files
- Refactoring code
- Implementing features
- Fixing bugs
- Any other code modification

### Why This Is Critical

1. **Consistency**: Ensures all code follows the same formatting standards
2. **Quality**: Catches linting errors before they become problems
3. **Clean Commits**: Prevents formatting-only commits in the future
4. **CI/CD**: Ensures code passes automated checks

### Workflow

1. Make code changes (create/edit files)
2. Run `yarn format` to format all code
3. Run `yarn lint:fix` to auto-fix linting issues
4. Verify no errors remain
5. Commit changes

**This is non-negotiable. NEVER skip this step after making code changes.**

## �💬 Code Comments Policy

**NEVER add comments to code unless they are of EXTREME importance and relevance.**

### Why No Comments?

Code must be self-documenting and readable enough to not require comments. Instead of adding comments:

- Use descriptive variable and function names
- Break complex logic into well-named smaller functions
- Write clear, idiomatic code that expresses intent

### When Comments Are Acceptable

Comments are only acceptable in these rare cases:

- Explaining non-obvious algorithmic complexity or mathematical formulas
- Documenting workarounds for known bugs in dependencies
- Clarifying critical business logic that cannot be made obvious through code structure
- Explaining WHY something is done a certain way when it's not obvious (never explain WHAT the code does)

**Examples of BAD comments (never write these):**

```tsx
// Set the color to red
const color = 'red';

// Loop through items
items.forEach(item => {
  // Process the item
  processItem(item);
});
```

**Examples of ACCEPTABLE comments (rare cases only):**

```tsx
// Using setTimeout instead of requestAnimationFrame due to React 18 batching behavior
// See: https://github.com/facebook/react/issues/24331
setTimeout(() => updateCanvas(), 0);

// Bresenham's line algorithm for wire routing
// Formula: error = dx - dy
```

## 🎯 Component Props Destructuring Rules

**CRITICAL RULE: Always use `props: ComponentProps` parameter format.**

### ✅ CORRECT Pattern

```tsx
export interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button(props: PropsWithChildren<ButtonProps>) {
  return (
    <button onClick={props.onClick} disabled={props.disabled}>
      {props.label}
      {props.children}
    </button>
  );
}
```

### ❌ WRONG Pattern (NEVER DO THIS)

```tsx
// WRONG: Never destructure in function parameters
export function Button({ label, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### 🔧 Exception: Destructuring with Rest Props

The ONLY acceptable use of destructuring is when you need to extract specific props and pass the rest down:

```tsx
export function Button(props: PropsWithChildren<ButtonProps>) {
  const { className, ...rest } = props;

  return (
    <button className={`btn ${className || ''}`} {...rest}>
      {props.children}
    </button>
  );
}
```

**Important:** Only use this pattern when `...rest` is truly necessary for forwarding props. If you don't need to forward props, use the standard `props.propName` pattern.

### ❌ ALSO FORBIDDEN: Destructuring Inside Function Body

**DO NOT destructure props inside the function body unless using rest operator:**

```tsx
// ❌ WRONG: Destructuring inside function
export function Button(props: ButtonProps) {
  const { label, onClick, disabled } = props; // NEVER DO THIS

  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

// ❌ WRONG: Destructuring nested objects
export function ComponentCard(props: ComponentCardProps) {
  const { x, y } = props.position; // FORBIDDEN
  const { name, id } = props.component; // FORBIDDEN

  return <div style={{ left: x, top: y }}>{name}</div>;
}

// ✅ CORRECT: Use props directly
export function ComponentCard(props: ComponentCardProps) {
  return (
    <div style={{ left: props.position.x, top: props.position.y }}>
      {props.component.name}
    </div>
  );
}

// ✅ CORRECT: Only acceptable destructuring is with rest operator
export function Button(props: PropsWithChildren<ButtonProps>) {
  const { className, ...rest } = props; // OK: using ...rest

  return (
    <button className={`btn ${className || ''}`} {...rest}>
      {props.children}
    </button>
  );
}
```

### Why This Rule Exists

1. **Consistency**: All components follow the same pattern
2. **Clarity**: It's always clear where values come from (`props.value`)
3. **Refactoring Safety**: Easier to modify prop access patterns
4. **Mental Model**: Reinforces that props is a single object passed to the component
5. **Code Review**: Violations are immediately visible
6. **Prevents Confusion**: No mixing of destructured and props.\* syntax

## � Component Reusability and Architecture

**CRITICAL RULE: All React components must be reusable and composable.**

### Component Library Philosophy

The project must maintain a comprehensive library of reusable React components. Every UI element should be implemented as a reusable component in the `src/components/` directory.

### When to Create a Reusable Component

Create a new reusable component for:

- **Buttons**: Any clickable action element
- **Inputs**: Text fields, checkboxes, selects, etc.
- **Cards**: Container elements for grouped content
- **Modals**: Dialog boxes and overlays
- **Sidebars**: Navigation or tool panels
- **Forms**: Input groups and form controls
- **Lists**: Repeatable item displays
- **Layout Components**: Headers, footers, containers, grids

### ❌ WRONG Pattern (NEVER DO THIS)

```tsx
// WRONG: Inline button implementation
export function UserProfile() {
  return (
    <div>
      <button
        style={{ background: 'blue', color: 'white', padding: '8px 16px' }}
        onClick={handleSave}
      >
        Save
      </button>
      <button
        style={{ background: 'blue', color: 'white', padding: '8px 16px' }}
        onClick={handleCancel}
      >
        Cancel
      </button>
    </div>
  );
}
```

### ✅ CORRECT Pattern

```tsx
// CORRECT: Use reusable Button component
import { Button } from '../components/Button';

export function UserProfile() {
  return (
    <div>
      <Button onClick={handleSave}>Save</Button>
      <Button onClick={handleCancel}>Cancel</Button>
    </div>
  );
}
```

### Component Composition Rules

1. **Always check if a component already exists** before creating inline JSX
2. **Use existing components** from `src/components/` whenever possible
3. **Extend existing components** instead of creating similar ones
4. **Create new reusable components** when the pattern will be used more than once

### Breaking Down Large Components

**CRITICAL RULE: Large components must be divided into smaller, focused components.**

### When to Split a Component

Split a component when it:

- Exceeds **150-200 lines** of code
- Contains **multiple distinct sections** of UI
- Has **complex logic** that can be isolated
- Contains **repeating patterns** that could be extracted
- Becomes **difficult to understand** at a glance
- Has **too many functions or handlers** (even if JSX is simple)
- Manages **too much state** or business logic

**IMPORTANT**: Components must be small, clear, and objective. If a component is large due to many functions or complex logic (not just JSX), it MUST be refactored using React patterns.

### Strategies for Managing Complex Logic

When a component is large due to functions and logic, use these React patterns:

#### 1. Context API for Shared State

Extract shared state and logic to a Context Provider:

```tsx
// ProjectContext.ts - Extract state management
export interface ProjectContextValue {
  project: Project;
  updateProject: (updates: Partial<Project>) => void;
  addComponent: (component: Component) => void;
  removeComponent: (id: string) => void;
}

export const ProjectContext = createContext<ProjectContextValue | null>(null);

// ProjectProvider.tsx - Manage complex logic
export function ProjectProvider(props: PropsWithChildren) {
  const [project, setProject] = useState<Project>(initialProject);

  const updateProject = (updates: Partial<Project>) => {
    // Complex logic here
  };

  const addComponent = (component: Component) => {
    // Complex logic here
  };

  const removeComponent = (id: string) => {
    // Complex logic here
  };

  const value = { project, updateProject, addComponent, removeComponent };

  return (
    <ProjectContext.Provider value={value}>
      {props.children}
    </ProjectContext.Provider>
  );
}

// useProject.ts - Custom hook for consuming context
export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}
```

Now components remain simple:

```tsx
// Component stays small and focused
export function ProjectCanvas() {
  const { project, addComponent } = useProject();

  return <canvas>{/* Simple rendering logic */}</canvas>;
}
```

#### 2. Custom Hooks for Complex Logic

Extract complex logic into custom hooks:

```tsx
// useProjectHistory.ts - Extract undo/redo logic
export function useProjectHistory(project: Project) {
  const [history, setHistory] = useState<Project[]>([project]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const undo = () => {
    // Complex undo logic
  };

  const redo = () => {
    // Complex redo logic
  };

  const addToHistory = (newProject: Project) => {
    // Complex history management
  };

  return { undo, redo, addToHistory, canUndo, canRedo };
}

// Component uses the hook
export function ProjectToolbar() {
  const { project } = useProject();
  const { undo, redo, canUndo, canRedo } = useProjectHistory(project);

  return (
    <div>
      <IconButton onClick={undo} disabled={!canUndo}>
        Undo
      </IconButton>
      <IconButton onClick={redo} disabled={!canRedo}>
        Redo
      </IconButton>
    </div>
  );
}
```

#### 3. Split into Smaller Components

Break down large components into focused sub-components:

```tsx
// Instead of one large component with many handlers
export function ProjectPage() {
  return (
    <ProjectProvider>
      <ProjectLayout />
    </ProjectProvider>
  );
}

function ProjectLayout() {
  return (
    <>
      <ProjectHeader />
      <ProjectContent />
      <ProjectModals />
    </>
  );
}

function ProjectHeader() {
  // Only header-related logic
}

function ProjectContent() {
  // Only content-related logic
}

function ProjectModals() {
  // Only modal-related logic
}
```

### Component Size Philosophy

**Every component should be:**

- **Small**: Under 150 lines including logic
- **Clear**: Purpose obvious from name and structure
- **Objective**: Does ONE thing well

**If a component is complex due to:**

- **Many handlers/functions** → Extract to custom hooks or Context
- **State management** → Extract to Context Provider
- **Business logic** → Extract to utility functions or custom hooks
- **Multiple UI sections** → Split into smaller components

### ❌ WRONG Pattern (Large Component with Too Much Logic)

```tsx
// WRONG: 500+ line component with state, handlers, and UI all mixed together
export function ProjectPage() {
  const [project, setProject] = useState<Project>(initialProject);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );
  const [history, setHistory] = useState<Project[]>([]);
  const [clipboard, setClipboard] = useState<Component | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 10+ more state declarations...

  const handleAddComponent = (component: Component) => {
    // 20 lines of complex logic
  };

  const handleUpdateComponent = (id: string, updates: Partial<Component>) => {
    // 30 lines of complex logic
  };

  const handleUndo = () => {
    // 25 lines of complex logic
  };

  const handleRedo = () => {
    // 25 lines of complex logic
  };

  const handleCopy = () => {
    // 15 lines of complex logic
  };

  const handlePaste = () => {
    // 20 lines of complex logic
  };

  // 10+ more handler functions...

  useEffect(
    () => {
      // 50 lines of complex effect logic
    },
    [
      /* many dependencies */
    ]
  );

  // 200+ lines of JSX
  return <div>{/* Massive inline JSX with everything */}</div>;
}
```

### ✅ CORRECT Pattern (Composed from Smaller Components)

```tsx
// CORRECT: Logic extracted to Context and custom hooks
// ProjectProvider.tsx - Manages project state (50 lines)
export function ProjectProvider(props: PropsWithChildren) {
  const [project, setProject] = useState<Project>(initialProject);

  const updateProject = (updates: Partial<Project>) => {
    // Focused logic here
  };

  const value = { project, updateProject };
  return (
    <ProjectContext.Provider value={value}>
      {props.children}
    </ProjectContext.Provider>
  );
}

// useProjectHistory.ts - Manages undo/redo (60 lines)
export function useProjectHistory() {
  // Focused history management logic
  return { undo, redo, canUndo, canRedo };
}

// useClipboard.ts - Manages copy/paste (40 lines)
export function useClipboard() {
  // Focused clipboard logic
  return { copy, paste, canPaste };
}

// ProjectPage.tsx - Main page component (30 lines)
export function ProjectPage() {
  return (
    <ProjectProvider>
      <ProjectLayout />
    </ProjectProvider>
  );
}

// ProjectLayout.tsx - Layout composition (20 lines)
function ProjectLayout() {
  return (
    <div>
      <ProjectToolbar />
      <ProjectContent />
      <ProjectModals />
    </div>
  );
}

// ProjectToolbar.tsx - Toolbar with actions (40 lines)
function ProjectToolbar() {
  const { undo, redo } = useProjectHistory();
  const { copy, paste } = useClipboard();

  return (
    <div>
      <IconButton onClick={undo}>Undo</IconButton>
      <IconButton onClick={redo}>Redo</IconButton>
      <IconButton onClick={copy}>Copy</IconButton>
      <IconButton onClick={paste}>Paste</IconButton>
    </div>
  );
}

// ProjectContent.tsx - Main content area (50 lines)
function ProjectContent() {
  const { project } = useProject();

  return (
    <div>
      <ProjectSidebar components={project.components} />
      <ProjectCanvas project={project} />
    </div>
  );
}

// Each component is small, focused, and easy to understand
```

### Component Extraction Guidelines

1. **Extract repeated JSX patterns** into separate components
2. **Extract logical sections** (sidebar, toolbar, content area)
3. **Extract modal/dialog content** into dedicated components
4. **Extract list items** when rendering collections
5. **Extract form sections** into separate components

### Benefits of Component Composition

- **Maintainability**: Easier to understand and modify smaller components
- **Testability**: Isolated components are easier to test
- **Reusability**: Components can be used in multiple places
- **Performance**: Easier to optimize re-renders with smaller components
- **Collaboration**: Multiple developers can work on different components

## �📝 Summary Checklist

Before submitting code, verify:

- [ ] No unnecessary `.md` files created
- [ ] No example or demo files created
- [ ] No comments added (unless absolutely critical)- [ ] **`yarn format` and `yarn lint:fix` executed after code changes**- [ ] All component functions use `props: ComponentProps` (not destructured parameters)
- [ ] Destructuring only used when `...rest` forwarding is needed
- [ ] All props accessed via `props.propName` pattern
- [ ] No inline UI elements that should be reusable components
- [ ] Existing components from `src/components/` are reused when applicable
- [ ] Large components (>150-200 lines) are split into smaller, focused components
- [ ] Complex state management extracted to Context API
- [ ] Complex logic extracted to custom hooks
- [ ] Each component is small, clear, and objective (does ONE thing well)
- [ ] New components follow the project structure with barrel exports

---

**These rules are non-negotiable. Code that violates these rules must be refactored.**

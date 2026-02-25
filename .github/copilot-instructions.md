# Project Setup Instructions - React + TypeScript + Vite

## ✅ Completed Setup Steps

- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
      Project: React with TypeScript, ESLint, Prettier, and Husky
      Build tool: Vite
      Package manager: Yarn v4 (with node_modules)

- [x] Customize the Project
  - Configured ESLint with React and TypeScript rules
  - Integrated Prettier for code formatting
  - Setup Husky with pre-commit hooks using lint-staged
  - Setup Commitlint with commit-msg hook for commit message validation
  - Added custom scripts for linting and formatting

- [x] Install Required Extensions
      No additional VS Code extensions required by project setup

- [x] Compile the Project
      Project compiles successfully without errors

- [x] Create and Run Task
      Development server can be started with `yarn dev`

- [x] Launch the Project
      Ready to launch - use `yarn dev` to start development server

- [x] Ensure Documentation is Complete
      README.md updated with comprehensive project information and instructions

## 🎯 Project Configuration Summary

### Tools Configured:

- **Vite** - Fast build tool and dev server
- **React 19** - UI library
- **TypeScript 5.9** - Type safety
- **ESLint 9** - Code linting with React and TypeScript rules
- **Prettier 3.8** - Code formatting
- **Husky 9** - Git hooks
- **lint-staged** - Run linters on staged files
- **Commitlint** - Validate commit messages following Conventional Commits

### Available Scripts:

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn lint` - Check for linting errors
- `yarn lint:fix` - Auto-fix linting errors
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check code formatting

### Pre-commit Hook:

Automatically runs ESLint and Prettier on staged files before each commit.

### Commit-msg Hook:

Validates commit messages using Commitlint to ensure they follow Conventional Commits format.

## 📐 Code Standards

### File Headers:

**IMPORTANT: Do NOT add license headers or any comment blocks at the top of files.**

Never add:

- `@license` comments
- `SPDX-License-Identifier` headers
- Copyright notices
- Any other file header comments

Files should start directly with imports.

### React Component Pattern:

All React components must follow this standard pattern:

```tsx
import { type PropsWithChildren } from 'react';

// Export the interface
export interface ComponentProps {
  // Props definition
}

// Export the component as a named function
export function Component(props: PropsWithChildren<ComponentProps>) {
  return <div>{props.children}</div>;
}
```

**Important Rules:**

- Always export interfaces with `export interface`
- Always export components as named functions with `export function`
- Never use `export default`
- Use `PropsWithChildren<T>` when component accepts children
- Use destructuring in function parameters only when it improves readability

### Component Structure (Barrel Exports):

Each component should be in its own folder with an `index.ts` file for clean imports:

```
components/
  Button/
    Button.tsx       // Component implementation
    Button.css       // Component styles
    index.ts         // Barrel export
```

**index.ts pattern:**

```tsx
export { Component, type ComponentProps } from './Component';
```

This allows clean imports:

```tsx
import { Button } from '../components/Button';
// Instead of: import { Button } from '../components/Button/Button';
```

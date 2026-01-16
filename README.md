# Board Game Frontend

React + TypeScript + Vite application with Material-UI and Tailwind CSS.

## Features

- **Dark Mode Support**: Toggle between light and dark themes
- **Theme Persistence**: Your theme preference is saved and restored across sessions
- **System Preference Detection**: Automatically respects your OS theme preference
- **Material-UI Components**: Full MUI component library integration
- **Tailwind CSS**: Utility-first CSS framework with dark mode support

## Theme Management

### Using the Theme Toggle

The application includes a theme toggle button in the app bar that allows you to switch between light and dark modes. Your preference is automatically saved to localStorage and will be restored on your next visit.

### Using Theme in Custom Components

#### Material-UI Components

MUI components automatically adapt to the current theme. You can access the theme in your components:

```tsx
import { useTheme as useMuiTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useMuiTheme();
  // Use theme.palette.mode, theme.palette.primary.main, etc.
}
```

#### Custom Theme Hook

To access the theme mode and toggle function:

```tsx
import { useTheme } from './theme';

function MyComponent() {
  const { mode, toggleTheme } = useTheme();
  // mode is 'light' | 'dark'
  // toggleTheme() switches between themes
}
```

#### Tailwind Dark Mode Classes

Use Tailwind's `dark:` variant for dark mode styles:

```tsx
<div className="bg-white dark:bg-gray-800 text-black dark:text-white">
  Content that adapts to theme
</div>
```

The `dark` class is automatically added to the `<html>` element when dark mode is active.

## Development

### Prerequisites

- Node.js 18+
- Yarn (or npm)

### Getting Started

1. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

2. Configure environment variables in `.env`:
```env
# API Base URL
VITE_API_BASE_URL=http://localhost:3001/api

# API Key Configuration
VITE_API_KEY=your-secret-api-key-here
```

3. Install dependencies:
```bash
yarn install
```

4. Start development server:
```bash
yarn dev
```

5. Build for production:
```bash
yarn build
```

6. Preview production build:
```bash
yarn preview
```

### Code Formatting

```bash
# Format code
yarn format

# Check formatting
yarn format:check
```

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

import { useState } from 'react';
import { Button, TextField, Box, Typography, Stack, AppBar, Toolbar } from '@mui/material';
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { ThemeToggle } from './components/theme-toggle';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            Board Game
          </Typography>
          <ThemeToggle />
        </Toolbar>
      </AppBar>

      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>

      {/* Test Tailwind utilities */}
      <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg mb-4">
        <p className="text-blue-800 dark:text-blue-200 font-semibold">✓ Tailwind CSS is working!</p>
      </div>

      {/* Test MUI components */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          ✓ Material-UI is working!
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="contained" color="primary" startIcon={<FavoriteIcon />}>
            MUI Button
          </Button>
          <TextField label="Test Input" size="small" />
        </Stack>
      </Box>

      {/* Test both together */}
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <Button variant="outlined" onClick={() => setCount((count) => count + 1)} className="ml-4">
          MUI Counter
        </Button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  );
}

export default App;

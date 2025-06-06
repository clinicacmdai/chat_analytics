import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { Conversations } from './pages/Conversations';
import { Dashboard } from './pages/Dashboard';
import { Insights } from './pages/Insights';
import { Settings } from './pages/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Produtos } from './pages/Produtos';
import { SecurityLogsPage } from './pages/SecurityLogsPage';

// Placeholder components for other pages
// const Dashboard = () => <div>Dashboard</div>;
// const Insights = () => <div>Insights</div>;
// const Settings = () => <div>Settings</div>;
const NotFound = () => <div>404 - Page Not Found</div>;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/conversations"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Conversations />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Insights />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/produtos"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Produtos />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/security-logs"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SecurityLogsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

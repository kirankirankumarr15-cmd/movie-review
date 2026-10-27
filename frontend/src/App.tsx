import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Analyzer from './pages/Analyzer';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import MovieDetails from './pages/MovieDetails';
import Upcoming from './pages/Upcoming';
import UpcomingMovieDetail from './pages/UpcomingMovieDetail';
import TrailerDiagnostics from './pages/TrailerDiagnostics';

function AppContent() {
  const { theme } = useTheme();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin routes: strictly restricted to kirankirankumarr15@gmail.com */}
          <Route path="/admin/diagnostics" element={<AdminRoute><TrailerDiagnostics /></AdminRoute>} />
          <Route path="/diagnostics" element={<AdminRoute><TrailerDiagnostics /></AdminRoute>} />

          {/* Protected routes: login required to use the website */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/movie/:id" element={<ProtectedRoute><MovieDetails /></ProtectedRoute>} />
          <Route path="/upcoming" element={<ProtectedRoute><Upcoming /></ProtectedRoute>} />
          <Route path="/upcoming/:id" element={<ProtectedRoute><UpcomingMovieDetail /></ProtectedRoute>} />
          <Route path="/analyzer" element={<ProtectedRoute><Analyzer /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </div>
      <Footer />
      
      <Toaster 
        theme={theme}
        position="bottom-right"
        toastOptions={{
          style: {
            background: theme === 'dark' ? '#1a1a25' : '#ffffff',
            color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
            borderColor: theme === 'dark' ? '#2a2a3d' : '#e2e8f0',
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

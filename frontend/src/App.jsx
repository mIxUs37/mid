import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-900 text-white">
        <MainApp />
      </div>
    </AuthProvider>
  );
}

function MainApp() {
  const { user, token } = useAuth();
  
  if (!user || !token) {
    return <Login />;
  }
  
  return <Dashboard />;
}

export default App;

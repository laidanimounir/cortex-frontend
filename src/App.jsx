import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen.jsx';
import ChatPage from './pages/ChatPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SharePage from './pages/SharePage.jsx';
import Toast from './components/Toast.jsx';

function App() {
return (
<Router>
<Toast />
<Routes>
<Route path="/" element={<Navigate to="/splash" replace />} />
<Route path="/splash" element={<SplashScreen />} />
<Route path="/chat" element={<ChatPage />} />
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/share/:id" element={<SharePage />} />
<Route path="*" element={<Navigate to="/splash" replace />} />
</Routes>
</Router>
);
}

export default App;
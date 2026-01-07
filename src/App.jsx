import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LanguageSelection from './pages/LanguageSelection.jsx';
import Login from './pages/Login.jsx';
import ChatPage from './pages/ChatPage.jsx';

function App() {
return (
<Router>
<Routes>
<Route path="/" element={<Navigate to="/language" replace />} />
<Route path="/language" element={<LanguageSelection />} />
<Route path="/login" element={<Login />} />
<Route path="/chat" element={<ChatPage />} />
</Routes>
</Router>
);
}

export default App;
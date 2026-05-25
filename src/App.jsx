import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LanguageSelection from './pages/LanguageSelection.jsx';
import ChatPage from './pages/ChatPage.jsx';

function App() {
return (
<Router>
<Routes>
<Route path="/" element={<Navigate to="/language" replace />} />
<Route path="/language" element={<LanguageSelection />} />
<Route path="/chat" element={<ChatPage />} />
<Route path="*" element={<Navigate to="/splash" replace />} />
</Routes>
</Router>
);
}

export default App;
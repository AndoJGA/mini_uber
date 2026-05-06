import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
// (Login and Dashboard components will be added next)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        {/* Placeholder for future routes */}
      </Routes>
    </Router>
  );
}

export default App;
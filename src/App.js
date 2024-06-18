import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import ScrollToAnchor from './components/ScrollAnchor';

function App() {
  return (
    <>
      <Router>
        <ScrollToAnchor />
        <AppRoutes />
      </Router>
    </>
  );
}

export default App;

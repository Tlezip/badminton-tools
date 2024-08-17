import { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Setup from './pages/setup'
import Alonable from './pages/alonable'
import Board from './pages/board'
import { sendLog } from './services/log';
import './App.css';

function App() {
  const handleError = (error: Error | ErrorEvent) => {
    sendLog(error.message, 'error', { error: JSON.stringify(error) })
  }

  useEffect(() => {
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  return (
    <ErrorBoundary onError={handleError} FallbackComponent={() => <div>error</div>}>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route path="/" element={<Setup />} />
          <Route path="alonable" element={<Alonable />} />
          <Route path="board" element={<ErrorBoundary onError={handleError} FallbackComponent={() => <div>error</div>}><Board /></ErrorBoundary>} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App;

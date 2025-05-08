import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CreateTokenPage } from './pages/CreateTokenPage';
import { MintTokensPage } from './pages/MintTokensPage';
import { TransactionVerificationPage } from './pages/CompressTokensPage';
import { ClaimTokensPage } from './pages/ClaimTokensPage';
import { SystemStatusPage } from './pages/SystemStatusPage';
import { DocumentationPage } from './pages/DocumentationPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AnimatePresence } from 'framer-motion';
import { TestWalletProvider } from './context/TestWalletProvider';

const App: React.FC = () => {
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <TestWalletProvider>
      <div className="app">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create-token" element={<CreateTokenPage />} />
              <Route path="/mint-tokens" element={<MintTokensPage />} />
              <Route path="/transaction-verification" element={<TransactionVerificationPage />} />
              <Route path="/claim-tokens" element={<ClaimTokensPage />} />
              <Route path="/system-status" element={<SystemStatusPage />} />
              <Route path="/docs" element={<DocumentationPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </TestWalletProvider>
  );
};

export default App; 
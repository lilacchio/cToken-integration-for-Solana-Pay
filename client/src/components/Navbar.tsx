import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../context/ThemeProvider';
import { WalletSelector } from './WalletSelector';

const NavbarContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: var(--z-index-sticky);
  background-color: var(--color-background);
  box-shadow: var(--shadow-sm);
  transition: background-color var(--transition-normal);
`;

const NavInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem var(--space-4);
  max-width: 1200px;
  margin: 0 auto;
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  text-decoration: none;
  
  img {
    height: 32px;
    margin-right: var(--space-2);
  }
`;

const NavLinks = styled.nav`
  display: flex;
  gap: var(--space-6);
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)<{ $isActive?: boolean }>`
  color: ${props => props.$isActive ? 'var(--color-primary)' : 'var(--color-on-surface)'};
  font-weight: ${props => props.$isActive ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)'};
  text-decoration: none;
  transition: color var(--transition-fast);
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: ${props => props.$isActive ? '100%' : '0'};
    height: 2px;
    background-color: var(--color-primary);
    transition: width var(--transition-normal);
  }
  
  &:hover {
    color: var(--color-primary);
    
    &:after {
      width: 100%;
    }
  }
`;

const NavControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  color: var(--color-on-surface);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--color-surface-variant);
  }
  
  svg {
    font-size: 1.25rem;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--color-on-surface);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-full);
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--color-surface-variant);
  }
  
  svg {
    font-size: 1.5rem;
  }
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-background);
  z-index: var(--z-index-modal);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
`;

const MobileMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
`;

const MobileNavLinks = styled.nav`
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  margin-bottom: var(--space-8);
`;

const MobileNavLink = styled(Link)<{ $isActive?: boolean }>`
  color: ${props => props.$isActive ? 'var(--color-primary)' : 'var(--color-on-surface)'};
  font-size: var(--font-size-xl);
  font-weight: ${props => props.$isActive ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)'};
  text-decoration: none;
`;

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Navigation links definition
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/create-token', label: 'Create Token' },
    { path: '/mint-tokens', label: 'Mint Tokens' },
    { path: '/transaction-verification', label: 'Transaction Verification' },
    { path: '/claim-tokens', label: 'Claim Tokens' },
    { path: '/system-status', label: 'System Status' },
    { path: '/docs', label: 'Documentation' },
  ];

  // Handle scroll events to add shadow to navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on location change
  useEffect(() => {
    closeMenu();
  }, [location]);

  return (
    <NavbarContainer style={{ boxShadow: scrolled ? 'var(--shadow-md)' : 'var(--shadow-sm)' }}>
      <NavInner>
        <LogoLink to="/">
          <img src="/logo.svg" alt="Solana POP" />
          Solana POP
        </LogoLink>
        
        <NavLinks>
          {navLinks.map((link) => (
            <NavLink 
              key={link.path} 
              to={link.path} 
              $isActive={location.pathname === link.path}
            >
              {link.label}
            </NavLink>
          ))}
        </NavLinks>
        
        <NavControls>
          <ThemeToggle onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </ThemeToggle>
          <WalletSelector />
          <MenuButton onClick={toggleMenu} aria-label="Menu">
            <FiMenu />
          </MenuButton>
        </NavControls>
      </NavInner>
      
      <AnimatePresence>
        {isMenuOpen && (
          <MobileMenu
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <MobileMenuHeader>
              <LogoLink to="/">
                <img src="/logo.svg" alt="Solana POP" />
                Solana POP
              </LogoLink>
              <MenuButton onClick={toggleMenu} aria-label="Close menu">
                <FiX />
              </MenuButton>
            </MobileMenuHeader>
            
            <MobileNavLinks>
              {navLinks.map((link) => (
                <MobileNavLink 
                  key={link.path} 
                  to={link.path} 
                  $isActive={location.pathname === link.path}
                  onClick={closeMenu}
                >
                  {link.label}
                </MobileNavLink>
              ))}
            </MobileNavLinks>
            
            <ThemeToggle onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? (
                <>
                  <FiMoon style={{ marginRight: 'var(--space-2)' }} />
                  Switch to Dark Mode
                </>
              ) : (
                <>
                  <FiSun style={{ marginRight: 'var(--space-2)' }} />
                  Switch to Light Mode
                </>
              )}
            </ThemeToggle>
            
            <div style={{ marginTop: 'var(--space-6)' }}>
              <WalletSelector />
            </div>
          </MobileMenu>
        )}
      </AnimatePresence>
    </NavbarContainer>
  );
}; 
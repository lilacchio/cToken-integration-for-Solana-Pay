import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
  text-align: center;
`;

const PageTitle = styled(motion.h1)`
  margin-bottom: var(--space-6);
`;

const HomeButton = styled(Link)`
  display: inline-block;
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-5);
  background-color: var(--color-primary);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--color-primary-dark);
  }
`;

export const NotFoundPage: React.FC = () => {
  return (
    <PageContainer>
      <PageTitle
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        404 - Page Not Found
      </PageTitle>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <HomeButton to="/">Return to Home</HomeButton>
    </PageContainer>
  );
}; 
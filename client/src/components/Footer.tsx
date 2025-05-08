import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: var(--color-surface);
  padding: var(--space-6) var(--space-4);
  text-align: center;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Copyright = styled.p`
  color: var(--color-on-surface-muted);
  font-size: var(--font-size-sm);
`;

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <Copyright>
          &copy; {currentYear} Solana POP | All rights reserved
        </Copyright>
      </FooterContent>
    </FooterContainer>
  );
}; 
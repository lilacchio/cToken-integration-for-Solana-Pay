import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiChevronRight, FiLayers, FiZap, FiShield, FiCode } from 'react-icons/fi';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Styled components
const HeroSection = styled.section`
  padding: var(--space-10) var(--space-4);
  background: linear-gradient(120deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  color: white;
  text-align: center;
  clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
  margin-bottom: var(--space-10);
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const HeroTitle = styled(motion.h1)`
  font-size: var(--font-size-5xl);
  margin-bottom: var(--space-4);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-4xl);
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-6);
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-lg);
  }
`;

const ButtonGroup = styled(motion.div)`
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
  }
`;

const PrimaryButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: var(--space-3) var(--space-5);
  background-color: white;
  color: var(--color-primary);
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  svg {
    margin-left: var(--space-2);
  }
`;

const SecondaryButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: var(--space-3) var(--space-5);
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }
  
  svg {
    margin-left: var(--space-2);
  }
`;

const ButtonLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--color-primary-dark);
    transform: translateY(-2px);
  }
  
  svg {
    margin-left: var(--space-2);
  }
`;

const FeaturesSection = styled.section`
  padding: var(--space-8) var(--space-4);
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled(motion.h2)`
  text-align: center;
  margin-bottom: var(--space-8);
  color: var(--color-on-surface);
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -16px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background-color: var(--color-primary);
    border-radius: var(--radius-full);
  }
`;

const FeatureGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
`;

const FeatureCard = styled(motion.div)`
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  background-color: var(--color-primary-light);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-4);
  
  svg {
    font-size: 1.8rem;
  }
`;

const FeatureTitle = styled.h3`
  margin-bottom: var(--space-3);
`;

const FeatureDescription = styled.p`
  color: var(--color-on-surface-muted);
  font-size: var(--font-size-sm);
`;

const WorkflowSection = styled.section`
  padding: var(--space-10) var(--space-4);
  background-color: var(--color-surface);
  margin-top: var(--space-10);
`;

const WorkflowContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const WorkflowSteps = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
  margin-top: var(--space-8);
`;

const WorkflowStep = styled(motion.div)`
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: var(--space-4);
  align-items: center;
`;

const StepNumber = styled.div`
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xl);
`;

const StepContent = styled.div``;

const StepTitle = styled.h3`
  margin-bottom: var(--space-2);
`;

const StepDescription = styled.p`
  color: var(--color-on-surface-muted);
`;

const CtaSection = styled.section`
  padding: var(--space-10) var(--space-4);
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const CtaTitle = styled(motion.h2)`
  margin-bottom: var(--space-5);
`;

const CtaDescription = styled(motion.p)`
  font-size: var(--font-size-lg);
  color: var(--color-on-surface-muted);
  margin-bottom: var(--space-6);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-md);
  }
`;

const CtaButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--color-primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  svg {
    margin-left: var(--space-2);
  }
`;

const HackathonBanner = styled.div`
  margin: var(--space-6) 0;
  padding: var(--space-4);
  background-color: rgba(153, 69, 255, 0.1);
  border-left: 4px solid var(--color-primary);
  border-radius: var(--radius-md);
  
  h2 {
    color: var(--color-primary);
    margin-bottom: var(--space-2);
  }
  
  p {
    margin-bottom: var(--space-3);
  }
`;

export const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection>
        <HeroContent>
          <HeroTitle
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            Solana POP Token System
          </HeroTitle>
          <HeroSubtitle
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            Create and distribute compressed token proofs of participation using ZK compression technology on Solana
          </HeroSubtitle>
          <ButtonGroup
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.4 }}
          >
            <PrimaryButton to="/create-token">
              Get Started <FiChevronRight />
            </PrimaryButton>
            <SecondaryButton to="/docs">
              Learn More <FiChevronRight />
            </SecondaryButton>
          </ButtonGroup>
        </HeroContent>
      </HeroSection>
      
      <FeaturesSection>
        <SectionTitle
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideUp}
        >
          Key Features
        </SectionTitle>
        
        <FeatureGrid
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <FeatureCard variants={slideUp}>
            <FeatureIcon>
              <FiLayers />
            </FeatureIcon>
            <FeatureTitle>ZK Compression</FeatureTitle>
            <FeatureDescription>
              Leverage zero-knowledge compression technology to reduce state costs by orders of magnitude while preserving security and performance.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard variants={slideUp}>
            <FeatureIcon>
              <FiZap />
            </FeatureIcon>
            <FeatureTitle>Efficient Distribution</FeatureTitle>
            <FeatureDescription>
              Distribute thousands of tokens at a fraction of the cost compared to regular token minting and transfers on Solana.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard variants={slideUp}>
            <FeatureIcon>
              <FiShield />
            </FeatureIcon>
            <FeatureTitle>Secure Claiming</FeatureTitle>
            <FeatureDescription>
              Allow participants to securely claim their tokens through QR codes and wallet connections with proper authentication.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard variants={slideUp}>
            <FeatureIcon>
              <FiCode />
            </FeatureIcon>
            <FeatureTitle>Developer Friendly</FeatureTitle>
            <FeatureDescription>
              Simple and well-documented API endpoints for integrating token creation, minting, compression, and distribution into your applications.
            </FeatureDescription>
          </FeatureCard>
        </FeatureGrid>
      </FeaturesSection>
      
      <WorkflowSection>
        <WorkflowContainer>
          <SectionTitle
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
          >
            How It Works
          </SectionTitle>
          
          <WorkflowSteps
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <WorkflowStep variants={slideUp}>
              <StepNumber>1</StepNumber>
              <StepContent>
                <StepTitle>Create Token Type</StepTitle>
                <StepDescription>
                  Start by creating a new POP token type with custom name, symbol, and metadata URI that represents your event or achievement.
                </StepDescription>
              </StepContent>
            </WorkflowStep>
            
            <WorkflowStep variants={slideUp}>
              <StepNumber>2</StepNumber>
              <StepContent>
                <StepTitle>Mint Tokens to Treasury</StepTitle>
                <StepDescription>
                  Mint the desired quantity of tokens to a treasury wallet that will be used to distribute tokens to participants.
                </StepDescription>
              </StepContent>
            </WorkflowStep>
            
            <WorkflowStep variants={slideUp}>
              <StepNumber>3</StepNumber>
              <StepContent>
                <StepTitle>Compress Tokens</StepTitle>
                <StepDescription>
                  Apply ZK compression to your tokens, significantly reducing the cost and resource requirements for token distribution.
                </StepDescription>
              </StepContent>
            </WorkflowStep>
            
            <WorkflowStep variants={slideUp}>
              <StepNumber>4</StepNumber>
              <StepContent>
                <StepTitle>Generate QR Codes</StepTitle>
                <StepDescription>
                  Generate QR codes that participants can scan to claim their tokens through a web app interface, providing a seamless experience.
                </StepDescription>
              </StepContent>
            </WorkflowStep>
          </WorkflowSteps>
        </WorkflowContainer>
      </WorkflowSection>
      
      <CtaSection>
        <CtaTitle
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideUp}
        >
          Ready to Start?
        </CtaTitle>
        <CtaDescription
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          variants={slideUp}
          transition={{ delay: 0.2 }}
        >
          Create your first compressed token type and start distributing proof of participation tokens for your events, hackathons, or community achievements.
        </CtaDescription>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideUp}
          transition={{ delay: 0.4 }}
        >
          <CtaButton to="/create-token">
            Create Your Token <FiChevronRight />
          </CtaButton>
        </motion.div>
      </CtaSection>
    </>
  );
}; 
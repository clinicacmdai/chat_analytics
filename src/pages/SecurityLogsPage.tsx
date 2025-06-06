import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { SecurityLogs } from '../components/SecurityLogs';

export const SecurityLogsPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Security Monitoring
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Monitor and analyze security events, authentication attempts, and system activities.
        </Typography>
        <SecurityLogs />
      </Box>
    </Container>
  );
}; 
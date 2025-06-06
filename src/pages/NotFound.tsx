import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          maxWidth: 400,
        }}
      >
        <Typography variant="h1" color="primary">
          404
        </Typography>
        <Typography variant="h5" color="text.secondary" align="center">
          Página não encontrada
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          A página que você está procurando não existe ou foi movida.
        </Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Voltar para o início
        </Button>
      </Paper>
    </Box>
  );
}; 
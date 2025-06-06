import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import { SmartToy } from '@mui/icons-material';
import { supabaseService } from '../services/supabaseService';
import type { Insight } from '../types';
import { formatBrazilianDate } from '../utils/dateUtils';

export const Insights = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const data = await supabaseService.getInsights();
      setInsights(data.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (err) {
      setError('Erro ao carregar histórico de perguntas.');
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const insight = await supabaseService.createInsight(question);
      setInsights((prev) => [insight, ...prev]);
      setQuestion('');
    } catch (err) {
      setError('Erro ao obter resposta da IA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={600} mx="auto" mt={4}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Pergunte à IA
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Pergunte algo como: 'Qual exame é mais citado?' ou 'Quais estados têm mais atendimento?'"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAsk(); }}
          />
          <Button variant="contained" onClick={handleAsk} disabled={loading || !question.trim()}>
            Perguntar
          </Button>
        </Box>
        {loading && (
          <Box display="flex" alignItems="center" gap={1} mt={2}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">Pensando...</Typography>
          </Box>
        )}
        {error && (
          <Typography color="error" mt={2}>{error}</Typography>
        )}
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Histórico de Perguntas
        </Typography>
        <List>
          {insights.length === 0 && (
            <Typography variant="body2" color="text.secondary" align="center">
              Nenhuma pergunta feita ainda.
            </Typography>
          )}
          {insights.map((insight) => (
            <Box key={insight.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <SmartToy />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<>
                    <Typography variant="subtitle2" color="text.primary">Pergunta:</Typography>
                    <Typography variant="body1">{insight.question}</Typography>
                  </>}
                  secondary={<>
                    <Typography variant="subtitle2" color="text.primary" mt={1}>Resposta:</Typography>
                    <Typography variant="body2">{insight.answer}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      {insight.created_at ? formatBrazilianDate(insight.created_at) : ''}
                    </Typography>
                  </>}
                />
              </ListItem>
              <Divider variant="inset" component="li" sx={{ my: 1 }} />
            </Box>
          ))}
        </List>
      </Paper>
    </Box>
  );
}; 
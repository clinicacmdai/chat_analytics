import { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Paper,
  Divider,
  Avatar,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabaseService } from '../services/supabaseService';
import type { Conversation, ChatMessage } from '../types';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { formatBrazilianDate } from '../utils/dateUtils';

export const Conversations = () => {
  console.log('Conversations component rendering');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [contactName, setContactName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [contactNames, setContactNames] = useState<{ [sessionId: string]: string }>({});

  useEffect(() => {
    console.log('Conversations component mounted');
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      console.log('Starting to load conversations...');
      const data = await supabaseService.getConversations();
      console.log('Conversations loaded:', data);
      setConversations(data);
      // Buscar nomes dos contatos em paralelo
      const names: { [sessionId: string]: string } = {};
      await Promise.all(
        data.map(async (conv) => {
          const name = await supabaseService.getContactNameByPhone(conv.session_id);
          if (name) names[conv.session_id] = name;
        })
      );
      setContactNames(names);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (sessionId: string) => {
    console.log('[Conversations] sessionId selecionado:', sessionId);
    try {
      console.log('Loading conversation:', sessionId);
      const conversation = await supabaseService.getConversation(sessionId);
      console.log('Conversation loaded:', conversation);
      setSelectedConversation(conversation);
      // Busca o nome do contato
      const name = await supabaseService.getContactNameByPhone(sessionId);
      setContactName(name);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    return formatBrazilianDate(date);
  };

  // Função para filtrar conversas por número ou termo nas mensagens
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    // Se for número, filtra por session_id
    if (/^\d+$/.test(term)) {
      return conversation.session_id.includes(term);
    }
    // Se for texto, filtra por mensagens
    if (conversation.messages && conversation.messages.length > 0) {
      return conversation.messages.some((msg) =>
        msg.content.toLowerCase().includes(term)
      );
    }
    return false;
  });

  if (loading) {
    console.log('Rendering loading state');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  console.log('Rendering conversations list:', conversations);

  return (
    <Box display="flex" height="calc(100vh - 64px)">
      {/* Lista de conversas */}
      <Paper
        sx={{
          width: 300,
          height: '100%',
          overflow: 'auto',
          borderRight: '1px solid #e0e0e0',
        }}
      >
        {/* Barra de pesquisa */}
        <Box p={2} pb={0}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por número ou termo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <List>
          {filteredConversations.length === 0 ? (
            <ListItem>
              <ListItemText primary="Nenhuma conversa encontrada" />
            </ListItem>
          ) : (
            filteredConversations.map((conversation) => (
              <ListItem key={conversation.session_id} disablePadding>
                <ListItemButton
                  selected={selectedConversation?.session_id === conversation.session_id}
                  onClick={() => handleSelectConversation(conversation.session_id)}
                >
                  <ListItemText
                    primary={
                      contactNames[conversation.session_id]
                        ? `${conversation.session_id} (${contactNames[conversation.session_id]})`
                        : conversation.session_id
                    }
                    secondary={formatDate(conversation.last_message_time)}
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      {/* Visualizador de mensagens */}
      <Box flex={1} p={2} overflow="auto">
        {selectedConversation ? (
          <>
            <Typography variant="h6" gutterBottom>
              Conversa: {selectedConversation.session_id}
              {contactName && (
                <Typography component="span" variant="subtitle1" sx={{ ml: 2, color: 'text.secondary' }}>
                  ({contactName})
                </Typography>
              )}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {selectedConversation.messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    backgroundColor: message.role === 'user' ? '#e3f2fd' : '#f5f5f5',
                  }}
                >
                  <Typography variant="body1">{message.content}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {message.role === 'user' ? 'Você' : 'Assistente'}
                  </Typography>
                  {/* Exibe a data/hora da mensagem */}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {formatDate(selectedConversation.created_at_list ? selectedConversation.created_at_list[index] : selectedConversation.last_message_time)}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </>
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <Typography variant="h6" color="text.secondary">
              Selecione uma conversa para visualizar
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}; 
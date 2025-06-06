import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
} from '@mui/material';
import { Lock, Group, Notifications, IntegrationInstructions, Settings as SettingsIcon, Person, CreditCard, BarChart } from '@mui/icons-material';

const tabList = [
  { label: 'Perfil', icon: <Person /> },
  { label: 'Chatbot', icon: <SettingsIcon /> },
  { label: 'Notificações', icon: <Notifications /> },
  { label: 'Integrações', icon: <IntegrationInstructions /> },
  { label: 'Equipe', icon: <Group /> },
  { label: 'Preferências de BI', icon: <BarChart /> },
  { label: 'Plano & Faturamento', icon: <CreditCard /> },
  { label: 'Segurança', icon: <Lock /> },
];

export const Settings = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box maxWidth={700} mx="auto" mt={4}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Configurações"
        >
          {tabList.map((t, idx) => (
            <Tab key={t.label} icon={t.icon} label={t.label} />
          ))}
        </Tabs>
      </Paper>
      {/* Conteúdo das Abas */}
      <Paper sx={{ p: 3 }}>
        {tab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>Perfil do Usuário</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar sx={{ width: 56, height: 56 }}>U</Avatar>
              <Box>
                <TextField label="Nome" defaultValue="Usuário Gestor" sx={{ mb: 1 }} fullWidth />
                <TextField label="Email" defaultValue="gestor@email.com" sx={{ mb: 1 }} fullWidth />
                <Button variant="outlined">Alterar Senha</Button>
              </Box>
            </Box>
            <Button variant="contained">Salvar Alterações</Button>
          </Box>
        )}
        {tab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>Configurações do Chatbot</Typography>
            <Divider sx={{ mb: 2 }} />
            <TextField label="Mensagem de Boas-vindas" fullWidth sx={{ mb: 2 }} defaultValue="Olá! Como posso ajudar?" />
            <TextField label="Horário de Atendimento" fullWidth sx={{ mb: 2 }} defaultValue="08:00 - 18:00" />
            <TextField label="Palavras-chave para atendimento humano" fullWidth sx={{ mb: 2 }} defaultValue="humano, atendente, falar com alguém" />
            <FormControlLabel control={<Switch defaultChecked />} label="Canal WhatsApp Ativo" />
            <FormControlLabel control={<Switch />} label="Canal Web Ativo" />
            <Button variant="contained" sx={{ mt: 2 }}>Salvar Configurações</Button>
          </Box>
        )}
        {tab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>Notificações</Typography>
            <Divider sx={{ mb: 2 }} />
            <FormControlLabel control={<Switch defaultChecked />} label="Receber notificações por email" />
            <FormControlLabel control={<Switch />} label="Alertas de pico de atendimento" />
            <Button variant="contained" sx={{ mt: 2 }}>Salvar Preferências</Button>
          </Box>
        )}
        {tab === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>Integrações</Typography>
            <Divider sx={{ mb: 2 }} />
            <TextField label="Chave de API (OpenAI)" fullWidth sx={{ mb: 2 }} defaultValue="sk-..." />
            <TextField label="Webhook de Nova Conversa" fullWidth sx={{ mb: 2 }} defaultValue="https://..." />
            <Button variant="contained">Salvar Integrações</Button>
          </Box>
        )}
        {tab === 4 && (
          <Box>
            <Typography variant="h6" gutterBottom>Equipe & Permissões</Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem secondaryAction={<Button variant="outlined" size="small">Remover</Button>}>
                <ListItemAvatar><Avatar>A</Avatar></ListItemAvatar>
                <ListItemText primary="Ana Silva" secondary="Admin" />
              </ListItem>
              <ListItem secondaryAction={<Button variant="outlined" size="small">Remover</Button>}>
                <ListItemAvatar><Avatar>B</Avatar></ListItemAvatar>
                <ListItemText primary="Bruno Souza" secondary="Gestor" />
              </ListItem>
            </List>
            <Button variant="contained" sx={{ mt: 2 }}>Adicionar Membro</Button>
          </Box>
        )}
        {tab === 5 && (
          <Box>
            <Typography variant="h6" gutterBottom>Preferências de BI</Typography>
            <Divider sx={{ mb: 2 }} />
            <TextField label="Filtro padrão de período" fullWidth sx={{ mb: 2 }} defaultValue="Últimos 7 dias" />
            <TextField label="Idioma" fullWidth sx={{ mb: 2 }} defaultValue="Português" />
            <TextField label="Fuso horário" fullWidth sx={{ mb: 2 }} defaultValue="America/Sao_Paulo" />
            <Button variant="contained">Salvar Preferências</Button>
          </Box>
        )}
        {tab === 6 && (
          <Box>
            <Typography variant="h6" gutterBottom>Plano & Faturamento</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" mb={2}>Plano atual: <b>Pro</b></Typography>
            <Button variant="outlined" sx={{ mb: 2 }}>Ver Faturas</Button>
            <Button variant="contained">Atualizar Plano</Button>
          </Box>
        )}
        {tab === 7 && (
          <Box>
            <Typography variant="h6" gutterBottom>Segurança</Typography>
            <Divider sx={{ mb: 2 }} />
            <FormControlLabel control={<Switch />} label="Ativar autenticação em dois fatores (2FA)" />
            <Button variant="contained" sx={{ mt: 2 }}>Salvar Segurança</Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}; 
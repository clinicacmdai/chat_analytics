import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import { Chat, People, AccessTime, Update } from '@mui/icons-material';
import { supabaseService } from '../services/supabaseService';
import type { Conversation, DashboardStats } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  formatBrazilianDate,
  formatBrazilianDateOnly,
  formatBrazilianTimeOnly,
  getBrazilianHour,
  getCurrentBrazilianDateTime,
  getStartOfBrazilianDay
} from '../utils/dateUtils';

export const Dashboard = () => {
  const [period, setPeriod] = useState('7d');
  const [channel, setChannel] = useState('all');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [volumeData, setVolumeData] = useState<{ date: string; count: number }[]>([]);
  const [hourlyData, setHourlyData] = useState<{ hour: string; count: number }[]>([]);
  const [dddData, setDDDData] = useState<{ ddd: string; count: number }[]>([]);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const statsData = await supabaseService.getDashboardStats(period);
      setStats(statsData);
      const convs = await supabaseService.getConversations(period);
      setConversations(convs.slice(0, 10)); // Mostra as 10 mais recentes
      setVolumeData(aggregateConversationsByDate(convs));
      setHourlyData(aggregateConversationsByHour(convs));
      
      // Carregar dados de distribuição por DDD
      const dddDistribution = await supabaseService.getDDDDistribution(period);
      setDDDData(dddDistribution);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para agregar conversas por data de início
  const aggregateConversationsByDate = (convs: Conversation[]) => {
    const counts: Record<string, number> = {};
    const now = getCurrentBrazilianDateTime();
    let startDate: Date;

    // Define o período inicial baseado no filtro selecionado
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Inicializa todas as datas no período com contagem 0
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = formatBrazilianDateOnly(d);
      counts[dateStr] = 0;
    }

    // Conta as conversas por data
    convs.forEach((conv) => {
      if (conv.last_message_time) {
        const date = new Date(conv.last_message_time);
        const dateStr = formatBrazilianDateOnly(date);
        if (date >= startDate && date <= now) {
          counts[dateStr] = (counts[dateStr] || 0) + 1;
        }
      }
    });

    // Converte para array e ordena por data
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  };

  // Função para agregar conversas por hora
  const aggregateConversationsByHour = (convs: Conversation[]) => {
    const counts: Record<string, number> = {};
    const now = getCurrentBrazilianDateTime();
    let startDate: Date;

    // Define o período inicial baseado no filtro selecionado
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Inicializa todas as horas com contagem 0
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      counts[hourStr] = 0;
    }

    // Conta as conversas por hora dentro do período selecionado
    convs.forEach((conv) => {
      if (conv.last_message_time) {
        const messageTime = new Date(conv.last_message_time);
        if (messageTime >= startDate && messageTime <= now) {
          const hour = getBrazilianHour(conv.last_message_time).toString().padStart(2, '0');
          counts[hour] = (counts[hour] || 0) + 1;
        }
      }
    });

    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, count]) => ({ hour: `${hour}:00`, count }));
  };

  // Estimar tempo médio de conversa (mock)
  const avgDuration = 'N/A'; // Pode ser calculado se houver timestamps de início/fim

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Topo: Filtros e Cards */}
      <Box mb={3}>
        {/* Filtros */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
            mb: 2,
          }}
        >
          <FormControl fullWidth sx={{ minWidth: 180, flex: 1 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={period}
              label="Período"
              onChange={(e) => setPeriod(e.target.value)}
            >
              <MenuItem value="7d">Últimos 7 dias</MenuItem>
              <MenuItem value="30d">Últimos 30 dias</MenuItem>
              <MenuItem value="custom">Personalizado</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ minWidth: 180, flex: 1 }}>
            <InputLabel>Canal</InputLabel>
            <Select
              value={channel}
              label="Canal"
              onChange={(e) => setChannel(e.target.value)}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="whatsapp">WhatsApp</MenuItem>
              <MenuItem value="web">Web</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ flex: 2, textAlign: { xs: 'left', md: 'right' } }}>
            <Button variant="outlined">Exportar Dados</Button>
          </Box>
        </Box>
        {/* Cards de Resumo */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'space-between',
          }}
        >
          <Card sx={{ flex: 1, minWidth: 220 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Chat color="primary" fontSize="large" />
                <Box>
                  <Typography variant="h5">{stats?.total_conversations ?? '-'}</Typography>
                  <Typography variant="body2">Total de Conversas</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 220 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <People color="secondary" fontSize="large" />
                <Box>
                  <Typography variant="h5">{stats?.unique_sessions ?? '-'}</Typography>
                  <Typography variant="body2">Clientes Únicos</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 220 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AccessTime color="action" fontSize="large" />
                <Box>
                  <Typography variant="h5">{avgDuration}</Typography>
                  <Typography variant="body2">Tempo Médio de Conversa</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 220 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Update color="success" fontSize="large" />
                <Box>
                  <Typography variant="h5">
                    {stats?.last_conversation_time ? formatBrazilianDate(stats.last_conversation_time) : '-'}
                  </Typography>
                  <Typography variant="body2">Última Conversa</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Meio: Gráficos Analíticos (dados reais) */}
      <Box mb={3}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Paper sx={{ p: 2, minHeight: 250, flex: 1, minWidth: 320 }}>
            <Typography variant="subtitle1" gutterBottom>
              Volume de Conversas por Período
            </Typography>
            <Box height={180} display="flex" alignItems="center" justifyContent="center" color="grey.400">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={volumeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fontSize: 12 }}
                    label={{ 
                      value: 'Número de Conversas', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fontSize: 12 }
                    }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value} conversas`, 'Volume']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#1976d2" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
          <Paper sx={{ p: 2, minHeight: 250, flex: 1, minWidth: 320 }}>
            <Typography variant="subtitle1" gutterBottom>
              Volume de Conversas por Hora
            </Typography>
            <Box height={180} display="flex" alignItems="center" justifyContent="center" color="grey.400">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fontSize: 12 }}
                    label={{ 
                      value: 'Número de Conversas', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fontSize: 12 }
                    }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value} conversas`, 'Volume']}
                    labelFormatter={(label) => `Hora: ${label}`}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#1976d2"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
          <Paper sx={{ p: 2, minHeight: 250, flex: 2, minWidth: 640 }}>
            <Typography variant="subtitle1" gutterBottom>
              Clientes Únicos por DDD
            </Typography>
            <Box height={220} sx={{ overflowX: 'auto', width: '100%' }}>
              <Box minWidth={Math.max(dddData.length * 60, 640)}>
                <BarChart
                  width={Math.max(dddData.length * 60, 640)}
                  height={220}
                  data={dddData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="ddd"
                    tick={{ fontSize: 12 }}
                    label={{
                      value: 'DDD',
                      position: 'insideBottom',
                      offset: -5,
                      style: { fontSize: 12 }
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    label={{
                      value: 'Clientes Únicos',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 12 }
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} clientes`, 'Clientes Únicos']}
                    labelFormatter={(label) => `DDD: ${label}`}
                  />
                  <Bar
                    dataKey="count"
                    fill="#1976d2"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Inferior: Lista de Conversas Recentes */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Conversas Recentes
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Início</TableCell>
                <TableCell>Última Mensagem</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {conversations.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.session_id}</TableCell>
                  <TableCell>
                    {row.created_at_list && row.created_at_list.length > 0
                      ? formatBrazilianDate(row.created_at_list[0])
                      : '-'}
                  </TableCell>
                  <TableCell>{row.last_message?.content}</TableCell>
                  <TableCell>aberta</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}; 
import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import { supabaseService } from '../services/supabaseService';
import type { Produto } from '../types';

interface ProdutoFormData {
  descricao: string;
  grupo: string;
  codigo_amb: string;
  codigo_cbhpm: string;
  codigo_tuss: string;
  valor: number;
  ativo: string;
}

const grupos = [
  'Exames',
  'Procedimentos',
  'Consultas',
  'Medicamentos',
  'Outros',
];

export const Produtos = () => {
  // Estados
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState<string>('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState<ProdutoFormData>({
    descricao: '',
    grupo: '',
    codigo_amb: '',
    codigo_cbhpm: '',
    codigo_tuss: '',
    valor: 0,
    ativo: 'S',
  });

  // Carregar produtos
  useEffect(() => {
    loadProdutos();
  }, []);

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const data = await supabaseService.getProdutos();
      setProdutos(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar produtos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtros e busca
  const filteredProdutos = produtos.filter((produto) => {
    const matchesSearch = searchTerm === '' || 
      Object.values(produto).some(value => 
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesGrupo = selectedGrupo === '' || produto.grupo === selectedGrupo;
    return matchesSearch && matchesGrupo;
  });

  // Paginação
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Modal e formulário
  const handleOpenDialog = (produto?: Produto) => {
    if (produto) {
      setEditingProduto(produto);
      setFormData({
        descricao: produto.descricao || '',
        grupo: produto.grupo || '',
        codigo_amb: produto.codigo_amb || '',
        codigo_cbhpm: produto.codigo_cbhpm || '',
        codigo_tuss: produto.codigo_tuss || '',
        valor: produto.valor || 0,
        ativo: produto.ativo || 'S',
      });
    } else {
      setEditingProduto(null);
      setFormData({
        descricao: '',
        grupo: '',
        codigo_amb: '',
        codigo_cbhpm: '',
        codigo_tuss: '',
        valor: 0,
        ativo: 'S',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduto(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingProduto) {
        await supabaseService.updateProduto(editingProduto.id, formData);
      } else {
        await supabaseService.createProduto(formData);
      }
      handleCloseDialog();
      loadProdutos();
    } catch (err) {
      setError('Erro ao salvar produto');
      console.error(err);
    }
  };

  const handleToggleStatus = async (produto: Produto) => {
    try {
      await supabaseService.updateProduto(produto.id, { ativo: produto.ativo === 'S' ? 'N' : 'S' });
      loadProdutos();
    } catch (err) {
      setError('Erro ao atualizar status do produto');
      console.error(err);
    }
  };

  // Formatação
  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Cabeçalho */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Produtos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Novo Produto
        </Button>
      </Box>

      {/* Filtros e Busca */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar por nome, código, grupo, descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Grupo</InputLabel>
              <Select
                value={selectedGrupo}
                label="Grupo"
                onChange={(e) => setSelectedGrupo(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {grupos.map((grupo) => (
                  <MenuItem key={grupo} value={grupo}>
                    {grupo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => {
                setSearchTerm('');
                setSelectedGrupo('');
              }}
            >
              Limpar Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Mensagem de erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Grupo</TableCell>
              <TableCell>Código Auxiliar</TableCell>
              <TableCell>Sigla Auxiliar</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProdutos
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((produto) => (
                <TableRow key={produto.id}>
                  <TableCell>{produto.id}</TableCell>
                  <TableCell>{produto.descricao || '-'}</TableCell>
                  <TableCell>{produto.grupo || '-'}</TableCell>
                  <TableCell>{produto.codigo_amb || '-'}</TableCell>
                  <TableCell>{produto.codigo_cbhpm || '-'}</TableCell>
                  <TableCell>{formatCurrency(produto.valor)}</TableCell>
                  <TableCell>
                    <Chip
                      label={produto.ativo === 'S' ? 'Ativo' : 'Inativo'}
                      color={produto.ativo === 'S' ? 'success' : 'error'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleToggleStatus(produto)}
                      color={produto.ativo === 'S' ? 'error' : 'success'}
                      title={produto.ativo === 'S' ? 'Inativar' : 'Ativar'}
                    >
                      <SwapHorizIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(produto)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProdutos.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página"
        />
      </TableContainer>

      {/* Modal de Cadastro/Edição */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduto ? 'Editar Produto' : 'Novo Produto'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Descrição"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Grupo</InputLabel>
                <Select
                  value={formData.grupo}
                  label="Grupo"
                  onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
                >
                  {grupos.map((grupo) => (
                    <MenuItem key={grupo} value={grupo}>
                      {grupo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Código AMB"
                value={formData.codigo_amb}
                onChange={(e) => setFormData({ ...formData, codigo_amb: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Código CBHPM"
                value={formData.codigo_cbhpm}
                onChange={(e) => setFormData({ ...formData, codigo_cbhpm: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Código TUSS"
                value={formData.codigo_tuss}
                onChange={(e) => setFormData({ ...formData, codigo_tuss: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Valor"
                type="number"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.ativo}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.value })}
                >
                  <MenuItem value="S">Ativo</MenuItem>
                  <MenuItem value="N">Inativo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function Pedidos() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState('Pendiente');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroDescripcion, setFiltroDescripcion] = useState('');

  const fetchPedidos = async () => {
    const { data, error } = await supabase.from('pedidos').select('*, clientes(nombre)').order('fecha', { ascending: false });
    if (error) setError(error.message);
    else setPedidos(data || []);
  };

  const fetchClientes = async () => {
    const { data, error } = await supabase.from('clientes').select('id, nombre').order('nombre');
    if (!error) setClientes(data || []);
  };

  useEffect(() => {
    fetchPedidos();
    fetchClientes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!clienteId) {
      setError('Cliente es obligatorio');
      return;
    }
    if (editId) {
      const { error } = await supabase.from('pedidos').update({ cliente_id: clienteId, descripcion, estado }).eq('id', editId);
      if (error) setError(error.message);
      else {
        setEditId(null);
        setClienteId('');
        setDescripcion('');
        setEstado('Pendiente');
        fetchPedidos();
      }
    } else {
      const { error } = await supabase.from('pedidos').insert({ cliente_id: clienteId, descripcion, estado });
      if (error) setError(error.message);
      else {
        setClienteId('');
        setDescripcion('');
        setEstado('Pendiente');
        fetchPedidos();
      }
    }
  };

  const handleEdit = (p: any) => {
    setEditId(p.id);
    setClienteId(p.cliente_id);
    setDescripcion(p.descripcion);
    setEstado(p.estado);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas borrar este pedido?')) {
      const { error } = await supabase.from('pedidos').delete().eq('id', id);
      if (!error) fetchPedidos();
    }
  };

  // Filtrado
  const pedidosFiltrados = pedidos.filter(p => {
    const clienteOk = p.clientes?.nombre?.toLowerCase().includes(filtroCliente.toLowerCase());
    const fechaOk = filtroFecha ? p.fecha?.startsWith(filtroFecha) : true;
    const estadoOk = filtroEstado ? p.estado === filtroEstado : true;
    const descripcionOk = p.descripcion?.toLowerCase().includes(filtroDescripcion.toLowerCase());
    return clienteOk && fechaOk && estadoOk && descripcionOk;
  });

  return (
  <Box sx={{ maxWidth: 1280, mx: 'auto', p: 2 }}>
      <Typography variant="h4" mb={2} fontWeight={600}>Registro de Pedidos</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 180 }} size="small">
            <InputLabel>Cliente</InputLabel>
            <Select
              value={clienteId}
              label="Cliente"
              onChange={e => setClienteId(e.target.value)}
              required
            >
              <MenuItem value=""><em>Seleccione cliente</em></MenuItem>
              {clientes.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Descripción"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            size="small"
            required
            sx={{ minWidth: 180 }}
          />
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Estado</InputLabel>
            <Select
              value={estado}
              label="Estado"
              onChange={e => setEstado(e.target.value)}
            >
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="En proceso">En proceso</MenuItem>
              <MenuItem value="Completado">Completado</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary">{editId ? 'Guardar' : 'Agregar'}</Button>
          {editId && <Button type="button" color="secondary" onClick={() => { setEditId(null); setClienteId(''); setDescripcion(''); setEstado('Pendiente'); }}>Cancelar</Button>}
        </Box>
        {error && <Typography color="error" mt={2}>{error}</Typography>}
      </Paper>
      {error && <Typography color="error" mb={2}>{error}</Typography>}
      <Stack direction="column" spacing={2} mb={2}>
        <TextField label="Filtrar por cliente" value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} size="small" fullWidth />
        <TextField type="date" label="Filtrar por fecha" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} size="small" InputLabelProps={{ shrink: true }} fullWidth />
        <FormControl sx={{ minWidth: 150 }} size="small" fullWidth>
          <InputLabel>Estado</InputLabel>
          <Select value={filtroEstado} label="Estado" onChange={e => setFiltroEstado(e.target.value)}>
            <MenuItem value="">Todos los estados</MenuItem>
            <MenuItem value="Pendiente">Pendiente</MenuItem>
            <MenuItem value="En proceso">En proceso</MenuItem>
            <MenuItem value="Completado">Completado</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Filtrar por descripción" value={filtroDescripcion} onChange={e => setFiltroDescripcion(e.target.value)} size="small" fullWidth />
      </Stack>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pedidosFiltrados.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.clientes?.nombre || ''}</TableCell>
                <TableCell>{p.descripcion}</TableCell>
                <TableCell>{p.estado}</TableCell>
                <TableCell>{p.fecha ? new Date(p.fecha).toLocaleString() : ''}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleEdit(p)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(p.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Pedidos;

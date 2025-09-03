
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

function Pagos() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState('Efectivo');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroMetodo, setFiltroMetodo] = useState('');
  const [filtroMonto, setFiltroMonto] = useState('');

  const fetchPagos = async () => {
    const { data, error } = await supabase.from('pagos').select('*, clientes(nombre)').order('fecha', { ascending: false });
    if (error) setError(error.message);
    else setPagos(data || []);
  };

  const fetchClientes = async () => {
    const { data, error } = await supabase.from('clientes').select('id, nombre').order('nombre');
    if (!error) setClientes(data || []);
  };

  useEffect(() => {
    fetchPagos();
    fetchClientes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!clienteId || !monto) {
      setError('Cliente y monto son obligatorios');
      return;
    }
    if (editId) {
      const { error } = await supabase.from('pagos').update({ cliente_id: clienteId, monto, metodo }).eq('id', editId);
      if (error) setError(error.message);
      else {
        setEditId(null);
        setClienteId('');
        setMonto('');
        setMetodo('Efectivo');
        fetchPagos();
      }
    } else {
      const { error } = await supabase.from('pagos').insert({ cliente_id: clienteId, monto, metodo });
      if (error) setError(error.message);
      else {
        setClienteId('');
        setMonto('');
        setMetodo('Efectivo');
        fetchPagos();
      }
    }
  };

  const handleEdit = (p: any) => {
    setEditId(p.id);
    setClienteId(p.cliente_id);
    setMonto(p.monto);
    setMetodo(p.metodo);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas borrar este pago?')) {
      const { error } = await supabase.from('pagos').delete().eq('id', id);
      if (!error) fetchPagos();
    }
  };

  // Filtrado
  const pagosFiltrados = pagos.filter(p => {
    const clienteOk = p.clientes?.nombre?.toLowerCase().includes(filtroCliente.toLowerCase());
    const fechaOk = filtroFecha ? p.fecha?.startsWith(filtroFecha) : true;
    const metodoOk = filtroMetodo ? p.metodo === filtroMetodo : true;
    const montoOk = filtroMonto ? String(p.monto).includes(filtroMonto) : true;
    return clienteOk && fechaOk && metodoOk && montoOk;
  });

  return (
  <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h4" mb={2} fontWeight={600}>Registro de Pagos</Typography>
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
            type="number"
            label="Monto"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            size="small"
            required
            sx={{ minWidth: 120 }}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Método</InputLabel>
            <Select
              value={metodo}
              label="Método"
              onChange={e => setMetodo(e.target.value)}
            >
              <MenuItem value="Efectivo">Efectivo</MenuItem>
              <MenuItem value="Transferencia">Transferencia</MenuItem>
              <MenuItem value="Tarjeta">Tarjeta</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary">{editId ? 'Guardar' : 'Agregar'}</Button>
          {editId && <Button type="button" color="secondary" onClick={() => { setEditId(null); setClienteId(''); setMonto(''); setMetodo('Efectivo'); }}>Cancelar</Button>}
        </Box>
        {error && <Typography color="error" mt={2}>{error}</Typography>}
      </Paper>
      {error && <Typography color="error" mb={2}>{error}</Typography>}
      <Stack direction="column" spacing={2} mb={2}>
        <TextField label="Filtrar por cliente" value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} size="small" fullWidth />
        <TextField type="date" label="Filtrar por fecha" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} size="small" InputLabelProps={{ shrink: true }} fullWidth />
        <FormControl sx={{ minWidth: 150 }} size="small" fullWidth>
          <InputLabel>Método</InputLabel>
          <Select value={filtroMetodo} label="Método" onChange={e => setFiltroMetodo(e.target.value)}>
            <MenuItem value="">Todos los métodos</MenuItem>
            <MenuItem value="Efectivo">Efectivo</MenuItem>
            <MenuItem value="Transferencia">Transferencia</MenuItem>
            <MenuItem value="Tarjeta">Tarjeta</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Filtrar por monto" value={filtroMonto} onChange={e => setFiltroMonto(e.target.value)} size="small" fullWidth />
      </Stack>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Método</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagosFiltrados.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.clientes?.nombre || ''}</TableCell>
                <TableCell>{p.monto}</TableCell>
                <TableCell>{p.metodo}</TableCell>
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

export default Pagos;

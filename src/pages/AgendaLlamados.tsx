
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
  Checkbox,
  FormControlLabel,
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

function AgendaLlamados() {
  const [llamados, setLlamados] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [fecha, setFecha] = useState('');
  const [motivo, setMotivo] = useState('');
  const [realizado, setRealizado] = useState(false);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroMotivo, setFiltroMotivo] = useState('');
  const [filtroRealizado, setFiltroRealizado] = useState('');

  const fetchLlamados = async () => {
    const { data, error } = await supabase.from('agenda_llamados').select('*, clientes(nombre)').order('fecha', { ascending: false });
    if (error) setError(error.message);
    else setLlamados(data || []);
  };

  const fetchClientes = async () => {
    const { data, error } = await supabase.from('clientes').select('id, nombre').order('nombre');
    if (!error) setClientes(data || []);
  };

  useEffect(() => {
    fetchLlamados();
    fetchClientes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!clienteId || !fecha) {
      setError('Cliente y fecha son obligatorios');
      return;
    }
    if (editId) {
      const { error } = await supabase.from('agenda_llamados').update({ cliente_id: clienteId, fecha, motivo, realizado }).eq('id', editId);
      if (error) setError(error.message);
      else {
        setEditId(null);
        setClienteId('');
        setFecha('');
        setMotivo('');
        setRealizado(false);
        fetchLlamados();
      }
    } else {
      const { error } = await supabase.from('agenda_llamados').insert({ cliente_id: clienteId, fecha, motivo, realizado });
      if (error) setError(error.message);
      else {
        setClienteId('');
        setFecha('');
        setMotivo('');
        setRealizado(false);
        fetchLlamados();
      }
    }
  };

  const handleEdit = (l: any) => {
    setEditId(l.id);
    setClienteId(l.cliente_id);
    setFecha(l.fecha ? l.fecha.substring(0, 16) : '');
    setMotivo(l.motivo);
    setRealizado(l.realizado);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas borrar este llamado?')) {
      const { error } = await supabase.from('agenda_llamados').delete().eq('id', id);
      if (!error) fetchLlamados();
    }
  };

  // Filtrado
  const llamadosFiltrados = llamados.filter(l => {
    const clienteOk = l.clientes?.nombre?.toLowerCase().includes(filtroCliente.toLowerCase());
    const fechaOk = filtroFecha ? l.fecha?.startsWith(filtroFecha) : true;
    const motivoOk = l.motivo?.toLowerCase().includes(filtroMotivo.toLowerCase());
    const realizadoOk = filtroRealizado === '' ? true : (filtroRealizado === 'sí' ? l.realizado : !l.realizado);
    return clienteOk && fechaOk && motivoOk && realizadoOk;
  });

  return (
  <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h4" mb={2} fontWeight={600}>Agenda de Llamados</Typography>
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
            type="datetime-local"
            label="Fecha"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            size="small"
            required
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />
          <TextField
            label="Motivo"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          />
          <FormControlLabel
            control={<Checkbox checked={realizado} onChange={e => setRealizado(e.target.checked)} />}
            label="Realizado"
          />
          <Button type="submit" variant="contained" color="primary">{editId ? 'Guardar' : 'Agregar'}</Button>
          {editId && <Button type="button" color="secondary" onClick={() => { setEditId(null); setClienteId(''); setFecha(''); setMotivo(''); setRealizado(false); }}>Cancelar</Button>}
        </Box>
        {error && <Typography color="error" mt={2}>{error}</Typography>}
      </Paper>
      {error && <Typography color="error" mb={2}>{error}</Typography>}
      <Stack direction="column" spacing={2} mb={2}>
        <TextField label="Filtrar por cliente" value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} size="small" fullWidth />
        <TextField type="date" label="Filtrar por fecha" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} size="small" InputLabelProps={{ shrink: true }} fullWidth />
        <TextField label="Filtrar por motivo" value={filtroMotivo} onChange={e => setFiltroMotivo(e.target.value)} size="small" fullWidth />
        <FormControl sx={{ minWidth: 120 }} size="small" fullWidth>
          <InputLabel>Realizado</InputLabel>
          <Select value={filtroRealizado} label="Realizado" onChange={e => setFiltroRealizado(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="sí">Realizados</MenuItem>
            <MenuItem value="no">No realizados</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Realizado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {llamadosFiltrados.map(l => (
              <TableRow key={l.id}>
                <TableCell>{l.clientes?.nombre || ''}</TableCell>
                <TableCell>{l.fecha ? new Date(l.fecha).toLocaleString() : ''}</TableCell>
                <TableCell>{l.motivo}</TableCell>
                <TableCell>{l.realizado ? 'Sí' : 'No'}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleEdit(l)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(l.id)} size="small">
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

export default AgendaLlamados;

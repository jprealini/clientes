
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

function Compras() {
  const [compras, setCompras] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precio, setPrecio] = useState('');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('');

  const fetchCompras = async () => {
    const { data, error } = await supabase.from('compras').select('*, clientes(nombre)').order('fecha', { ascending: false });
    if (error) setError(error.message);
    else setCompras(data || []);
  };

  const fetchClientes = async () => {
    const { data, error } = await supabase.from('clientes').select('id, nombre').order('nombre');
    if (!error) setClientes(data || []);
  };

  useEffect(() => {
    fetchCompras();
    fetchClientes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!clienteId || !producto || !precio) {
      setError('Cliente, producto y precio son obligatorios');
      return;
    }
    if (editId) {
      const { error } = await supabase.from('compras').update({ cliente_id: clienteId, producto, cantidad, precio }).eq('id', editId);
      if (error) setError(error.message);
      else {
        setEditId(null);
        setClienteId('');
        setProducto('');
        setCantidad(1);
        setPrecio('');
        fetchCompras();
      }
    } else {
      const { error } = await supabase.from('compras').insert({ cliente_id: clienteId, producto, cantidad, precio });
      if (error) setError(error.message);
      else {
        setClienteId('');
        setProducto('');
        setCantidad(1);
        setPrecio('');
        fetchCompras();
      }
    }
  };

  const handleEdit = (c: any) => {
    setEditId(c.id);
    setClienteId(c.cliente_id);
    setProducto(c.producto);
    setCantidad(c.cantidad);
    setPrecio(c.precio);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas borrar esta compra?')) {
      const { error } = await supabase.from('compras').delete().eq('id', id);
      if (!error) fetchCompras();
    }
  };

  // Filtrado
  const comprasFiltradas = compras.filter(c => {
    const clienteOk = c.clientes?.nombre?.toLowerCase().includes(filtroCliente.toLowerCase());
    const fechaOk = filtroFecha ? c.fecha?.startsWith(filtroFecha) : true;
    const productoOk = c.producto?.toLowerCase().includes(filtroProducto.toLowerCase());
    return clienteOk && fechaOk && productoOk;
  });

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 2 }}>
      <Typography variant="h4" mb={2} fontWeight={600}>Registro de Compras</Typography>
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
            label="Producto"
            value={producto}
            onChange={e => setProducto(e.target.value)}
            size="small"
            required
            sx={{ minWidth: 150 }}
          />
          <TextField
            type="number"
            label="Cantidad"
            value={cantidad}
            onChange={e => setCantidad(Number(e.target.value))}
            size="small"
            required
            sx={{ minWidth: 100 }}
            inputProps={{ min: 1 }}
          />
          <TextField
            type="number"
            label="Precio"
            value={precio}
            onChange={e => setPrecio(e.target.value)}
            size="small"
            required
            sx={{ minWidth: 120 }}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <Button type="submit" variant="contained" color="primary">{editId ? 'Guardar' : 'Agregar'}</Button>
          {editId && <Button type="button" color="secondary" onClick={() => { setEditId(null); setClienteId(''); setProducto(''); setCantidad(1); setPrecio(''); }}>Cancelar</Button>}
        </Box>
        {error && <Typography color="error" mt={2}>{error}</Typography>}
      </Paper>
      {error && <Typography color="error" mb={2}>{error}</Typography>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField
          label="Filtrar por cliente"
          value={filtroCliente}
          onChange={e => setFiltroCliente(e.target.value)}
          size="small"
        />
        <TextField
          type="date"
          label="Filtrar por fecha"
          value={filtroFecha}
          onChange={e => setFiltroFecha(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Filtrar por producto"
          value={filtroProducto}
          onChange={e => setFiltroProducto(e.target.value)}
          size="small"
        />
      </Stack>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comprasFiltradas.map(c => (
              <TableRow key={c.id}>
                <TableCell>{c.clientes?.nombre || ''}</TableCell>
                <TableCell>{c.producto}</TableCell>
                <TableCell>{c.cantidad}</TableCell>
                <TableCell>{c.precio}</TableCell>
                <TableCell>{c.fecha ? new Date(c.fecha).toLocaleString() : ''}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleEdit(c)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(c.id)} size="small">
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

export default Compras;

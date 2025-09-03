import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Box, Typography, TextField, Button, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function Clientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroEmail, setFiltroEmail] = useState('');
  const [filtroCiudad, setFiltroCiudad] = useState('');

  const fetchClientes = async () => {
    const { data, error } = await supabase.from('clientes').select('*').order('creado_en', { ascending: false });
    if (error) setError(error.message);
    else setClientes(data || []);
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (editId) {
      const { error } = await supabase.from('clientes').update({ nombre, telefono, email, direccion, ciudad }).eq('id', editId);
      if (error) setError(error.message);
      else {
        setEditId(null);
        setNombre('');
        setTelefono('');
        setEmail('');
        setDireccion('');
        setCiudad('');
        fetchClientes();
      }
    } else {
      const { error } = await supabase.from('clientes').insert({ nombre, telefono, email, direccion, ciudad });
      if (error) setError(error.message);
      else {
        setNombre('');
        setTelefono('');
        setEmail('');
        setDireccion('');
        setCiudad('');
        fetchClientes();
      }
    }
  };

  const handleEdit = (cliente: any) => {
    setEditId(cliente.id);
    setNombre(cliente.nombre);
    setTelefono(cliente.telefono);
    setEmail(cliente.email);
    setDireccion(cliente.direccion);
    setCiudad(cliente.ciudad || '');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas borrar este cliente?')) {
      const { error } = await supabase.from('clientes').delete().eq('id', id);
      if (!error) fetchClientes();
    }
  };

  // Filtrado
  const clientesFiltrados = clientes.filter(c => {
    const nombreOk = c.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
    const emailOk = c.email?.toLowerCase().includes(filtroEmail.toLowerCase());
    const ciudadOk = c.ciudad?.toLowerCase().includes(filtroCiudad.toLowerCase());
    return nombreOk && emailOk && ciudadOk;
  });

  return (
  <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>Gestión de Clientes</Typography>
      
      {/* Form for adding/editing */}
      <Box sx={{ maxWidth: '1280px', mx: 'auto', mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField label="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required size="small" />
            <TextField label="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} size="small" />
            <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} size="small" />
            <TextField label="Dirección" value={direccion} onChange={e => setDireccion(e.target.value)} size="small" />
            <TextField label="Ciudad" value={ciudad} onChange={e => setCiudad(e.target.value)} size="small" />
            <Button type="submit" variant="contained" color="primary">{editId ? 'Guardar' : 'Agregar'}</Button>
            {editId && <Button type="button" color="secondary" onClick={() => { setEditId(null); setNombre(''); setTelefono(''); setEmail(''); setDireccion(''); setCiudad(''); }}>Cancelar</Button>}
          </Box>
          {error && <Typography color="error" mt={2}>{error}</Typography>}
        </Paper>
      </Box>

      {/* Filters and Table */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Filters */}
        <Box sx={{ width: '250px', flexShrink: 0 }}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="column" spacing={2}>
              <TextField label="Filtrar por nombre" value={filtroNombre} onChange={e => setFiltroNombre(e.target.value)} size="small" fullWidth />
              <TextField label="Filtrar por email" value={filtroEmail} onChange={e => setFiltroEmail(e.target.value)} size="small" fullWidth />
              <TextField label="Filtrar por ciudad" value={filtroCiudad} onChange={e => setFiltroCiudad(e.target.value)} size="small" fullWidth />
            </Stack>
          </Paper>
        </Box>
        
        {/* Table */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 2, width: '100%' }}>
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Teléfono</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Dirección</TableCell>
                    <TableCell>Ciudad</TableCell>
                    <TableCell>Creado en</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientesFiltrados.map(c => (
                    <TableRow key={c.id}>
                      <TableCell>{c.nombre}</TableCell>
                      <TableCell>{c.telefono}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{c.direccion}</TableCell>
                      <TableCell>{c.ciudad}</TableCell>
                      <TableCell>{c.creado_en ? new Date(c.creado_en).toLocaleString() : ''}</TableCell>
                      <TableCell>
                        <IconButton color="primary" size="small" onClick={() => handleEdit(c)}><EditIcon /></IconButton>
                        <IconButton color="error" size="small" onClick={() => handleDelete(c.id)}><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default Clientes;

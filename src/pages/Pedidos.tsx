
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface ProductoPedido {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio: number;
}

interface Pedido {
  id: string; // Este es un UUID
  cliente_id: string; // Este es un UUID
  descripcion: string;
  estado: string;
  fecha: string;
  productos: ProductoPedido[];
  total: number;
  clientes?: {
    nombre: string;
  };
}

function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState('Pendiente');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [productosPedido, setProductosPedido] = useState<ProductoPedido[]>([]);
  
  // Filtros
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroDescripcion, setFiltroDescripcion] = useState('');

  const fetchPedidos = async () => {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*, clientes(nombre), productos_pedido(producto_id, cantidad, precio, productos(nombre))')
      .order('fecha', { ascending: false });
    
    if (error) {
      setError(error.message);
    } else {
      const pedidosFormateados = (data || []).map(p => ({
        ...p,
        productos: (p.productos_pedido || []).map((pp: any) => ({
          producto_id: pp.producto_id,
          nombre: pp.productos?.nombre || '',
          cantidad: pp.cantidad,
          precio: pp.precio
        })),
        total: (p.productos_pedido || []).reduce((acc: number, pp: any) => acc + (pp.precio * pp.cantidad), 0)
      }));
      setPedidos(pedidosFormateados);
    }
  };

  const fetchClientes = async () => {
    const { data, error } = await supabase.from('clientes').select('id, nombre').order('nombre');
    if (!error) setClientes(data || []);
  };

  const fetchProductos = async () => {
    const { data, error } = await supabase.from('productos').select('*').order('nombre');
    if (!error) setProductos(data || []);
  };

  useEffect(() => {
    fetchPedidos();
    fetchClientes();
    fetchProductos();
  }, []);

  const handleAddProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) return;
    
    const producto = productos.find(p => p.id.toString() === productoSeleccionado);
    if (!producto) return;
    
    if (cantidad > producto.stock) {
      setError(`Solo hay ${producto.stock} unidades disponibles`);
      return;
    }
    
    const productoExistente = productosPedido.find(p => p.producto_id === producto.id);
    if (productoExistente) {
      setProductosPedido(productosPedido.map(p => 
        p.producto_id === producto.id 
          ? { ...p, cantidad: p.cantidad + cantidad }
          : p
      ));
    } else {
      setProductosPedido([...productosPedido, {
        producto_id: producto.id,
        nombre: producto.nombre,
        cantidad,
        precio: producto.precio
      }]);
    }
    
    setProductoSeleccionado('');
    setCantidad(1);
  };

  const handleRemoveProducto = (productoId: number) => {
    setProductosPedido(productosPedido.filter(p => p.producto_id !== productoId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!clienteId) {
      setError('Cliente es obligatorio');
      return;
    }

    if (productosPedido.length === 0) {
      setError('Debe agregar al menos un producto');
      return;
    }

    // Verificar stock disponible
    for (const producto of productosPedido) {
      const stockActual = productos.find(p => p.id === producto.producto_id)?.stock || 0;
      if (producto.cantidad > stockActual) {
        setError(`Stock insuficiente para ${producto.nombre}`);
        return;
      }
    }

    try {
      if (editId) {
        // Actualizar pedido
        const { error: errorPedido } = await supabase
          .from('pedidos')
          .update({ 
            cliente_id: clienteId, 
            descripcion, 
            estado 
          })
          .eq('id', editId);

        if (errorPedido) throw errorPedido;

        // Eliminar productos anteriores
        await supabase
          .from('productos_pedido')
          .delete()
          .eq('pedido_id', editId);

        // Insertar nuevos productos
        const { error: errorProductos } = await supabase
          .from('productos_pedido')
          .insert(
            productosPedido.map(p => ({
              pedido_id: editId,
              producto_id: p.producto_id,
              cantidad: p.cantidad,
              precio: p.precio
            }))
          );

        if (errorProductos) throw errorProductos;
      } else {
        // Crear nuevo pedido
        const { data: nuevoPedido, error: errorPedido } = await supabase
          .from('pedidos')
          .insert({ 
            cliente_id: clienteId, 
            descripcion, 
            estado 
          })
          .select()
          .single();

        if (errorPedido) throw errorPedido;

        // Insertar productos del pedido
        const { error: errorProductos } = await supabase
          .from('productos_pedido')
          .insert(
            productosPedido.map(p => ({
              pedido_id: nuevoPedido.id,
              producto_id: p.producto_id,
              cantidad: p.cantidad,
              precio: p.precio
            }))
          );

        if (errorProductos) throw errorProductos;
      }

      // Actualizar stock de productos
      for (const producto of productosPedido) {
        const stockActual = productos.find(p => p.id === producto.producto_id)?.stock || 0;
        await supabase
          .from('productos')
          .update({ stock: stockActual - producto.cantidad })
          .eq('id', producto.producto_id);
      }

      // Limpiar formulario
      setEditId(null);
      setClienteId('');
      setDescripcion('');
      setEstado('Pendiente');
      setProductosPedido([]);
      fetchPedidos();
      fetchProductos();

    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEdit = (p: Pedido) => {
    setEditId(p.id);
    setClienteId(p.cliente_id);
    setDescripcion(p.descripcion);
    setEstado(p.estado);
    setProductosPedido(p.productos || []);
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
  <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h4" mb={2} fontWeight={600}>Registro de Pedidos</Typography>
      
      {/* Form for adding/editing */}
      <Box sx={{ maxWidth: '1280px', mx: 'auto', mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
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
            </Box>

            {/* Agregar productos */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mt: 2 }}>
              <FormControl sx={{ minWidth: 200 }} size="small">
                <InputLabel>Producto</InputLabel>
                <Select
                  value={productoSeleccionado}
                  label="Producto"
                  onChange={e => setProductoSeleccionado(e.target.value)}
                >
                  <MenuItem value=""><em>Seleccione producto</em></MenuItem>
                  {productos
                    .filter(p => p.stock > 0)
                    .map(p => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.nombre} - Stock: {p.stock} - ${p.precio}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
              <TextField
                label="Cantidad"
                type="number"
                value={cantidad}
                onChange={e => setCantidad(parseInt(e.target.value))}
                size="small"
                inputProps={{ min: 1 }}
                sx={{ width: 100 }}
              />
              <Button
                onClick={handleAddProducto}
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
              >
                Agregar
              </Button>
            </Box>

            {/* Lista de productos seleccionados */}
            {productosPedido.length > 0 && (
              <Paper sx={{ mt: 2, p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Productos en el pedido:</Typography>
                <List dense>
                  {productosPedido.map(p => (
                    <ListItem key={p.producto_id}>
                      <ListItemText
                        primary={p.nombre}
                        secondary={`Cantidad: ${p.cantidad} - Precio: $${p.precio} - Subtotal: $${(p.cantidad * p.precio).toFixed(2)}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleRemoveProducto(p.producto_id)} size="small">
                          <RemoveIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                  <ListItem>
                    <ListItemText
                      primary={<Typography variant="subtitle1" fontWeight="bold">
                        Total: ${productosPedido.reduce((acc, p) => acc + (p.precio * p.cantidad), 0).toFixed(2)}
                      </Typography>}
                    />
                  </ListItem>
                </List>
              </Paper>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained" color="primary">
                {editId ? 'Guardar' : 'Agregar'} Pedido
              </Button>
              {editId && (
                <Button 
                  type="button" 
                  color="secondary" 
                  onClick={() => { 
                    setEditId(null); 
                    setClienteId(''); 
                    setDescripcion(''); 
                    setEstado('Pendiente');
                    setProductosPedido([]);
                  }}
                >
                  Cancelar
                </Button>
              )}
            </Box>
          </Box>
          {error && <Typography color="error" mt={2}>{error}</Typography>}
        </Paper>
      </Box>
      {error && <Typography color="error" mb={2}>{error}</Typography>}

      {/* Filters and Table */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Filters */}
        <Box sx={{ width: '250px', flexShrink: 0 }}>
          <Paper sx={{ p: 2 }}>
            <Stack direction="column" spacing={2}>
              <TextField label="Filtrar por cliente" value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} size="small" fullWidth />
              <TextField type="date" label="Filtrar por fecha" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} size="small" InputLabelProps={{ shrink: true }} fullWidth />
              <FormControl size="small" fullWidth>
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
          </Paper>
        </Box>
        
        {/* Table */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 2, width: '100%' }}>
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Productos</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pedidosFiltrados.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{p.clientes?.nombre || ''}</TableCell>
                      <TableCell>
                        <List dense disablePadding>
                          {p.productos.map((prod, index) => (
                            <ListItem key={index} disablePadding>
                              <ListItemText
                                primary={`${prod.nombre} (${prod.cantidad})`}
                                secondary={`$${prod.precio} c/u`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </TableCell>
                      <TableCell>${p.total.toFixed(2)}</TableCell>
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
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default Pedidos;

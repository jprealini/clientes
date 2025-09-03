import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../supabaseClient';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  stock_minimo: number;
  categoria: string;
}

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [stockMinimo, setStockMinimo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');
  
  // Filtros
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroStock, setFiltroStock] = useState('todos'); // todos, bajo, normal

  useEffect(() => {
    fetchProductos();
  }, []);

  async function fetchProductos() {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('nombre');
    
    if (error) {
      console.error('Error al obtener productos:', error);
      return;
    }
    
    setProductos(data || []);
  }

  const productosFiltrados = productos.filter(p => {
    const matchNombre = p.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
    const matchCategoria = !filtroCategoria || p.categoria === filtroCategoria;
    const matchStock = filtroStock === 'todos' ? true :
                      filtroStock === 'bajo' ? p.stock <= p.stock_minimo :
                      p.stock > p.stock_minimo;
    
    return matchNombre && matchCategoria && matchStock;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const productoData = {
      nombre,
      descripcion,
      precio: Number(precio),
      stock: Number(stock),
      stock_minimo: Number(stockMinimo),
      categoria
    };

    let error;
    if (editId) {
      const { error: updateError } = await supabase
        .from('productos')
        .update(productoData)
        .eq('id', editId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('productos')
        .insert(productoData);
      error = insertError;
    }

    if (error) {
      setError(error.message);
      return;
    }

    // Limpiar formulario
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setStock('');
    setStockMinimo('');
    setCategoria('');
    setEditId(null);
    
    fetchProductos();
  };

  const handleEdit = (producto: Producto) => {
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion);
    setPrecio(producto.precio.toString());
    setStock(producto.stock.toString());
    setStockMinimo(producto.stock_minimo.toString());
    setCategoria(producto.categoria);
    setEditId(producto.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) {
      setError(error.message);
      return;
    }

    fetchProductos();
  };

  const categorias = Array.from(new Set(productos.map(p => p.categoria)));

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h4" mb={2} fontWeight={600}>Gestión de Productos</Typography>
      
      {/* Form */}
      <Box sx={{ maxWidth: '1280px', mx: 'auto', mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
              size="small"
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Descripción"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Precio"
              type="number"
              value={precio}
              onChange={e => setPrecio(e.target.value)}
              required
              size="small"
              sx={{ minWidth: 120 }}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              label="Stock"
              type="number"
              value={stock}
              onChange={e => setStock(e.target.value)}
              required
              size="small"
              sx={{ minWidth: 100 }}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Stock Mínimo"
              type="number"
              value={stockMinimo}
              onChange={e => setStockMinimo(e.target.value)}
              required
              size="small"
              sx={{ minWidth: 100 }}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Categoría"
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              required
              size="small"
              sx={{ minWidth: 150 }}
            />
            <Button type="submit" variant="contained" color="primary">
              {editId ? 'Guardar' : 'Agregar'}
            </Button>
            {editId && (
              <Button color="secondary" onClick={() => {
                setEditId(null);
                setNombre('');
                setDescripcion('');
                setPrecio('');
                setStock('');
                setStockMinimo('');
                setCategoria('');
              }}>
                Cancelar
              </Button>
            )}
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
              <TextField
                label="Buscar por nombre"
                value={filtroNombre}
                onChange={e => setFiltroNombre(e.target.value)}
                size="small"
                fullWidth
              />
              <FormControl size="small" fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={filtroCategoria}
                  label="Categoría"
                  onChange={e => setFiltroCategoria(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {categorias.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Stock</InputLabel>
                <Select
                  value={filtroStock}
                  label="Stock"
                  onChange={e => setFiltroStock(e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="bajo">Stock Bajo</MenuItem>
                  <MenuItem value="normal">Stock Normal</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </Box>

        {/* Table */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Precio</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Stock Mín.</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productosFiltrados.map(producto => (
                    <TableRow 
                      key={producto.id}
                      sx={{ 
                        backgroundColor: producto.stock <= producto.stock_minimo ? 'error.light' : 'inherit'
                      }}
                    >
                      <TableCell>{producto.nombre}</TableCell>
                      <TableCell>{producto.descripcion}</TableCell>
                      <TableCell>${producto.precio.toFixed(2)}</TableCell>
                      <TableCell>{producto.stock}</TableCell>
                      <TableCell>{producto.stock_minimo}</TableCell>
                      <TableCell>{producto.categoria}</TableCell>
                      <TableCell align="center">
                        <IconButton color="primary" onClick={() => handleEdit(producto)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => handleDelete(producto.id)} size="small">
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

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

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
    <div>
      <h2>Registro de Compras</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <select value={clienteId} onChange={e => setClienteId(e.target.value)} required>
          <option value="">Seleccione cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>{' '}
        <input placeholder="Producto" value={producto} onChange={e => setProducto(e.target.value)} required />{' '}
        <input type="number" min={1} placeholder="Cantidad" value={cantidad} onChange={e => setCantidad(Number(e.target.value))} required />{' '}
        <input type="number" min={0} step={0.01} placeholder="Precio" value={precio} onChange={e => setPrecio(e.target.value)} required />{' '}
        <button type="submit">{editId ? 'Guardar' : 'Agregar'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setClienteId(''); setProducto(''); setCantidad(1); setPrecio(''); }}>Cancelar</button>}
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: 10 }}>
        <input placeholder="Filtrar por cliente" value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} />{' '}
        <input type="date" placeholder="Filtrar por fecha" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} />{' '}
        <input placeholder="Filtrar por producto" value={filtroProducto} onChange={e => setFiltroProducto(e.target.value)} />
      </div>
      <table border={1} cellPadding={5} style={{ width: '100%', marginTop: 10 }}>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {comprasFiltradas.map(c => (
            <tr key={c.id}>
              <td>{c.clientes?.nombre || ''}</td>
              <td>{c.producto}</td>
              <td>{c.cantidad}</td>
              <td>{c.precio}</td>
              <td>{c.fecha ? new Date(c.fecha).toLocaleString() : ''}</td>
              <td>
                <button onClick={() => handleEdit(c)}>Editar</button>{' '}
                <button onClick={() => handleDelete(c.id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Compras;

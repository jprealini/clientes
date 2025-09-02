import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

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
    <div>
      <h2>Registro de Pedidos</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <select value={clienteId} onChange={e => setClienteId(e.target.value)} required>
          <option value="">Seleccione cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>{' '}
        <input placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} required />{' '}
        <select value={estado} onChange={e => setEstado(e.target.value)}>
          <option value="Pendiente">Pendiente</option>
          <option value="En proceso">En proceso</option>
          <option value="Completado">Completado</option>
        </select>{' '}
        <button type="submit">{editId ? 'Guardar' : 'Agregar'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setClienteId(''); setDescripcion(''); setEstado('Pendiente'); }}>Cancelar</button>}
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: 10 }}>
        <input placeholder="Filtrar por cliente" value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} />{' '}
        <input type="date" placeholder="Filtrar por fecha" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} />{' '}
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En proceso">En proceso</option>
          <option value="Completado">Completado</option>
        </select>{' '}
        <input placeholder="Filtrar por descripción" value={filtroDescripcion} onChange={e => setFiltroDescripcion(e.target.value)} />
      </div>
      <table border={1} cellPadding={5} style={{ width: '100%', marginTop: 10 }}>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidosFiltrados.map(p => (
            <tr key={p.id}>
              <td>{p.clientes?.nombre || ''}</td>
              <td>{p.descripcion}</td>
              <td>{p.estado}</td>
              <td>{p.fecha ? new Date(p.fecha).toLocaleString() : ''}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Editar</button>{' '}
                <button onClick={() => handleDelete(p.id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Pedidos;

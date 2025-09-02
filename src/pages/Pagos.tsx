import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

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
    <div>
      <h2>Registro de Pagos</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <select value={clienteId} onChange={e => setClienteId(e.target.value)} required>
          <option value="">Seleccione cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>{' '}
        <input type="number" min={0} step={0.01} placeholder="Monto" value={monto} onChange={e => setMonto(e.target.value)} required />{' '}
        <select value={metodo} onChange={e => setMetodo(e.target.value)}>
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
          <option value="Tarjeta">Tarjeta</option>
        </select>{' '}
        <button type="submit">{editId ? 'Guardar' : 'Agregar'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setClienteId(''); setMonto(''); setMetodo('Efectivo'); }}>Cancelar</button>}
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: 10 }}>
        <input placeholder="Filtrar por cliente" value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} />{' '}
        <input type="date" placeholder="Filtrar por fecha" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} />{' '}
        <select value={filtroMetodo} onChange={e => setFiltroMetodo(e.target.value)}>
          <option value="">Todos los métodos</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Transferencia">Transferencia</option>
          <option value="Tarjeta">Tarjeta</option>
        </select>{' '}
        <input placeholder="Filtrar por monto" value={filtroMonto} onChange={e => setFiltroMonto(e.target.value)} />
      </div>
      <table border={1} cellPadding={5} style={{ width: '100%', marginTop: 10 }}>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Monto</th>
            <th>Método</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pagosFiltrados.map(p => (
            <tr key={p.id}>
              <td>{p.clientes?.nombre || ''}</td>
              <td>{p.monto}</td>
              <td>{p.metodo}</td>
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

export default Pagos;

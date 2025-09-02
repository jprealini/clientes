import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

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
    <div>
      <h2>Agenda de Llamados</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <select value={clienteId} onChange={e => setClienteId(e.target.value)} required>
          <option value="">Seleccione cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>{' '}
        <input type="datetime-local" value={fecha} onChange={e => setFecha(e.target.value)} required />{' '}
        <input placeholder="Motivo" value={motivo} onChange={e => setMotivo(e.target.value)} />{' '}
        <label>
          <input type="checkbox" checked={realizado} onChange={e => setRealizado(e.target.checked)} /> Realizado
        </label>{' '}
        <button type="submit">{editId ? 'Guardar' : 'Agregar'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setClienteId(''); setFecha(''); setMotivo(''); setRealizado(false); }}>Cancelar</button>}
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: 10 }}>
        <input placeholder="Filtrar por cliente" value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} />{' '}
        <input type="date" placeholder="Filtrar por fecha" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} />{' '}
        <input placeholder="Filtrar por motivo" value={filtroMotivo} onChange={e => setFiltroMotivo(e.target.value)} />{' '}
        <select value={filtroRealizado} onChange={e => setFiltroRealizado(e.target.value)}>
          <option value="">Todos</option>
          <option value="sí">Realizados</option>
          <option value="no">No realizados</option>
        </select>
      </div>
      <table border={1} cellPadding={5} style={{ width: '100%', marginTop: 10 }}>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Motivo</th>
            <th>Realizado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {llamadosFiltrados.map(l => (
            <tr key={l.id}>
              <td>{l.clientes?.nombre || ''}</td>
              <td>{l.fecha ? new Date(l.fecha).toLocaleString() : ''}</td>
              <td>{l.motivo}</td>
              <td>{l.realizado ? 'Sí' : 'No'}</td>
              <td>
                <button onClick={() => handleEdit(l)}>Editar</button>{' '}
                <button onClick={() => handleDelete(l.id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AgendaLlamados;

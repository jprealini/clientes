import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

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
  const [filtroFecha, setFiltroFecha] = useState('');

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
    const fechaOk = filtroFecha ? c.creado_en?.startsWith(filtroFecha) : true;
    return nombreOk && emailOk && ciudadOk && fechaOk;
  });

  return (
    <div>
      <h2>Gestión de Clientes</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />{' '}
        <input placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} />{' '}
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />{' '}
        <input placeholder="Dirección" value={direccion} onChange={e => setDireccion(e.target.value)} />{' '}
        <input placeholder="Ciudad" value={ciudad} onChange={e => setCiudad(e.target.value)} />{' '}
        <button type="submit">{editId ? 'Guardar' : 'Agregar'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setNombre(''); setTelefono(''); setEmail(''); setDireccion(''); setCiudad(''); }}>Cancelar</button>}
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ marginBottom: 10 }}>
        <input placeholder="Filtrar por nombre" value={filtroNombre} onChange={e => setFiltroNombre(e.target.value)} />{' '}
        <input placeholder="Filtrar por email" value={filtroEmail} onChange={e => setFiltroEmail(e.target.value)} />{' '}
        <input placeholder="Filtrar por ciudad" value={filtroCiudad} onChange={e => setFiltroCiudad(e.target.value)} />{' '}
        <input type="date" placeholder="Filtrar por fecha" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} />
      </div>
      <table border={1} cellPadding={5} style={{ width: '100%', marginTop: 10 }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Dirección</th>
            <th>Ciudad</th>
            <th>Creado en</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.map(c => (
            <tr key={c.id}>
              <td>{c.nombre}</td>
              <td>{c.telefono}</td>
              <td>{c.email}</td>
              <td>{c.direccion}</td>
              <td>{c.ciudad}</td>
              <td>{c.creado_en ? new Date(c.creado_en).toLocaleString() : ''}</td>
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

export default Clientes;

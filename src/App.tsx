
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Clientes from './pages/Clientes';
import AgendaLlamados from './pages/AgendaLlamados';
import Pedidos from './pages/Pedidos';
import Compras from './pages/Compras';
import Pagos from './pages/Pagos';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    else {
      setUser(data.user);
      // Verificar si el usuario existe en la tabla usuarios, si no, crearlo
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', data.user.id)
        .single();
      if (!usuario) {
        await supabase.from('usuarios').insert({
          id: data.user.id,
          email: data.user.email,
          nombre: data.user.user_metadata?.name || '',
        });
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

    return (
      <Router>
        <div style={{ maxWidth: 600, margin: '40px auto', padding: 20 }}>
          <h1>Administración de Clientes</h1>
          {!user ? (
            <form onSubmit={handleLogin}>
              <div>
                <label>Email:</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label>Contraseña:</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button type="submit">Ingresar</button>
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
          ) : (
            <div>
              <p>Bienvenido, {user.email}</p>
              <button onClick={handleLogout}>Cerrar sesión</button>
              <hr />
              <nav>
                <ul style={{ display: 'flex', gap: '1em', listStyle: 'none', padding: 0 }}>
                  <li><Link to="/clientes">Clientes</Link></li>
                  <li><Link to="/agenda">Agenda de llamados</Link></li>
                  <li><Link to="/pedidos">Pedidos</Link></li>
                  <li><Link to="/compras">Compras</Link></li>
                  <li><Link to="/pagos">Pagos</Link></li>
                </ul>
              </nav>
              <Routes>
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/agenda" element={<AgendaLlamados />} />
                <Route path="/pedidos" element={<Pedidos />} />
                <Route path="/compras" element={<Compras />} />
                <Route path="/pagos" element={<Pagos />} />
                <Route path="/" element={<p>Selecciona una sección para comenzar.</p>} />
              </Routes>
            </div>
          )}
        </div>
      </Router>
    );
}

export default App;

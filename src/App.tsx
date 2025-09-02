
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
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
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
        });
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (error) setError(error.message);
    else {
      setError('Registro exitoso. Revisa tu email para confirmar la cuenta.');
      setIsRegister(false);
      setEmail('');
      setPassword('');
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
            <div style={{
              background: '#f8f8fa',
              borderRadius: 12,
              boxShadow: '0 2px 8px #0001',
              padding: 32,
              maxWidth: 350,
              margin: '40px auto',
            }}>
              <h2 style={{ textAlign: 'center', marginBottom: 24 }}>{isRegister ? 'Registro' : 'Iniciar sesión'}</h2>
              <form onSubmit={isRegister ? handleRegister : handleLogin}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Contraseña</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: 10, borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 16 }} disabled={loading}>
                  {loading ? 'Procesando...' : isRegister ? 'Registrarse' : 'Ingresar'}
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button type="button" style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', textDecoration: 'underline', fontSize: 14 }} onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                  {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                </button>
              </div>
              {error && <p style={{ color: error.includes('exitoso') ? 'green' : 'red', marginTop: 16 }}>{error}</p>}
            </div>
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


import { useState } from 'react';
import { Container, Box, Typography, Button, TextField, Paper, Link as MuiLink } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Clientes from './pages/Clientes';
import AgendaLlamados from './pages/AgendaLlamados';
import Pedidos from './pages/Pedidos';
import Compras from './pages/Compras';
import Pagos from './pages/Pagos';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';


// ...existing code...

function MainApp({ user, setUser }: { user: User | null, setUser: (u: User | null) => void }) {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };
  return (
    <div>
      <Typography variant="body1" mb={2}>Bienvenido, {user?.email}</Typography>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3, alignItems: 'center', width: '100%' }}>
        <Button component={Link} to="/clientes" variant="contained" color="primary" sx={{ fontWeight: 700, minWidth: 120, flex: 1 }}>Clientes</Button>
        <Button component={Link} to="/agenda" variant="contained" color="primary" sx={{ fontWeight: 700, minWidth: 180, flex: 1 }}>Llamados</Button>
        <Button component={Link} to="/pedidos" variant="contained" color="primary" sx={{ fontWeight: 700, minWidth: 120, flex: 1 }}>Pedidos</Button>
        <Button component={Link} to="/compras" variant="contained" color="primary" sx={{ fontWeight: 700, minWidth: 120, flex: 1 }}>Compras</Button>
        <Button component={Link} to="/pagos" variant="contained" color="primary" sx={{ fontWeight: 700, minWidth: 120, flex: 1 }}>Pagos</Button>
        <Button onClick={handleLogout} variant="contained" color="secondary" sx={{ fontWeight: 700, minWidth: 140, flex: 1 }}>Salir</Button>
      </Box>
      <Routes>
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/agenda" element={<AgendaLlamados />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/pagos" element={<Pagos />} />
        <Route path="/" element={<p>Selecciona una sección para comenzar.</p>} />
      </Routes>
    </div>
  );
}

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

  return (
    <Router>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" align="center" fontWeight={700} mb={3}>
          Administración de Clientes
        </Typography>
        {!user ? (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" align="center" mb={2}>
              {isRegister ? 'Registro' : 'Iniciar sesión'}
            </Typography>
            <Box component="form" onSubmit={isRegister ? handleRegister : handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Contraseña"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ py: 1.2, fontWeight: 700 }}>
                {loading ? 'Procesando...' : isRegister ? 'Registrarse' : 'Ingresar'}
              </Button>
            </Box>
            <Box textAlign="center" mt={2}>
              <MuiLink component="button" type="button" underline="hover" color="primary" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </MuiLink>
            </Box>
            {error && (
              <Typography color={error.includes('exitoso') ? 'success.main' : 'error'} align="center" mt={2}>
                {error}
              </Typography>
            )}
          </Paper>
        ) : (
          <MainApp user={user} setUser={setUser} />
        )}
      </Container>
    </Router>
  );
}

export default App;

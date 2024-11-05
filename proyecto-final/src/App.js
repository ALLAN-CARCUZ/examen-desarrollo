import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Pagos from './Pagos'; // Componente para CheckoutForm
import Crud from './Crud'; // Importa el componente Crud
import ProtectedRoute from './ProtectedRoute'; // Importa la ruta protegida

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [error, setError] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const navigate = useNavigate();

  // Manejar el inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setRegisterMessage('');

    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setToken(data.token);
      localStorage.setItem('token', data.token); // Guardar token en localStorage
    } else {
      setError(data.error);
    }
  };

  // Manejar el registro de usuario
  const handleRegister = async () => {
    setError('');
    setRegisterMessage('');

    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setRegisterMessage('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
    } else {
      setError(data.error || 'Error al registrar usuario.');
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token'); // Eliminar token de localStorage
  };

  // Verificar acceso a ruta protegida y redirigir a Pagos si es válido
  const accessProtectedRoute = async () => {
    const token = localStorage.getItem('token');

    const response = await fetch('http://localhost:3000/api/protected', {
      method: 'GET',
      headers: {
        Authorization: token,
      },
    });

    const data = await response.json();

    if (response.ok) {
      navigate('/CheckoutForm'); // Redirige a la página de pagos
    } else {
      alert('Acceso denegado');
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Login con React y Node.js</h1>

      {!token ? (
        <>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Usuario</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {registerMessage && <div className="alert alert-success">{registerMessage}</div>}
            <h4>Para iniciar sesión por favor llene los campos y luego presione el botón de "Iniciar Sesión"</h4>
            <h4>Para registrar un usuario por favor llene los campos y luego presione el botón de "Registrar"</h4>
            <button type="submit" className="btn btn-primary">
              Iniciar Sesión
            </button>
            <button type="button" className="btn btn-secondary ml-2" onClick={handleRegister}>
              Registrar
            </button>
          </form>
        </>
      ) : (
        <div>
          <h2 className="text-success">Sesión iniciada</h2>
          <button className="btn btn-danger" onClick={handleLogout}>
            Cerrar sesión
          </button>
          {/* Renderizar Crud debajo de los botones de sesión si está autenticado */}
          <Crud />
        </div>
      )}
    </div>
  );
};

// Configuración de las rutas de la aplicación
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<App />} /> {/* Página de inicio */}
    <Route element={<ProtectedRoute />}> {/* Proteger la ruta de pagos */}
      <Route path="/CheckoutForm" element={<Pagos />} /> {/* Ruta protegida */}
    </Route>
  </Routes>
);

export { AppRoutes }; // Exportar AppRoutes para usarse en index.js
export default App;


// Importar dependencias
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const dotenv = require('dotenv');

// Configurar dotenv para variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Conectar a PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '1234',
    port: 5432,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Clave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura';

// Rutas de autenticación
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
            [username, hashedPassword]
        );
        res.status(201).json({ message: 'Usuario registrado exitosamente', user: newUser.rows[0] });
    } catch (error) {
        res.status(400).json({ error: 'Error al registrar usuario' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        // Generar el token JWT
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error en la autenticación' });
    }
});

// Middleware para verificar token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'Token requerido' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });
        req.userId = decoded.id;
        next();
    });
};

// Rutas protegidas de autenticación
app.get('/api/protected', verifyToken, (req, res) => {
    res.json({ message: 'Acceso a ruta protegida' });
});

// Ruta para crear un intento de pago en Stripe
app.post('/api/create-payment-intent', verifyToken, async (req, res) => {
    const { amount } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
        });
        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      // Puedes agregar más parámetros como "payment_method_types"
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


app.get('/api/items', async (req, res) => {
    const result = await pool.query('SELECT * FROM items');
    res.json(result.rows);
});

app.post('/api/items', async (req, res) => {
    const { name } = req.body;
    const result = await pool.query('INSERT INTO items (name) VALUES ($1) RETURNING *', [name]);
    res.json(result.rows[0]);
});

app.put('/api/items/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const result = await pool.query('UPDATE items SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
    res.json(result.rows[0]);
});

app.delete('/api/items/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM items WHERE id = $1', [id]);
    res.sendStatus(204);
});



// Obtener todos los proyectos
app.get('/api/proyectos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM proyectos');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener proyectos:', error);
        res.status(500).json({ error: 'Error al obtener proyectos' });
    }
});

// Crear un nuevo proyecto
app.post('/api/proyectos', async (req, res) => {
    const {
        titulo,
        descripcion,
        completada = false,
        fecha_vencimiento,
        prioridad = 'media',
        asignado_a,
        categoria,
        costo_proyecto = 0.0,
        pagado = false
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO proyectos (titulo, descripcion, completada, fecha_vencimiento, prioridad, asignado_a, categoria, costo_proyecto, pagado) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [titulo, descripcion, completada, fecha_vencimiento, prioridad, asignado_a, categoria, costo_proyecto, pagado]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear proyecto:', error);
        res.status(500).json({ error: 'Error al crear proyecto' });
    }
});

// Actualizar un proyecto
app.put('/api/proyectos/:id', async (req, res) => {
    const { id } = req.params;
    const {
        titulo,
        descripcion,
        completada,
        fecha_vencimiento,
        prioridad,
        asignado_a,
        categoria,
        costo_proyecto,
        pagado
    } = req.body;

    try {
        const result = await pool.query(
            `UPDATE proyectos SET 
                titulo = $1, 
                descripcion = $2, 
                completada = $3, 
                fecha_vencimiento = $4, 
                prioridad = $5, 
                asignado_a = $6, 
                categoria = $7, 
                costo_proyecto = $8, 
                pagado = $9
             WHERE id = $10 RETURNING *`,
            [titulo, descripcion, completada, fecha_vencimiento, prioridad, asignado_a, categoria, costo_proyecto, pagado, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar proyecto:', error);
        res.status(500).json({ error: 'Error al actualizar proyecto' });
    }
});

// Eliminar un proyecto
app.delete('/api/proyectos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM proyectos WHERE id = $1', [id]);
        res.sendStatus(204);
    } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        res.status(500).json({ error: 'Error al eliminar proyecto' });
    }
});


// Ruta para obtener los detalles de un proyecto por ID
app.get('/api/proyectos/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM proyectos WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el proyecto' });
    }
  });
  




/*CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

SELECT * FROM items;




CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/
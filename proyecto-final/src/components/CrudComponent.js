// src/components/ProyectosCrud.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProyectosCrud = () => {
    const [proyectos, setProyectos] = useState([]);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        completada: false,
        fecha_vencimiento: '',
        prioridad: 'media',
        asignado_a: '',
        categoria: '',
        costo_proyecto: '',
        pagado: false
    });
    const [editId, setEditId] = useState(null);
    const navigate = useNavigate(); // Hook para navegar a otras rutas

    // Obtener proyectos
    const fetchProyectos = async () => {
        const response = await axios.get('http://localhost:3000/api/proyectos');
        setProyectos(response.data);
    };

    useEffect(() => {
        fetchProyectos();
    }, []);

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Enviar el formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editId) {
            await axios.put(`http://localhost:3000/api/proyectos/${editId}`, formData);
            setEditId(null);
        } else {
            await axios.post('http://localhost:3000/api/proyectos', formData);
        }
        setFormData({
            titulo: '',
            descripcion: '',
            completada: false,
            fecha_vencimiento: '',
            prioridad: 'media',
            asignado_a: '',
            categoria: '',
            costo_proyecto: '',
            pagado: false
        });
        fetchProyectos();
    };

    // Editar proyecto
    const handleEdit = (proyecto) => {
        setFormData({
            titulo: proyecto.titulo,
            descripcion: proyecto.descripcion,
            completada: proyecto.completada,
            fecha_vencimiento: proyecto.fecha_vencimiento,
            prioridad: proyecto.prioridad,
            asignado_a: proyecto.asignado_a,
            categoria: proyecto.categoria,
            costo_proyecto: proyecto.costo_proyecto,
            pagado: proyecto.pagado
        });
        setEditId(proyecto.id);
    };

    // Eliminar proyecto
    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:3000/api/proyectos/${id}`);
        fetchProyectos();
    };

    // Redirigir al formulario de pago
    const goToPayment = () => {
        navigate('/CheckoutForm'); // Cambia la ruta a la página de pagos
    };

    return (
        <div className="container">
            <h2>Gestión de Proyectos</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    placeholder="Título"
                    required
                    className="form-control mb-2"
                />
                <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción"
                    className="form-control mb-2"
                ></textarea>
                <label className="mb-2">
                    Completada:
                    <input
                        type="checkbox"
                        name="completada"
                        checked={formData.completada}
                        onChange={handleChange}
                        className="ml-2"
                    />
                </label>
                <input
                    type="date"
                    name="fecha_vencimiento"
                    value={formData.fecha_vencimiento}
                    onChange={handleChange}
                    placeholder="Fecha de Vencimiento"
                    className="form-control mb-2"
                />
                <select
                    name="prioridad"
                    value={formData.prioridad}
                    onChange={handleChange}
                    className="form-control mb-2"
                >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                </select>
                <input
                    type="text"
                    name="asignado_a"
                    value={formData.asignado_a}
                    onChange={handleChange}
                    placeholder="Asignado a"
                    className="form-control mb-2"
                />
                <input
                    type="text"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    placeholder="Categoría"
                    className="form-control mb-2"
                />
                <input
                    type="number"
                    name="costo_proyecto"
                    value={formData.costo_proyecto}
                    onChange={handleChange}
                    placeholder="Costo del Proyecto"
                    className="form-control mb-2"
                />
                <label className="mb-2">
                    Pagado:
                    <input
                        type="checkbox"
                        name="pagado"
                        checked={formData.pagado}
                        onChange={handleChange}
                        className="ml-2"
                    />
                </label>
                <button type="submit" className="btn btn-primary">
                    {editId ? 'Actualizar' : 'Agregar'} Proyecto
                </button>
            </form>
            <ul className="list-group mt-3">
                {proyectos.map(proyecto => (
                    <li key={proyecto.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{proyecto.titulo}</strong> - {proyecto.descripcion}
                            <p>Prioridad: {proyecto.prioridad} | Asignado a: {proyecto.asignado_a}</p>
                            <p>Vencimiento: {proyecto.fecha_vencimiento} | Costo: ${proyecto.costo_proyecto}</p>
                            <p>Completada: {proyecto.completada ? 'Sí' : 'No'} | Pagado: {proyecto.pagado ? 'Sí' : 'No'}</p>
                        </div>
                        <div>
                            <button onClick={() => handleEdit(proyecto)} className="btn btn-warning btn-sm mr-2">Editar</button>
                            <button onClick={() => handleDelete(proyecto.id)} className="btn btn-danger btn-sm">Eliminar</button>
                            <button onClick={goToPayment} className="btn btn-info btn-sm ml-2">Pagar</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProyectosCrud;


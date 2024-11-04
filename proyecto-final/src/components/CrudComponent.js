// src/components/CrudComponent.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CrudComponent = () => {
    const [items, setItems] = useState([]);
    const [name, setName] = useState('');
    const [editId, setEditId] = useState(null);

    const fetchItems = async () => {
        const response = await axios.get('http://localhost:3000/api/items');
        setItems(response.data);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editId) {
            await axios.put(`http://localhost:3000/api/items/${editId}`, { name });
            setEditId(null);
        } else {
            await axios.post('http://localhost:3000/api/items', { name });
        }
        setName('');
        fetchItems();
    };

    const handleEdit = (item) => {
        setName(item.name);
        setEditId(item.id);
    };

    const handleDelete = async (id) => {
        await axios.delete(`http://localhost:3000/api/items/${id}`);
        fetchItems();
    };

    return (
        <div className="container">
            <h2>CRUD con React y Bootstrap</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre"
                    required
                />
                <button type="submit" className="btn btn-primary">
                    {editId ? 'Actualizar' : 'Agregar'}
                </button>
            </form>
            <ul className="list-group mt-3">
                {items.map(item => (
                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                        {item.name}
                        <div>
                            <button onClick={() => handleEdit(item)} className="btn btn-warning btn-sm">Editar</button>
                            <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm">Eliminar</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CrudComponent;
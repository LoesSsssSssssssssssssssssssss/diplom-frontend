import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [editCategory, setEditCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [message, setMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      checkUserRole();
      fetchCategories();
    }
  }, [token, checkUserRole, fetchCategories]);

  const checkUserRole = async () => {
    try {
      const response = await axios.get(
        'https://diplom-backend-mh1r.onrender.com/admin/check-role',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsAdmin(response.data.isAdmin);
    } catch (error) {
      console.error('Ошибка при проверке роли пользователя:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        'https://diplom-backend-mh1r.onrender.com/admin/categories',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCategories(response.data);
    } catch (error) {
      console.error('Ошибка при получении категорий:', error);
    }
  };

  const handleEditCategory = (category) => {
    setEditCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await axios.delete(
        `https://diplom-backend-mh1r.onrender.com/admin/categories/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('Категория успешно удалена');
      fetchCategories();
    } catch (error) {
      console.error('Ошибка при удалении категории:', error);
      setMessage('Ошибка при удалении категории');
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', categoryName);
    formData.append('description', categoryDescription);
    if (categoryImage) formData.append('image', categoryImage);

    try {
      if (editCategory) {
        await axios.put(
          `https://diplom-backend-mh1r.onrender.com/admin/categories/${editCategory._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        setMessage('Категория успешно обновлена');
      } else {
        await axios.post(
          'https://diplom-backend-mh1r.onrender.com/admin/categories',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        setMessage('Категория успешно добавлена');
      }
      setEditCategory(null);
      setCategoryName('');
      setCategoryDescription('');
      setCategoryImage(null);
      fetchCategories();
    } catch (error) {
      console.error('Ошибка при сохранении категории:', error);
      setMessage('Ошибка при сохранении категории');
    }
  };

  return (
    <div>
      {isAdmin ? (
        <>
          <h3>
            {editCategory
              ? 'Редактировать категорию'
              : 'Добавить новую категорию'}
          </h3>
          <form onSubmit={handleSubmitCategory}>
            <div>
              <label>Название:</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Изображение:</label>
              <input
                type="file"
                onChange={(e) => setCategoryImage(e.target.files[0])}
              />
            </div>
            <div>
              <label>Описание:</label>
              <textarea
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit">
              {editCategory ? 'Обновить категорию' : 'Добавить категорию'}
            </button>
          </form>
          <div className="message">{message}</div>

          <h3>Список категорий</h3>
          <ul>
            {categories.map((category) => (
              <li key={category._id}>
                <h4>{category.name}</h4>
                <p>{category.description}</p>
                <img
                  src={`https://diplom-backend-mh1r.onrender.com/${category.image}`}
                  alt={category.name}
                  width="100"
                />
                <button onClick={() => handleEditCategory(category)}>
                  Редактировать
                </button>
                <button onClick={() => handleDeleteCategory(category._id)}>
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>У вас нет доступа к этому разделу.</p>
      )}
    </div>
  );
}

export default CategoryManagement;

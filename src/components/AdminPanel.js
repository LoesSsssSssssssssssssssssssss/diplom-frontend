import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import './AdminPanel.css';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { GrEdit } from 'react-icons/gr';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [titlebook, setTitleBook] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryDescription, setCategoryDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [textbooks, setTextbooks] = useState([]);
  const [selectedTextbookId, setSelectedTextbookId] = useState(null);
  const [topicInputs, setTopicInputs] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState({});
  const [editedTopic, setEditedTopic] = useState({});

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/textbooks/categories'
      );
      setCategories(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  const checkUserRole = useCallback(async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/admin/check-role',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsAdmin(response.data.isAdmin);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      checkUserRole();
      fetchUsers();
      fetchCategories();
    }
  }, [token, checkUserRole, fetchUsers, fetchCategories]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/admin/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setMessage('Login successful');
    } catch (error) {
      console.error(error);
      setMessage('Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setIsAdmin(false);
    setMessage('Logged out');
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', categoryName);
      formData.append('description', categoryDescription);
      formData.append('image', categoryImage);

      const response = await axios.post(
        'http://localhost:5000/admin/categories',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log(response.data);
      setMessage(response.data.message);
      setCategoryName('');
      setCategoryImage(null);
      setCategoryDescription('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangeRole = async (id, newRole) => {
    try {
      await axios.put(
        `http://localhost:5000/admin/users/${id}`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitBook = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/admin/add',
        {
          title: titlebook,
          description: description,
          category: selectedCategory,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      setMessage(response.data.message);
      setTitleBook('');
      setDescription('');
      fetchTextbooks();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTextbooks();
  }, []);

  const fetchTextbooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/admin/books');
      setTextbooks(response.data);

      const newTopicInputs = {};
      response.data.forEach((textbook) => {
        newTopicInputs[textbook._id] = { title: '', content: '' };
      });
      setTopicInputs(newTopicInputs);
    } catch (error) {
      console.error(error);
      setMessage(error);
    }
  };

  const handleDeleteBook = async (id) => {
    const confirmDelete = window.confirm(
      'Вы уверены, что хотите удалить этот учебник?'
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/admin/books/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchTextbooks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddTopic = async (textbookId) => {
    const { title, content } = topicInputs[textbookId];

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/admin/${textbookId}/topics`,
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTextbooks();
      setTopicInputs({
        ...topicInputs,
        [textbookId]: { title: '', content: '' },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectTextbook = (textbookId) => {
    setSelectedTextbookId((prevId) =>
      prevId === textbookId ? null : textbookId
    );
  };

  const handleTopicInputChange = (textbookId, field, value) => {
    setTopicInputs({
      ...topicInputs,
      [textbookId]: {
        ...topicInputs[textbookId],
        [field]: value,
      },
    });
  };

  const handleFileInputChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleAvatarUpload = async (textbookId) => {
    try {
      if (!selectedFile) {
        setMessage('Выберите файл для загрузки');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/admin/books/${textbookId}/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        setMessage('Аватар успешно загружен');
        fetchTextbooks();
      }
    } catch (error) {
      console.error(error);
      setMessage('Ошибка загрузки аватара');
    }
  };

  const handleEditTopicChange = (textbookId, topicId, field, value) => {
    setEditedTopic({
      ...editedTopic,
      [textbookId]: {
        ...editedTopic[textbookId],
        [topicId]: {
          ...editedTopic[textbookId]?.[topicId],
          [field]: value,
        },
      },
    });
  };

  const handleEditButtonClick = (textbookId, topicId, topic) => {
    setIsEditing({
      ...isEditing,
      [textbookId]: {
        ...isEditing[textbookId],
        [topicId]: !isEditing[textbookId]?.[topicId],
      },
    });

    // Инициализация editedTopic, если это первый раз
    setEditedTopic((prev) => ({
      ...prev,
      [textbookId]: {
        ...prev[textbookId],
        [topicId]: prev[textbookId]?.[topicId] || {
          title: topic.title,
          content: topic.content,
        },
      },
    }));
  };

  const handleSaveEdit = async (textbookId, topicId) => {
    const { title, content } = editedTopic[textbookId][topicId];

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/admin/books/${textbookId}/topics/${topicId}`,
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTextbooks();
      setIsEditing({
        ...isEditing,
        [textbookId]: {
          ...isEditing[textbookId],
          [topicId]: false,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTopic = async (textbookId, topicId) => {
    const confirmDelete = window.confirm(
      'Вы уверены, что хотите удалить эту тему?'
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/admin/books/${textbookId}/topics/${topicId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTextbooks();
    } catch (error) {
      console.error(error);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    // Если нет места для назначения, выходим
    if (!destination) return;

    // Если место назначения тоже самое что и источник
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Создайте копию списка тем для источника
    const updatedTextbooks = textbooks.map((textbook) => {
      if (textbook._id === source.droppableId) {
        const updatedTopics = Array.from(textbook.topics);
        const [removedTopic] = updatedTopics.splice(source.index, 1);
        updatedTopics.splice(destination.index, 0, removedTopic);

        return {
          ...textbook,
          topics: updatedTopics,
        };
      }
      return textbook;
    });

    // Обновите состояние списка учебников
    setTextbooks(updatedTextbooks);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/admin/books/${source.droppableId}/topics/reorder`,
        {
          topics: updatedTextbooks.find(
            (textbook) => textbook._id === source.droppableId
          ).topics,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('Ошибка при сохранении порядка тем:', error);
    }
  };

  const handleToggleVisibility = async (textbookId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Не удалось получить токен пользователя');
      }

      const textbooksCopy = [...textbooks];
      const textbookToUpdate = textbooksCopy.find(
        ({ _id }) => _id === textbookId
      );

      if (!textbookToUpdate) {
        throw new Error('Учебник не найден');
      }

      const { isVisible } = textbookToUpdate;
      const newVisibility = !isVisible;

      const url = `http://localhost:5000/admin/books/${textbookId}/visibility`;
      await axios.patch(
        url,
        { isVisible: newVisibility },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage('Видимость успешно обновлена');
      fetchTextbooks();
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setMessage('Недопустимый доступ: пожалуйста, выполните вход заново');
      } else {
        setMessage('Не удалось обновить видимость');
        console.error('Ошибка при обновлении видимости учебника:', error);
      }
    }
  };

  return (
    <div className="book_page">
      <Header />
      {token ? (
        isAdmin ? (
          <div className="book_page_wrapper">
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h2>Панель администратора</h2>
              <button className="logout-button" onClick={handleLogout}>
                Выход
              </button>
              <Tabs>
                <TabList>
                  <Tab>Добавить учебник</Tab>
                  <Tab>Управление пользователями</Tab>
                  <Tab>Добавить категорию</Tab>
                  <Tab>Управление учебниками</Tab>
                </TabList>
                <TabPanel>
                  <div>
                    <h3>Добавить новый учебник</h3>
                    <form onSubmit={handleSubmitBook}>
                      <div>
                        <div className="message">{message}</div>
                        <label>Название:</label>
                        <input
                          type="text"
                          value={titlebook}
                          onChange={(e) => setTitleBook(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label>Описание:</label>
                        <textarea
                          className="limited-textarea"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                        ></textarea>
                      </div>
                      <div>
                        <label>Выберите категорию:</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          required
                        >
                          <option value="">Выберите категорию</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button type="submit">Добавить учебник</button>
                    </form>
                  </div>
                </TabPanel>
                <TabPanel>
                  <div>
                    <h3>Все пользователи</h3>
                    <div className="users_list">
                      <ul className="users_list_ul">
                        {users.map((user) => (
                          <li key={user._id} className="li_users">
                            <div className="user_info">
                              <strong>{user.username}</strong> - {user.role}
                            </div>
                            <div>
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                Удалить
                              </button>
                            </div>
                            <div>
                              <select
                                value={user.role}
                                onChange={(e) =>
                                  handleChangeRole(user._id, e.target.value)
                                }
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabPanel>
                <TabPanel>
                  <div>
                    <h3>Добавить новую категорию</h3>
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
                          required
                        />
                      </div>
                      <div>
                        <label>Описание:</label>
                        <textarea
                          className="limited-textarea"
                          value={categoryDescription}
                          onChange={(e) =>
                            setCategoryDescription(e.target.value)
                          }
                          required
                        ></textarea>
                      </div>
                      <button type="submit">Добавить категорию</button>
                    </form>
                    <div className="message">{message}</div>
                  </div>
                </TabPanel>
                <TabPanel>
                  <div>
                    <h3>Учебники</h3>
                    <div>{message}</div>
                    <ul className="books-list">
                      {textbooks.map((textbook) => (
                        <li key={textbook._id} className="book_li">
                          <div className="book_block">
                            <strong>{textbook.title}</strong>
                            <div>{textbook.description}</div>
                            {textbook.avatar && (
                              <img
                                src={`http://localhost:5000/${textbook.avatar}`}
                                alt={textbook.title}
                                style={{ width: '170px', height: '170px' }}
                              />
                            )}
                            {isAdmin && (
                              <div>
                                <label>Добавить аватар:</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileInputChange}
                                />
                                <button
                                  onClick={() =>
                                    handleAvatarUpload(textbook._id)
                                  }
                                >
                                  Загрузить аватар
                                </button>
                              </div>
                            )}
                            <div>
                              {isAdmin ? (
                                <div>
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      handleAddTopic(textbook._id);
                                    }}
                                  >
                                    <div>
                                      <label>Заголовок новой темы:</label>
                                      <input
                                        type="text"
                                        value={topicInputs[textbook._id].title}
                                        onChange={(e) =>
                                          handleTopicInputChange(
                                            textbook._id,
                                            'title',
                                            e.target.value
                                          )
                                        }
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label>Содержание новой темы:</label>
                                      <textarea
                                        className="limited-textarea"
                                        value={
                                          topicInputs[textbook._id].content
                                        }
                                        onChange={(e) =>
                                          handleTopicInputChange(
                                            textbook._id,
                                            'content',
                                            e.target.value
                                          )
                                        }
                                        rows="4"
                                        required
                                      />
                                    </div>
                                    <button type="submit">Добавить тему</button>
                                  </form>
                                  <div className="book-button-column">
                                    <button
                                      className="delete-button"
                                      onClick={() =>
                                        handleDeleteBook(textbook._id)
                                      }
                                    >
                                      Удалить учебник
                                    </button>
                                    <div className="visibility-container">
                                      <span>Видимость учебника:</span>
                                      <button
                                        className="visibility-button"
                                        onClick={() =>
                                          handleToggleVisibility(
                                            textbook._id,
                                            textbook.isVisible
                                          )
                                        }
                                      >
                                        {textbook.isVisible ? (
                                          <FaEye />
                                        ) : (
                                          <FaEyeSlash />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <></>
                              )}
                            </div>
                            {selectedTextbookId === textbook._id && (
                              <>
                                <p>Содержание:</p>
                                <DragDropContext onDragEnd={onDragEnd}>
                                  <Droppable
                                    droppableId={textbook._id}
                                    key={textbook._id}
                                  >
                                    {(provided) => (
                                      <ol
                                        className="topics-list"
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                      >
                                        {textbook.topics.map((topic, index) => (
                                          <Draggable
                                            key={topic._id}
                                            draggableId={topic._id}
                                            index={index}
                                          >
                                            {(provided) => (
                                              <li
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                              >
                                                {isEditing[textbook._id]?.[
                                                  topic._id
                                                ] ? (
                                                  <div className="edit-topic-section">
                                                    <input
                                                      type="text"
                                                      className="edit-topic-input"
                                                      value={
                                                        editedTopic[
                                                          textbook._id
                                                        ]?.[topic._id]?.title ||
                                                        topic.title
                                                      }
                                                      onChange={(e) =>
                                                        handleEditTopicChange(
                                                          textbook._id,
                                                          topic._id,
                                                          'title',
                                                          e.target.value
                                                        )
                                                      }
                                                    />
                                                    <textarea
                                                      className="edit-topic-textarea"
                                                      value={
                                                        editedTopic[
                                                          textbook._id
                                                        ]?.[topic._id]
                                                          ?.content ||
                                                        topic.content
                                                      }
                                                      onChange={(e) =>
                                                        handleEditTopicChange(
                                                          textbook._id,
                                                          topic._id,
                                                          'content',
                                                          e.target.value
                                                        )
                                                      }
                                                    />
                                                    <button
                                                      onClick={() =>
                                                        handleSaveEdit(
                                                          textbook._id,
                                                          topic._id
                                                        )
                                                      }
                                                    >
                                                      Сохранить
                                                    </button>
                                                  </div>
                                                ) : (
                                                  <div className="edit_row">
                                                    <Link
                                                      to={`/textbooks/books/${textbook._id}/topics/${index}`}
                                                    >
                                                      {topic.title}
                                                    </Link>
                                                    <div className="edit-button-row">
                                                      <button
                                                        className="edit-button"
                                                        onClick={() =>
                                                          handleEditButtonClick(
                                                            textbook._id,
                                                            topic._id,
                                                            topic
                                                          )
                                                        }
                                                        {...provided.dragHandleProps}
                                                      >
                                                        <GrEdit />
                                                      </button>
                                                      <button
                                                        className="delete-topic-button"
                                                        onClick={() =>
                                                          handleDeleteTopic(
                                                            textbook._id,
                                                            topic._id
                                                          )
                                                        }
                                                      >
                                                        <MdDeleteForever />
                                                      </button>
                                                    </div>
                                                  </div>
                                                )}
                                              </li>
                                            )}
                                          </Draggable>
                                        ))}
                                        {provided.placeholder}
                                      </ol>
                                    )}
                                  </Droppable>
                                </DragDropContext>
                              </>
                            )}

                            <button
                              onClick={() => handleSelectTextbook(textbook._id)}
                            >
                              {selectedTextbookId === textbook._id
                                ? 'Скрыть содержание'
                                : 'Показать содержание'}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabPanel>
              </Tabs>
            </div>

            <Footer />
          </div>
        ) : (
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
            }}
          >
            <h1
              style={{
                textAlignVertical: 'center',
                textAlign: 'center',
              }}
            >
              Недостаточно прав доступа
            </h1>
            <button className="logout-button" onClick={handleLogout}>
              Выход
            </button>
          </div>
        )
      ) : (
        <div className="login-form-wrapper">
          <div className="login-form">
            <h2>Вход в админ панель</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Почта:</label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Пароль:</label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-submit">
                Войти
              </button>
            </form>
            <div className="message">{message}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;

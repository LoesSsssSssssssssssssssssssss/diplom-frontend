import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import InputMask from 'react-input-mask';
import Header from '../components/Header';
import HeaderPhone from '../components/HeaderPhone';
import Footer from '../components/Footer';
import StarRating from '../components/StarRating';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [activeBooks, setActiveBooks] = useState([]);
  const [completedBooks, setCompletedBooks] = useState([]);
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/user/profile', {
        headers: { Authorization: token },
      });
      setUser(response.data);
    } catch (error) {
      setError('Failed to fetch user profile');
    }
  }, []);

  const fetchBooks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/user/books', {
        headers: { Authorization: token },
      });
      setActiveBooks(response.data.activeBooks);
      setCompletedBooks(response.data.completedBooks);
    } catch (error) {
      setError('Failed to fetch books');
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchBooks();
  }, [fetchUserProfile, fetchBooks]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleEdit = () => {
    setEditing(true);
    setNewUsername(user.username);
    setNewEmail(user.email);
    setNewPhone(user.phone || '');
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);
      uploadAvatar(formData);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/user/profile',
        {
          username: newUsername,
          email: newEmail,
          phone: newPhone,
        },
        {
          headers: { Authorization: token },
        }
      );
      setUser(response.data);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update user profile', error);
    }
  };

  const uploadAvatar = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token,
        },
      });
    } catch (error) {
      console.error('Failed to upload avatar', error);
    }
  };

  const resetProgress = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/user/resetProgress',
        { textbookId: bookId },
        {
          headers: { Authorization: token },
        }
      );
    } catch (error) {
      console.error('Failed to reset book progress', error);
    }
  };

  return (
    <>
      <Header />
      <div className="container">
        <div className="wrapper">
          <HeaderPhone />
          <h1 className="title">Личный кабинет</h1>
          {user ? (
            <div className="profile_up">
              {user.avatar ? (
                <img
                  src={`http://localhost:5000/${user.avatar}`}
                  alt="Avatar"
                  className="profile_circle"
                />
              ) : (
                <img alt="Avatar" className="profile_circle" />
              )}
              {!editing && (
                <div className="profile_desc">
                  <p>
                    Имя: <span>{user.username}</span>
                  </p>
                  <p>
                    Почта: <span>{user.email}</span>
                  </p>
                  <p>
                    Телефон: <span>{user.phone || 'Не указан'}</span>
                  </p>
                </div>
              )}
              <div className="profile_btn">
                {editing ? (
                  <div className="profile_editing">
                    <label>
                      Имя:
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                      />
                    </label>
                    <label>
                      Почта:
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </label>
                    <label>
                      Телефон:
                      <InputMask
                        mask="+7(999)-999-99-99"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                      >
                        {(inputProps) => <input type="tel" {...inputProps} />}
                      </InputMask>
                    </label>
                    <label>
                      Аватар:
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <button className="profile_button" onClick={handleSubmit}>
                      Сохранить
                    </button>
                  </div>
                ) : (
                  <button className="profile_button" onClick={handleEdit}>
                    Редактировать
                  </button>
                )}
                <button className="profile_button" onClick={handleLogout}>
                  Выход
                </button>
              </div>
            </div>
          ) : (
            <div>{error || 'Loading...'}</div>
          )}

          <h2 className="subtitle">Активные учебники</h2>
          <div className="profile_books_row">
            {activeBooks.map((book) => (
              <div className="books_block" key={book.id}>
                <div className="books_block_up">
                  <div className="books_block_up_left">
                    <h3 className="books_block_title">{book.title}</h3>
                    <p className="books_block_desc">{book.description}</p>
                  </div>
                  <img
                    src={`http://localhost:5000/${book.avatar}`}
                    alt={book.title}
                    className="books_block_img"
                  />
                </div>
                <div className="books_block_down">
                  <button className="profile_book_btn">
                    <a href={`/book/${book.id}`}>Продолжить</a>
                  </button>
                  <div className="books_block_item">
                    <progress
                      className="profile_progress"
                      max={book.totalTopics}
                      value={book.completedTopics}
                    ></progress>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="subtitle">Пройденные учебники</h2>
          <div className="profile_books_row">
            {completedBooks.map((book) => (
              <div className="books_block" key={book.id}>
                <div className="books_block_up">
                  <div className="books_block_up_left">
                    <h3 className="books_block_title">{book.title}</h3>
                    <p className="books_block_desc">{book.description}</p>
                    <StarRating textbookId={book.id} />
                  </div>
                  <img
                    src={`http://localhost:5000/${book.avatar}`}
                    alt={book.title}
                    className="books_block_img"
                  />
                </div>
                <div className="books_block_down">
                  <button className="profile_book_btn">
                    <a
                      href={`/book/${book.id}`}
                      onClick={() => resetProgress(book.id)}
                    >
                      Еще раз
                    </a>
                  </button>
                  <div className="books_block_item">
                    <progress
                      className="profile_progress"
                      max={book.totalTopics}
                      value={book.totalTopics}
                    ></progress>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Profile;

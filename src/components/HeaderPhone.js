import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Link } from 'react-router-dom';
import { ImExit } from 'react-icons/im';
import axios from 'axios';

const HeaderPhone = () => {
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const [checkedAuthStatus, setCheckedAuthStatus] = useState(false);
  const [avatar, setAvatar] = useState('');

  const logout = () => {
    localStorage.removeItem('token');
    setLoggedInUsername('');
    setAvatar('');
  };

  const handleLoginSuccess = (username) => {
    setLoggedInUsername(username);
  };

  const handleAvatarSet = (avatar) => {
    setAvatar(avatar);
  };

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(
        `https://diplom-backend-mh1r.onrender.com/user/${userId}`
      );
      setLoggedInUsername(response.data.username);
      setAvatar(response.data.avatar || '');
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));

          if (payload.userId) {
            await fetchUserData(payload.userId);
          }
        } catch (error) {
          console.error('Error parsing token:', error);
        }
      }
      setCheckedAuthStatus(true);
    };

    checkAuthStatus();
  }, []);
  return (
    <>
      <div className="header_phone">
        <Link to="/">
          <img src="/img/logo_min.png" alt="logo" className="logo_min" />
        </Link>
        <div className="menu">
          <input
            type="checkbox"
            id="burger-checkbox"
            className="burger-checkbox"
          />
          <label htmlFor="burger-checkbox" className="burger"></label>
          <div className="menu-list">
            <a href="/#me" className="menu-item">
              О нас
            </a>
            <a href="/#contact" className="menu-item">
              Контакты
            </a>
            <a href="/#faq" className="menu-item">
              FAQ
            </a>
            <a href="/#adv" className="menu-item">
              Преимущества
            </a>
            <Link to="/bookspage" className="menu-item">
              Учебники
            </Link>
            {checkedAuthStatus && (
              <>
                {loggedInUsername ? (
                  <div className="user-info">
                    {avatar ? (
                      <Link to="/profile">
                        <img
                          src={`https://diplom-backend-mh1r.onrender.com/${avatar}`}
                          alt="Avatar"
                          className="user_avatar"
                          key={avatar}
                        />
                      </Link>
                    ) : (
                      <div className="user_avatar_none" />
                    )}
                    <Link to="/profile" className="username">
                      {loggedInUsername}
                    </Link>
                    <Link to="/" className="logout-icon" onClick={logout}>
                      <ImExit />
                    </Link>
                  </div>
                ) : (
                  <Modal
                    onLoginSuccess={handleLoginSuccess}
                    handleAvatarSet={handleAvatarSet}
                  >
                    <button className="header_btn">Начать</button>
                  </Modal>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderPhone;

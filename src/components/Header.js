import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ImExit } from 'react-icons/im';

const Header = () => {
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const [checkedAuthStatus, setCheckedAuthStatus] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const token = localStorage.getItem('token');

  const checkUserRole = useCallback(async () => {
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
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      checkUserRole();
    }
  }, [token, checkUserRole]);

  const logout = () => {
    localStorage.removeItem('token');
    setLoggedInUsername('');
    setIsAdmin(false);
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
      <header className="header">
        <div className="header_wrapper">
          <Link to="/">
            <img src="/img/logo_min.png" alt="logo" className="logo_min" />
          </Link>
          <div className="header_a_container">
            <a href="/#me" className="header_a">
              О нас
            </a>
            <a href="/#contact" className="header_a">
              Контакты
            </a>
            <a href="/#faq" className="header_a">
              FAQ
            </a>
            <a href="/#adv" className="header_a">
              Преимущества
            </a>
            <Link to="/bookspage" className="header_a">
              Учебники
            </Link>
            {isAdmin ? (
              <Link to="/admin" className="header_a">
                Админ панель
              </Link>
            ) : (
              ''
            )}
          </div>

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
      </header>
    </>
  );
};

export default Header;

import React, { useState } from 'react';
import axios from 'axios';

const Modal = ({ children, onLoginSuccess, handleAvatarSet }) => {
  const [isRegistration, setIsRegistration] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    if (!isModalVisible) {
      setTimeout(() => {
        document
          .querySelector('.modal-overlay')
          .classList.add('modal-overlay--visible');
      }, 10);
    }
  };

  const handleSwitchMode = () => {
    setIsRegistration(!isRegistration);
    setMessage('');
  };

  const modalContentRegClass = isRegistration ? '' : 'display_none';
  const modalContentAuthClass = isRegistration ? 'display_none' : '';

  const handleOverlayClick = () => {
    setIsModalVisible(false);
    document
      .querySelector('.modal-overlay')
      .classList.remove('modal-overlay--visible');
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [message, setMessage] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const re = /^(?=.*\d).{4,}$/;
    return re.test(password);
  };

  const validateUsername = (username) => {
    const re = /^[А-Яа-яЁё\s]+$/;
    return re.test(username);
  };

  const register = async () => {
    if (!validateUsername(username)) {
      setMessage('Имя может содержать только кириллицу и пробелы');
      return;
    }

    if (!validateEmail(email)) {
      setMessage('Некорректный формат почты');
      return;
    }

    if (!validatePassword(password)) {
      setMessage(
        'Пароль должен быть минимум 4 символа и содержать хотя бы одну цифру'
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Пароли не совпадают');
      return;
    }

    if (!agreeToTerms) {
      setMessage('Вы должны согласиться на обработку персональных данных');
      return;
    }

    try {
      const response = await axios.post(
        'https://diplom-backend-mh1r.onrender.com/user/register',
        {
          username,
          password,
          email,
          role: 'user',
        }
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  const login = async () => {
    try {
      const response = await axios.post(
        'https://diplom-backend-mh1r.onrender.com/user/login',
        {
          email,
          password,
        }
      );
      setMessage(`Logged in! Token: ${response.data.token}`);
      const token = response.data.token;
      const name = response.data.username;
      const avatar = response.data.avatar;
      localStorage.setItem('token', token);
      onLoginSuccess(name);
      handleAvatarSet(avatar);
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  return (
    <>
      {children && React.cloneElement(children, { onClick: toggleModal })}

      {isModalVisible && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div
            className="modal modal--visible"
            data-target="form-popup"
            onClick={handleModalClick}
          >
            {isRegistration ? (
              <div className={`modal_content_reg ${modalContentRegClass}`}>
                <p className="modal_title">Регистрация</p>
                <div>{message}</div>
                <div className="modal_form">
                  <div className="input_wrapper">
                    <input
                      id="name"
                      type="text"
                      className="modal_input"
                      placeholder="Имя"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                      id="email"
                      type="email"
                      className="modal_input"
                      placeholder="Ваша почта"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                      id="passwordReg"
                      type="password"
                      className="modal_input"
                      placeholder="Пароль"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                      id="confirmPassword"
                      type="password"
                      className="modal_input"
                      placeholder="Повторите пароль"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="checkbox_wrapper">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      className="modal_checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                    />
                    <label
                      htmlFor="agreeToTerms"
                      className="modal_checkbox_label"
                    >
                      Даю согласие на обработку персональных данных
                    </label>
                  </div>
                  <button className="profile_book_btn" onClick={register}>
                    Продолжить
                  </button>
                  <div className="auth">
                    <p>Уже есть аккаунт?</p>
                    <button className="svap" onClick={handleSwitchMode}>
                      Войти
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`modal_content_auth ${modalContentAuthClass}`}>
                <p className="modal_title">Вход</p>
                <div>{message}</div>
                <div className="modal_form">
                  <div className="input_wrapper">
                    <input
                      id="emailAuth"
                      type="email"
                      className="modal_input"
                      placeholder="Почта"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                      id="passwordAuth"
                      type="password"
                      className="modal_input"
                      placeholder="Пароль"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button className="profile_book_btn" onClick={login}>
                    Продолжить
                  </button>
                  <div className="auth">
                    <p>Нет аккаунта?</p>
                    <button className="svap2" onClick={handleSwitchMode}>
                      Регистрация
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;

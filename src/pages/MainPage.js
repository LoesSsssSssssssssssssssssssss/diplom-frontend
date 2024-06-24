import React, { useState, useEffect, useCallback } from 'react';
import '../App.css';
import Modal from '../components/Modal';
import Footer from '../components/Footer';
import HeaderPhone from '../components/HeaderPhone';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ImExit } from 'react-icons/im';
import { IoArrowUpCircleOutline } from 'react-icons/io5';

const UserInfo = React.memo(({ loggedInUsername, avatar, logout }) => (
  <div className="user-info">
    {avatar ? (
      <Link to="/profile">
        <img
          src={`https://diplom-backend-mh1r.onrender.com/${avatar}`}
          alt="Avatar"
          className="user_avatar"
        />
      </Link>
    ) : (
      <div className="user_avatar_none" />
    )}
    <Link to="/profile" className="username">
      {loggedInUsername}
    </Link>
    <div className="logout-icon" onClick={logout}>
      <ImExit />
    </div>
  </div>
));

const AccordionItem = React.memo(
  ({ item, index, activeIndex, toggleAccordion }) => (
    <div className="accordion_question" key={index}>
      <div
        className="accord_question_header"
        onClick={() => toggleAccordion(index)}
      >
        <p>{item.question}</p>
        <div className="accordion_toggle">
          <span className="plus"></span>
          <span
            className={`plus ${activeIndex === index ? '' : 'rotate90'}`}
          ></span>
        </div>
      </div>
      <div
        className={`accordion_question_answer ${
          activeIndex === index ? 'max_height' : ''
        }`}
      >
        <p>{item.answer}</p>
      </div>
    </div>
  )
);

const Accordion = React.memo(({ data, activeIndex, toggleAccordion }) => (
  <div className="accordion">
    {data.map((item, index) => (
      <AccordionItem
        key={index}
        item={item}
        index={index}
        activeIndex={activeIndex}
        toggleAccordion={toggleAccordion}
      />
    ))}
  </div>
));

function MainPage() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [avatar, setAvatar] = useState('');
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const [message, setMessage] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);

  const handleScroll = useCallback(() => {
    if (window.scrollY > 200) {
      setShowScrollButton(true);
    } else {
      setShowScrollButton(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAccordion = useCallback((index) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  }, []);

  const handleLoginSuccess = useCallback((username) => {
    setLoggedInUsername(username);
  }, []);

  const handleAvatarSet = useCallback((avatar) => {
    setAvatar(avatar);
  }, []);

  const fetchUsername = useCallback(async (userId) => {
    try {
      const response = await axios.get(
        `https://diplom-backend-mh1r.onrender.com/user/${userId}`
      );
      setLoggedInUsername(response.data.username);
      setAvatar(response.data.avatar || '');
    } catch (error) {
      console.error('Error fetching username:', error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.userId) {
          fetchUsername(payload.userId);
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, [fetchUsername, message]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setMessage('Logged out');
    setLoggedInUsername('');
  }, []);

  const accordionData = [
    { question: 'Подойдет ли учебник, если я уже не новичок?', answer: '...' },
    { question: 'Что будет после прохождения учебника?', answer: '...' },
    { question: 'Актуальна ли информация?', answer: '...' },
    { question: 'Подойдет ли учебник новичку?', answer: '...' },
  ];

  return (
    <>
      <div className="header_visible">
        <div className="header_wrapper">
          <Link to="/">
            <img src="/img/logo.png" alt="" className="logo" />
          </Link>
          {loggedInUsername ? (
            <UserInfo
              loggedInUsername={loggedInUsername}
              avatar={avatar}
              logout={logout}
            />
          ) : (
            <Modal
              onLoginSuccess={handleLoginSuccess}
              handleAvatarSet={handleAvatarSet}
            >
              <button className="header_btn">Начать</button>
            </Modal>
          )}
        </div>
      </div>
      <header className="header header_fixed">
        <div className="header_wrapper">
          <Link to="/">
            <img src="/img/logo_min.png" alt="" className="logo_min" />
          </Link>
          <div className="header_a_container">
            <a href="#me" className="header_a">
              О нас
            </a>
            <a href="#contact" className="header_a">
              Контакты
            </a>
            <a href="#faq" className="header_a">
              FAQ
            </a>
            <a href="#adv" className="header_a">
              Преимущества
            </a>
            <Link to="/bookspage" className="header_a">
              Учебники
            </Link>
          </div>
          {loggedInUsername ? (
            <UserInfo
              loggedInUsername={loggedInUsername}
              avatar={avatar}
              logout={logout}
            />
          ) : (
            <Modal
              onLoginSuccess={handleLoginSuccess}
              handleAvatarSet={handleAvatarSet}
            >
              <button className="header_btn">Начать</button>
            </Modal>
          )}
        </div>
      </header>
      <div className="container">
        <div className="wrapper">
          <HeaderPhone />
          <div className="main_window">
            <div className="left_window">
              <div className="win_title">
                <h2 className="win_title_h1">Откройте для себя</h2>
                <h2 className="win_title_h2">новые знания</h2>
              </div>
              <div className="win_desc">
                Интерактивный, простой и созданный для вас
              </div>
              <div className="win_btn">
                <p>Учебники</p>
                <Link to="/bookspage">
                  <img src="/img/courser.png" alt="" />
                </Link>
              </div>
            </div>
            <div className="right_window">
              <img src="/img/carbon1.png" alt="" className="carbon1" />
              <img src="/img/carbon2.png" alt="" className="carbon2" />
              <img src="/img/hello.png" alt="" className="hello" />
            </div>
          </div>
          <div className="main_window_down">
            <div className="main_win_left">
              <div className="content_box">
                Этот учебник включает в себя все популярные языки
                веб-разработки: JavaScript, HTML, CSS и популярные платформы для
                работы такие как: NodeJS, React и др.
              </div>
              <button className="courser_btn">
                <span>
                  <p>
                    <Link to="/bookspage">К учебникам</Link>
                  </p>
                  <img src="/img/arrow.png" alt="" />
                </span>
              </button>
            </div>
            <img src="/img/carbondown.png" alt="" />
          </div>
        </div>
        <div className="fon" id="me">
          <div className="fon_wrapper">
            <div className="fon_title">Наши основные направления обучения!</div>
            <div className="fon_row mg-t-3">
              <div className="fon_block">Программирование</div>
              <div className="fon_block">JavaScript</div>
              <div className="fon_block">CSS</div>
            </div>
            <div className="fon_row">
              <div className="fon_block">HTML</div>
              <div className="fon_block">Figma</div>
              <div className="fon_block">React</div>
              <div className="fon_block">Верстка</div>
            </div>
            <div className="fon_row">
              <div className="fon_block">NodeJS</div>
              <div className="fon_block">UX/UI дизайн</div>
            </div>
          </div>
        </div>
        <div className="wrapper" id="adv">
          <div className="advantages_title">Наши преимущества</div>
          <p className="advantages_p mg-t-2">
            Откройте для себя программирование, начните изучать современные
            инструменты web-разработки в удаленном формате в удобное для вас
            время.
          </p>
          <div className="advantages_row mg-t-5">
            <img src="/img/image 2.png" alt="" className="advantages_img" />
            <div className="advantages_desc">
              <div className="advantages_desc_min">
                <p>Удобно</p>
                <p>Комфортно</p>
                <p>Доступно</p>
              </div>
              <div className="advantages_desc_title">Обучайтесь онлайн</div>
              <div className="advantages_desc_blur">
                Онлайн учебник позволяет обучаться из любой точки мира, вам
                нужно лишь устройство с выходом в интернет.
              </div>
            </div>
          </div>
          <div className="advantages_row mg-t-3">
            <div className="advantages_desc">
              <div className="advantages_desc_min">
                <p>Открыто</p>
                <p>Доступно</p>
                <p>Бесплатно</p>
              </div>
              <div className="advantages_desc_title">Доступно для всех</div>
              <div className="advantages_desc_blur">
                Учебник открыт и бесплатно доступен для всех желающих обучиться
                web-разработке.
              </div>
            </div>
            <img src="/img/image 3.png" alt="" className="advantages_img" />
          </div>
          <div className="advantages_row mg-t-3">
            <img src="/img/image1.png" alt="" className="advantages_img" />
            <div className="advantages_desc">
              <div className="advantages_desc_min">
                <p>Понятно</p>
                <p>Актуально</p>
                <p>Применимо</p>
              </div>
              <div className="advantages_desc_title">
                Обновления и актуальность
              </div>
              <div className="advantages_desc_blur">
                Онлайн учебник в отличии от бумажных аналогов постоянно
                дорабатывается и содержит лишь актуальную и важную информацию.
              </div>
            </div>
          </div>
        </div>
        <div className="wrapper">
          <div className="invite" id="faq">
            <p>
              Готовы начать свое обучение <br /> уже сегодня?
            </p>
            <button>
              <Link to="/bookspage">Начать сейчас</Link>
            </button>
          </div>
          <Accordion
            data={accordionData}
            activeIndex={activeIndex}
            toggleAccordion={toggleAccordion}
          />
          <div className="contact">
            <p>
              Присоединяйтесь <br />к нам
            </p>
            <button className="invite_btn">
              <span>
                <p>
                  <Link to="/bookspage">Присоединиться</Link>
                </p>
                <img src="/img/arrow.png" alt="" />
              </span>
            </button>
            <div className="contact_row" id="contact">
              <div>
                Контакты: <br />
                E-mail: contact@vksit.ru <br />
                Телефон: +7 (8172) 75-51-33 <br />
                Адрес: 160011 г.Вологда, ул.Первомайская, д. 42
              </div>
              <div>
                <a href="https://vksit.ru/#/">
                  <img
                    src="/img/logo_min_black.png"
                    alt=""
                    className="contact_img"
                  />
                </a>
                <a href="https://vk.com/vks_it">
                  <img src="/img/vk_black.png" alt="" className="contact_img" />
                </a>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
      {showScrollButton && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          <IoArrowUpCircleOutline />
        </button>
      )}
    </>
  );
}

export default MainPage;

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <>
      <footer className="footer">
        <Link to="/">
          <img
            src="/img/logo_min2.png"
            className="logo_footer"
            alt="logo_footer"
          />
        </Link>
        <div className="footer_a_wrapper">
          <a href="/#me" className="footer_a">
            О нас
          </a>
          <a href="/#contact" className="footer_a">
            Контакты
          </a>
          <a href="/#faq" className="footer_a">
            FAQ
          </a>
          <a href="/#adv" className="footer_a">
            Преимущества
          </a>
          <Link to="/bookspage" className="footer_a">
            Учебники
          </Link>
        </div>
      </footer>
      <div className="copyright">
        © АПОУ ВО ВКСиИТ, 2024. Все права защищены. Разработано с любовью и
        усердием.
      </div>
    </>
  );
};

export default Footer;

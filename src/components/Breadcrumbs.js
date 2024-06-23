import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import './Breadcrumbs.css';

const Breadcrumbs = () => {
  const location = useLocation();
  const { textbookId, topicIndex } = useParams();
  const [textbookTitle, setTextbookTitle] = useState('');
  const [topicTitle, setTopicTitle] = useState('');

  useEffect(() => {
    const fetchTextbook = async () => {
      if (textbookId) {
        try {
          const response = await axios.get(
            `http://localhost:5000/textbooks/books/${textbookId}`
          );
          setTextbookTitle(response.data.title);
        } catch (error) {
          console.error('Failed to fetch textbook title', error);
        }
      }
    };

    const fetchTopic = async () => {
      if (textbookId && topicIndex !== undefined) {
        try {
          const response = await axios.get(
            `http://localhost:5000/textbooks/books/${textbookId}/topics/${topicIndex}`
          );
          setTopicTitle(response.data.title);
        } catch (error) {
          console.error('Failed to fetch topic title', error);
        }
      }
    };

    fetchTextbook();
    fetchTopic();
  }, [textbookId, topicIndex]);

  const filteredPathnames = location.pathname.split('/').filter((item) => {
    return item !== 'textbooks' && item;
  });

  return (
    <nav className="breadcrumbs">
      <ul className="breadcrumbs-list">
        <li className="breadcrumbs-item">
          <Link to="/">Главная</Link>
        </li>
        {filteredPathnames.map((value, index) => {
          let to = `/${filteredPathnames.slice(0, index + 1).join('/')}`;
          let breadcrumbName = '';

          if (index === 0) {
            breadcrumbName = 'Учебники';
            to = '/bookspage';
          }
          if (index === 1) {
            breadcrumbName = textbookTitle;
            to = `/book/${textbookId}`;
          }
          if (index === 2) {
            breadcrumbName = 'Темы';
            to = `/book/${textbookId}`;
          }
          if (index === 3) breadcrumbName = topicTitle;

          return (
            <li key={to} className="breadcrumbs-item">
              <Link to={to}>{breadcrumbName || decodeURIComponent(value)}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;

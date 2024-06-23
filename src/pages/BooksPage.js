import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import HeaderPhone from '../components/HeaderPhone';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';

function BooksPage() {
  const [categories, setCategories] = useState([]);
  const [textbooks, setTextbooks] = useState([]);
  const [progressExists, setProgressExists] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [averageRatings, setAverageRatings] = useState({});
  const [userCounts, setUserCounts] = useState({});

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/textbooks/categories'
      );
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchTextbooks = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/textbooks/books');
      setTextbooks(response.data);
    } catch (error) {
      console.error('Error fetching textbooks:', error);
    }
  }, []);

  const checkLoginStatus = useCallback(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchTextbooks();
    checkLoginStatus();
  }, [fetchCategories, fetchTextbooks, checkLoginStatus]);

  const fetchUserId = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const response = await axios.get('http://localhost:5000/user/profile', {
        headers: { Authorization: token },
      });
      return response.data._id;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      return null;
    }
  }, []);

  const checkProgress = useCallback(async (textbookId, userId) => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const response = await axios.get(
        `http://localhost:5000/user/progress/${userId}/${textbookId}`,
        {
          headers: { Authorization: token },
        }
      );
      return response.data.exists;
    } catch (error) {
      console.error('Error checking progress:', error);
      return false;
    }
  }, []);

  const checkProgressForTextbooks = useCallback(async () => {
    const userId = await fetchUserId();
    if (!userId) return;
    const progress = {};
    const promises = textbooks.map(async (textbook) => {
      progress[textbook._id] = await checkProgress(textbook._id, userId);
    });
    await Promise.all(promises);
    setProgressExists(progress);
  }, [textbooks, fetchUserId, checkProgress]);

  useEffect(() => {
    if (textbooks.length > 0) {
      checkProgressForTextbooks();
    }
  }, [textbooks, checkProgressForTextbooks]);

  const fetchUserCounts = useCallback(async () => {
    const promises = textbooks.map(async (textbook) => {
      try {
        const response = await axios.get(
          `http://localhost:5000/user/count/${textbook._id}`
        );
        setUserCounts((prevCounts) => ({
          ...prevCounts,
          [textbook._id]: response.data.count,
        }));
      } catch (error) {
        console.error(
          `Error fetching user count for textbook ${textbook._id}:`,
          error
        );
      }
    });
    await Promise.all(promises);
  }, [textbooks]);

  useEffect(() => {
    if (textbooks.length > 0) {
      fetchUserCounts();
    }
  }, [textbooks, fetchUserCounts]);

  const getBooksByCategory = useCallback(
    (categoryId) => {
      return textbooks.filter((textbook) => textbook.category === categoryId);
    },
    [textbooks]
  );

  const handleStartClick = useCallback(
    async (textbookId) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Failed to get user token');
        const userId = await fetchUserId();
        if (!userId) throw new Error('Failed to get user ID');
        const response = await axios.post(
          'http://localhost:5000/user/progress',
          { user: userId, textbook: textbookId },
          { headers: { Authorization: token } }
        );
        if (response.status === 200 || response.status === 201) {
          setProgressExists((prevProgress) => ({
            ...prevProgress,
            [textbookId]: true,
          }));
        }
      } catch (error) {
        console.error('Error creating or updating progress:', error);
      }
    },
    [fetchUserId]
  );

  useEffect(() => {
    const fetchRating = async (textbookId) => {
      try {
        const response = await axios.get(
          `http://localhost:5000/user/rating/${textbookId}`
        );
        const averageRating = parseFloat(response.data.averageRating);
        setAverageRatings((prevRatings) => ({
          ...prevRatings,
          [textbookId]: isNaN(averageRating) ? 0 : averageRating,
        }));
      } catch (error) {
        console.error('Failed to fetch rating', error);
      }
    };

    textbooks.forEach((textbook) => {
      fetchRating(textbook._id);
    });
  }, [textbooks]);

  const renderBooks = useMemo(() => {
    return categories.map((category) => (
      <div key={category._id}>
        <div className="books_name_row">
          <img
            src={`http://localhost:5000/${category.image}`}
            alt=""
            className="books_img"
          />
          <h2>{category.name}</h2>
        </div>
        <div className="books_desc">{category.description}</div>
        <div className="books_row">
          {getBooksByCategory(category._id).map((book) => (
            <div key={book._id} className="books_block">
              <div className="books_block_up">
                <div className="books_block_up_left">
                  <h3 className="books_block_title">{book.title}</h3>
                  <p className="books_block_desc">{book.description}</p>
                </div>
                <img
                  src={`http://localhost:5000/${book.avatar}`}
                  alt=""
                  className="books_block_img"
                />
              </div>
              <div className="books_block_down">
                {isLoggedIn ? (
                  <Link
                    to={`/book/${book._id}`}
                    className="books_block_btn"
                    onClick={() => handleStartClick(book._id)}
                  >
                    {progressExists[book._id] ? 'Продолжить' : 'Начать'}
                  </Link>
                ) : (
                  <Modal>
                    <button className="books_block_btn">Начать</button>
                  </Modal>
                )}
                <div className="books_block_item">
                  <div className="item">
                    <img src="/img/star.png" alt="" className="item_img" />
                    <span className="item_desc">
                      {averageRatings[book._id]}
                    </span>
                  </div>
                  <div className="item">
                    <img src="/img/people.png" alt="" className="item_img" />
                    <span className="item_desc">{userCounts[book._id]}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  }, [
    categories,
    getBooksByCategory,
    isLoggedIn,
    progressExists,
    handleStartClick,
    averageRatings,
    userCounts,
  ]);

  return (
    <>
      <Header />
      <div className="container">
        <div className="wrapper">
          <HeaderPhone />
          <div className="title">Учебники</div>
          {renderBooks}
          <Footer />
        </div>
      </div>
    </>
  );
}

export default BooksPage;

import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import HeaderPhone from '../components/HeaderPhone';
import Footer from '../components/Footer';

const Book = () => {
  const { id } = useParams();
  const [textbooks, setTextbooks] = useState([]);
  const [progress, setProgress] = useState([]);
  const [userId, setUserId] = useState(0);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/user/profile', {
          headers: { Authorization: token },
        });
        const userId = response.data._id;
        setUserId(userId);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/textbooks/books/${id}`
        );
        setTextbooks(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTopics();
  }, [id]);

  useEffect(() => {
    if (!userId) return;
    const fetchProgress = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/user/progressbook/${userId}/${id}`
        );
        setProgress(response.data.completedTopics);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProgress();
  }, [userId, id]);

  const addToCompletedTopics = async (userId, textbookId, topicId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/user/increaseProgress/${userId}/${id}`,
        {
          userId,
          textbookId,
          topicId,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      if (response.status === 200) {
        // Обновите состояние или выполните другие действия при успешном добавлении темы в список пройденных
      }
    } catch (error) {
      console.error(error);
      // Обработка ошибки, если добавление темы в список пройденных не удалось
    }
  };

  // Обработчик события для нажатия на тему учебника
  const handleTopicClick = (userId, textbookId, topicId) => {
    addToCompletedTopics(userId, textbookId, topicId);
  };

  return (
    <>
      <Header />
      <div className="container">
        <div className="wrapper">
          <HeaderPhone />
          <div className="title">{textbooks.title}</div>
          <div className="progress_row">
            <div className="progress">
              <div className="progress_title">Прогресс</div>
              {Array.isArray(textbooks.topics) &&
                textbooks.topics.length > 0 && (
                  <progress
                    max={textbooks.topics.length}
                    value={progress.length}
                  ></progress>
                )}
              {/* Используем общее количество тем */}
              <div className="progress_span">
                <span>{progress.length}</span>
                <span>
                  {Array.isArray(textbooks.topics)
                    ? textbooks.topics.length
                    : 0}
                </span>
              </div>
            </div>
            <button className="test_btn">Пройти тест</button>
          </div>
          <div className="insert_wrapper">
            <h2>Содержание</h2>
            <div className="insert_column">
              <ol className="content_list">
                {textbooks &&
                  textbooks.topics &&
                  textbooks.topics.map((topic, index) => (
                    <li key={index} className="content_item">
                      <Link
                        to={`/textbooks/books/${textbooks._id}/topics/${index}`}
                        onClick={() =>
                          handleTopicClick(userId, textbooks._id, topic._id)
                        }
                        style={{
                          color: progress.includes(topic._id)
                            ? 'purple'
                            : 'inherit',
                        }}
                      >
                        {topic.title}
                      </Link>
                    </li>
                  ))}
              </ol>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Book;

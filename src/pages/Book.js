import React, { useState, useEffect, useMemo } from 'react';
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
        const response = await axios.get(
          'https://diplom-backend-mh1r.onrender.com/user/profile',
          {
            headers: { Authorization: token },
          }
        );
        setUserId(response.data._id);
      } catch (error) {
        console.error('Failed to fetch user ID:', error);
      }
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchTextbookAndProgress = async () => {
      try {
        const [textbookResponse, progressResponse] = await Promise.all([
          axios.get(
            `https://diplom-backend-mh1r.onrender.com/textbooks/books/${id}`
          ),
          userId
            ? axios.get(
                `https://diplom-backend-mh1r.onrender.com/user/progressbook/${userId}/${id}`
              )
            : null,
        ]);

        setTextbooks(textbookResponse.data);
        if (progressResponse) {
          setProgress(progressResponse.data.completedTopics);
        }
      } catch (error) {
        console.error('Failed to fetch textbook or progress:', error);
      }
    };

    fetchTextbookAndProgress();
  }, [id, userId]);

  const addToCompletedTopics = async (userId, textbookId, topicId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://diplom-backend-mh1r.onrender.com/user/increaseProgress/${userId}/${id}`,
        { userId, textbookId, topicId },
        { headers: { Authorization: token } }
      );
    } catch (error) {
      console.error('Failed to add topic to completed topics:', error);
    }
  };

  const handleTopicClick = (userId, textbookId, topicId) => {
    addToCompletedTopics(userId, textbookId, topicId);
  };

  const textbookTitle = useMemo(() => textbooks.title, [textbooks.title]);
  const textbookTopics = useMemo(
    () => textbooks.topics || [],
    [textbooks.topics]
  );

  return (
    <>
      <Header />
      <div className="container">
        <div className="wrapper">
          <HeaderPhone />
          <div className="title">{textbookTitle}</div>
          <div className="progress_row">
            <div className="progress">
              <div className="progress_title">Прогресс</div>
              {textbookTopics.length > 0 && (
                <progress
                  max={textbookTopics.length}
                  value={progress.length}
                ></progress>
              )}
              <div className="progress_span">
                <span>{progress.length}</span>
                <span>{textbookTopics.length}</span>
              </div>
            </div>
            {/* <button className="test_btn">Пройти тест</button> */}
          </div>
          <div className="insert_wrapper">
            <h2>Содержание</h2>
            <div className="insert_column">
              <ol className="content_list">
                {textbookTopics.map((topic, index) => (
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

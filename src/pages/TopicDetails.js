import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import HeaderPhone from '../components/HeaderPhone';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';

function TopicDetails() {
  const navigate = useNavigate();
  const { textbookId, topicIndex } = useParams();
  const [topic, setTopic] = useState(null);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(0);
  const [textbooks, setTextbooks] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const fetchUserId = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://diplom-backend-mh1r.onrender.com/user/profile',
        {
          headers: { Authorization: token },
        }
      );
      const userId = response.data._id;
      setUserId(userId);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchTextbook = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://diplom-backend-mh1r.onrender.com/textbooks/books/${textbookId}`
      );
      setTextbooks(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [textbookId]);

  const fetchTopic = useCallback(async () => {
    if (!textbookId || !topicIndex) {
      return;
    }

    try {
      const response = await axios.get(
        `https://diplom-backend-mh1r.onrender.com/textbooks/books/${textbookId}/topics/${topicIndex}`
      );
      setTopic(response.data);
    } catch (error) {
      console.error(error);
      setMessage('Failed to fetch topic details');
    }
  }, [textbookId, topicIndex]);

  const addToCompletedTopics = useCallback(async () => {
    if (userId === 0 || !topic) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const topicId = topic._id;
      await axios.post(
        `https://diplom-backend-mh1r.onrender.com/user/increaseProgress/${userId}/${textbookId}`,
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
    } catch (error) {
      console.error(error);
    }
  }, [userId, topic, textbookId]);

  useEffect(() => {
    fetchUserId();
  }, [fetchUserId]);

  useEffect(() => {
    fetchTextbook();
  }, [fetchTextbook]);

  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  useEffect(() => {
    addToCompletedTopics();
  }, [addToCompletedTopics]);

  const renderContentWithCodeHighlighting = (content) => {
    const parts = content.split(
      /(\{code\s+lang=[a-zA-Z]+\}[\s\S]*?\{\/code\}|\{info\}[\s\S]*?\{\/info\}|\{warn\}[\s\S]*?\{\/warn\}|\{subtitle\}[\s\S]*?\{\/subtitle\})/g
    );

    return parts.map((part, index) => {
      if (/^\{code\s+lang=[a-zA-Z]+\}/.test(part) && part.endsWith('{/code}')) {
        const lang = part.match(/lang=([a-zA-Z]+)/)[1];
        const codeContent = part.slice(part.indexOf('}') + 1, -7).trim();

        return (
          <div key={index} className="code-block">
            <button
              className="copy-button"
              onClick={() => handleCopyCode(codeContent, index)}
            >
              {copiedIndex === index ? 'Скопировано!' : 'Копировать код'}
            </button>
            <SyntaxHighlighter
              language={lang}
              style={materialDark}
              showLineNumbers
            >
              {codeContent}
            </SyntaxHighlighter>
          </div>
        );
      } else if (part.startsWith('{info}') && part.endsWith('{/info}')) {
        const infoContent = part.slice(6, -7).trim();
        return (
          <div key={index} className="info">
            <div className="info_up">
              <img src="/img/info.png" alt="" className="info_img" />
              <p className="info_title">На заметку</p>
            </div>
            <p className="info_text">{highlightCodeWords(infoContent)}</p>
          </div>
        );
      } else if (part.startsWith('{warn}') && part.endsWith('{/warn}')) {
        const warnContent = part.slice(6, -7).trim();
        return (
          <div key={index} className="warn">
            <div className="info_up">
              <img src="/img/warn.png" alt="" className="info_img" />
              <p className="info_title">Предупреждение</p>
            </div>
            <p className="info_text">{highlightCodeWords(warnContent)}</p>
          </div>
        );
      } else if (
        part.startsWith('{subtitle}') &&
        part.endsWith('{/subtitle}')
      ) {
        const subtitleContent = part.slice(10, -11).trim();
        return (
          <h2 key={index} className="subtitle">
            {subtitleContent}
          </h2>
        );
      } else {
        return <p key={index}>{highlightCodeWords(part)}</p>;
      }
    });
  };

  const highlightCodeWords = (text) => {
    return text.split(/(`.*?`|\n)/g).map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        const codeWord = part.slice(1, -1);
        return (
          <span key={index} className="pick">
            {codeWord}
          </span>
        );
      } else if (part === '\n') {
        return <br key={index} />;
      } else {
        return part;
      }
    });
  };

  const handleCopyCode = (codeContent, index) => {
    navigator.clipboard.writeText(codeContent);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  if (!topic) {
    return <div>{message}</div>;
  }

  const handlePrevClick = () => {
    const prevTopicIndex = parseInt(topicIndex) - 1;
    if (prevTopicIndex >= 0) {
      navigate(`/textbooks/books/${textbookId}/topics/${prevTopicIndex}`);
    } else {
      navigate(`/book/${textbookId}`);
    }
  };

  const handleNextClick = () => {
    const nextTopicIndex = parseInt(topicIndex) + 1;
    const totalTopics = textbooks.topics.length;
    if (nextTopicIndex < totalTopics) {
      navigate(`/textbooks/books/${textbookId}/topics/${nextTopicIndex}`);
    } else {
      navigate(`/book/${textbookId}`);
    }
  };

  return (
    <>
      <Header />
      <div className="container">
        <div className="wrapper">
          <HeaderPhone />
          <Breadcrumbs />
          <h1 className="title">{topic.title}</h1>
          <div className="book_text">
            {renderContentWithCodeHighlighting(topic.content)}
          </div>
          <div className="book_btn">
            <button className="prev_btn" onClick={handlePrevClick}>
              <span>
                <img src="/img/arrow_left.png" alt="" />
                <p>Назад</p>
              </span>
            </button>
            <button className="next_btn" onClick={handleNextClick}>
              <span>
                <p>Продолжить</p>
                <img src="/img/arrow.png" alt="" />
              </span>
            </button>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default TopicDetails;

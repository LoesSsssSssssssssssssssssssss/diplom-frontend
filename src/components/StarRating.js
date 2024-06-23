import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StarRating = ({ textbookId }) => {
  const [userRating, setUserRating] = useState(null);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/user/userRating/${textbookId}`,
          { headers: { Authorization: token } }
        );
        const data = response.data;

        setUserRating(data.userRating);
      } catch (error) {
        console.error('Ошибка при получении рейтинга', error);
      }
    };

    fetchRating();
  }, [textbookId]);

  const handleRating = async (newRating) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'http://localhost:5000/user/rate',
        { textbookId, rating: newRating },
        { headers: { Authorization: token } }
      );
      setUserRating(newRating);
    } catch (error) {
      console.error('Ошибка при оценке учебника', error);
    }
  };

  return (
    <div>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= userRating ? 'filled' : ''}`}
            onClick={() => handleRating(star)}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
};

export default StarRating;

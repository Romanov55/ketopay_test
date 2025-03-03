import { useEffect, useRef, useState } from "react";
import { NewsType } from "../types";

const API_KEY = "vEJwp3nmtqMIO6FDqQwyQdjbTzJcbdAh";
const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;

// формат даты
const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

export const News = () => {
  const [newsList, setNewsList] = useState<NewsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(year);
  const [currentMonth, setCurrentMonth] = useState(month);
  const [changeMonth, setChangeMonth] = useState(false);
  const newsRefs = useRef<(HTMLLIElement | null)[]>([]);

  // функция получения новостей
  const fetchNews = async (isIntervalUpdate = false, anotherMonth = false) => {
    try {
      const response = await fetch(`/api/archive/${currentYear}/${currentMonth}.json?api-key=${API_KEY}`);
      const data = await response.json();
      const newNews = data.response.docs;
      
      // подгрузка по таймеру
      if (isIntervalUpdate) {
        setNewsList((prevNews) => {
          const existingIds = new Set(prevNews.map((news) => news._id));
          const filteredNewNews = newNews.filter((news: { _id: string; }) => !existingIds.has(news._id));

          if (filteredNewNews.length > 0) {
            return [...filteredNewNews, ...prevNews];
          }
          return prevNews;
        });
      } else if (anotherMonth) {
        // подгрузка следующего месяца
        setNewsList((prev) => [...prev, ...[...newNews].reverse()]);
      } else {
        // подгрузка актуального месяца
        setNewsList(newNews.reverse());
      }
    } catch (error) {
      console.error("Ошибка при загрузке новостей:", error);
    } finally {
      // убираем анимацию
      setLoading(false);
    }
  };

  // функция изменения месяца
  const getAnotherMonth = () => {
    setLoading(true);
    
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    // добавляем флаг что месяц изменился для fetchNews
    setChangeMonth(true)
  };
  
  // подгрузка новостей
  useEffect(() => {
    // если месяц изменился, подгружаем новый
    if (changeMonth) {
      fetchNews(false, true)
      return
    } else {
      fetchNews(false, false)
    }

    const interval = setInterval(() => {
      fetchNews(true, false)
    }, 30000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  // обработчик видимости элементов
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = newsRefs.current.indexOf(entry.target as HTMLLIElement);
        if (index !== -1) {
          if (entry.isIntersecting) {
            // Элемент виден, показываем его с плавной анимацией
            entry.target.classList.add("visable");
          } else {
            // Элемент не виден, скрываем его
            entry.target.classList.remove("visable");
          }
        }
      });
    }, { threshold: 0.1 });
  
    newsRefs.current.forEach((item) => {
      if (item) {
        observer.observe(item);
      }
    });
  
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      newsRefs.current.forEach((item) => {
        if (item) {
          observer.unobserve(item);
        }
      });
    };
  }, [newsList]);
  
  return (
    <div className="container">
      {
        <ul className="news__list">
          {newsList.map((news, index) => {
            const currentDate = new Date(news.pub_date)
              .toLocaleDateString("en-GB")
              .replace(/\//g, ".");

            const prevDate =
              index > 0 && newsList[index - 1]
                ? new Date(newsList[index - 1].pub_date)
                    .toLocaleDateString("en-GB")
                    .replace(/\//g, ".")
                : null;

            const imageUrl = news.multimedia && news.multimedia[0] ? `https://www.nytimes.com/${news.multimedia[0].url}` : null;

            return (
              <li key={news._id}
                ref={(el) => { if (el) newsRefs.current[index] = el }}
                className={`news__item ${currentDate !== new Date(newsList[index + 1]?.pub_date).toLocaleDateString("en-GB").replace(/\//g, ".") ? "last" : ""}`}
                >
                {currentDate !== prevDate && <div className={`news__global__date ${index === 0 ? "first" : ""}`}>News for {currentDate}</div>}
                <a 
                  href={news.web_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news__link"
                >
                  <div className="news__image__box">
                    {imageUrl && <img className="news__image" src={imageUrl} alt={news.headline.main} />}
                  </div>
                  <div className="news__content">
                    <p className="news__source">{news.source}</p>
                    <p className="news__abstract">{news.abstract}</p>
                    <p className="news__date">{formatDate(news.pub_date)}</p>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      }
      {loading && <img className="loading" src="loading.svg" alt="Загрузка" />}
      {/* кнопка для получения новостей */}
      {!loading && <button className="news__button" onClick={() => getAnotherMonth()}>Показать ещё</button>}
    </div>
  );
};

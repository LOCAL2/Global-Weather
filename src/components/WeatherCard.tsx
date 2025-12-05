import type { WeatherData } from '../types';
import './WeatherCard.css';

interface WeatherCardProps {
  weather: WeatherData | null;
  isLoading: boolean;
  unit?: 'metric' | 'imperial';
  onToggleUnit?: () => void;
  onShare?: () => void;
  hideShareButton?: boolean;
}

export default function WeatherCard({ weather, isLoading, unit = 'metric', onToggleUnit, onShare, hideShareButton = false }: WeatherCardProps) {
  if (isLoading) {
    return (
      <div className="weather-card skeleton">
        <div className="weather-header">
          <div className="location">
            <div className="skeleton-box skeleton-title"></div>
            <div className="skeleton-box skeleton-subtitle"></div>
          </div>
          <div className="skeleton-circle"></div>
        </div>

        <div className="skeleton-box skeleton-temp"></div>
        <div className="skeleton-box skeleton-desc"></div>

        <div className="weather-details">
          <div className="detail-item">
            <div className="skeleton-circle-small"></div>
            <div style={{ flex: 1 }}>
              <div className="skeleton-box skeleton-label"></div>
              <div className="skeleton-box skeleton-value"></div>
            </div>
          </div>
          <div className="detail-item">
            <div className="skeleton-circle-small"></div>
            <div style={{ flex: 1 }}>
              <div className="skeleton-box skeleton-label"></div>
              <div className="skeleton-box skeleton-value"></div>
            </div>
          </div>
          <div className="detail-item">
            <div className="skeleton-circle-small"></div>
            <div style={{ flex: 1 }}>
              <div className="skeleton-box skeleton-label"></div>
              <div className="skeleton-box skeleton-value"></div>
            </div>
          </div>
          <div className="detail-item">
            <div className="skeleton-circle-small"></div>
            <div style={{ flex: 1 }}>
              <div className="skeleton-box skeleton-label"></div>
              <div className="skeleton-box skeleton-value"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="weather-card empty">
        <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <p>ค้นหาเมืองเพื่อดูสภาพอากาศ</p>
      </div>
    );
  }

  const iconUrl = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;
  const weatherType = weather.weather[0].main.toLowerCase();

  const convertTemp = (temp: number) => {
    return unit === 'imperial' ? Math.round((temp * 9/5) + 32) : Math.round(temp);
  };

  const convertSpeed = (speed: number) => {
    return unit === 'imperial' ? (speed * 2.237).toFixed(1) : speed.toFixed(1);
  };

  const getTemperatureTheme = () => {
    const temp = weather.main.temp;
    if (temp < 10) return 'theme-cold';
    if (temp > 25) return 'theme-hot';
    return 'theme-moderate';
  };

  return (
    <div className={`weather-card ${getTemperatureTheme()}`}>
      <div className="weather-header">
        <div className="location">
          <h2>{weather.name}</h2>
          <p>{weather.sys.country}</p>
        </div>
        <div className={`weather-icon-wrapper ${weatherType}`}>
          <img src={iconUrl} alt={weather.weather[0].description} className="weather-icon" />
        </div>
      </div>

      <div className="temperature-row">
        <div className="temperature">
          <span className="temp-value">{convertTemp(weather.main.temp)}</span>
          <span className="temp-unit">°{unit === 'metric' ? 'C' : 'F'}</span>
        </div>
        <div className="card-actions">
          {onToggleUnit && (
            <button className="unit-toggle" onClick={onToggleUnit} title="เปลี่ยนหน่วย">
              °{unit === 'metric' ? 'F' : 'C'}
            </button>
          )}
          {!hideShareButton && (
            <button 
              className="share-btn" 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                if (onShare) onShare();
              }}
              title="แชร์"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="weather-description">
        {weather.weather[0].description}
      </div>

      <div className="weather-details">
        <div className="detail-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          <div>
            <div className="detail-label">รู้สึกเหมือน</div>
            <div className="detail-value">{convertTemp(weather.main.feels_like)}°{unit === 'metric' ? 'C' : 'F'}</div>
          </div>
        </div>

        <div className="detail-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
          </svg>
          <div>
            <div className="detail-label">ความเร็วลม</div>
            <div className="detail-value">{convertSpeed(weather.wind.speed)} {unit === 'metric' ? 'm/s' : 'mph'}</div>
          </div>
        </div>

        <div className="detail-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          <div>
            <div className="detail-label">ความชื้น</div>
            <div className="detail-value">{weather.main.humidity}%</div>
          </div>
        </div>

        <div className="detail-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <div>
            <div className="detail-label">ความกดอากาศ</div>
            <div className="detail-value">{weather.main.pressure} hPa</div>
          </div>
        </div>
      </div>
    </div>
  );
}

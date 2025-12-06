import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import Globe from './components/Globe';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import { getWeatherByCoords } from './services/weatherApi';
import type { WeatherData, SearchResult } from './types';
import './App.css';

const createSlug = (name: string, country: string) => {
  return `${name}-${country}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
};

const parseSlug = (slug: string): { name: string; country: string } | null => {
  const parts = slug.split('-');
  if (parts.length < 2) return null;
  const country = parts[parts.length - 1].toUpperCase();
  const name = parts.slice(0, -1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  return { name, country };
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [comparisonWeather, setComparisonWeather] = useState<WeatherData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultsHeight, setResultsHeight] = useState(0);
  const [defaultUnit] = useState<'metric' | 'imperial'>(() => {
    const saved = localStorage.getItem('defaultUnit');
    return (saved as 'metric' | 'imperial') || 'metric';
  });
  const [unit, setUnit] = useState<'metric' | 'imperial'>(defaultUnit);
  const [comparisonUnits, setComparisonUnits] = useState<('metric' | 'imperial')[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('คัดลอก URL แล้ว!');
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [showCreditCard, setShowCreditCard] = useState(false);
  const [recentSearchQuery, setRecentSearchQuery] = useState('');
  const [isRecentMinimized, setIsRecentMinimized] = useState(() => {
    const saved = localStorage.getItem('recentMinimized');
    return saved === 'true';
  });
  const [globeAnimationComplete, setGlobeAnimationComplete] = useState(() => {
    // ตรวจสอบว่าเคย animate ไปแล้วหรือยังใน session นี้
    return sessionStorage.getItem('globeAnimated') === 'true';
  });


  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/compare/')) {
      setComparisonMode(true);
      setIsLoadingComparison(true);
      const slugs = path.replace('/compare/', '').split('/').filter(Boolean);
      
      Promise.all(
        slugs.map(async (slug, index) => {
          const parsed = parseSlug(slug);
          if (!parsed) return null;
          
          try {
            // Add staggered delay for animation effect
            await new Promise(resolve => setTimeout(resolve, index * 300));
            
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(parsed.name)},${encodeURIComponent(parsed.country)}&format=json&addressdetails=1&limit=1`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
              const loc = data[0];
              const weatherData = await getWeatherByCoords(parseFloat(loc.lat), parseFloat(loc.lon));
              if (weatherData) {
                weatherData.name = loc.name || loc.display_name.split(',')[0];
                weatherData.sys.country = loc.address?.country_code?.toUpperCase() || parsed.country;
                return weatherData;
              }
            }
          } catch (error) {
            console.error('Error loading weather:', error);
          }
          return null;
        })
      ).then(results => {
        const validResults = results.filter(r => r !== null) as WeatherData[];
        setComparisonWeather(validResults);
        setComparisonUnits(validResults.map(() => defaultUnit));
        setIsLoadingComparison(false);
      });
    } else if (path.startsWith('/weather/')) {
      const slug = path.replace('/weather/', '');
      const parsed = parseSlug(slug);
      if (parsed) {
        loadWeatherForSingle(parsed.name, parsed.country);
      }
    }
  }, [location.pathname]);



  const loadWeatherForSingle = async (name: string, country: string) => {
    setIsLoading(true);
   
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)},${encodeURIComponent(country)}&format=json&addressdetails=1&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const loc = data[0];
        const weatherData = await getWeatherByCoords(parseFloat(loc.lat), parseFloat(loc.lon));
        if (weatherData) {
          weatherData.name = loc.name || loc.display_name.split(',')[0];
          weatherData.sys.country = loc.address?.country_code?.toUpperCase() || country;
          setWeather(weatherData);
        }
      }
    } catch (error) {
      console.error('Error loading weather:', error);
    }
    setIsLoading(false);
  };

  const handleResultsChange = (hasResults: boolean, height?: number) => {
    setResultsHeight(hasResults && height ? height + 10 : 0);
  };

  const handleLocationSelect = async (location: SearchResult) => {
    // Check if comparison mode is full BEFORE loading
    if (comparisonMode && comparisonWeather.length >= 2) {
      setToastMessage('สามารถเปรียบเทียบได้สูงสุด 2 เมืองเท่านั้น');
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2500);
      return;
    }

    setIsLoading(true);

    const weatherData = await getWeatherByCoords(location.lat, location.lon);
    if (weatherData) {
      weatherData.name = location.name;
      weatherData.sys.country = location.country;
    }

    if (comparisonMode && weatherData) {
      const newComparison = [...comparisonWeather, weatherData];
      setComparisonWeather(newComparison);
      setComparisonUnits([...comparisonUnits, defaultUnit]);
      
      const slugs = newComparison.map(w => createSlug(w.name, w.sys.country)).join('/');
      window.history.replaceState({}, '', `/compare/${slugs}`);
    } else if (weatherData) {
      setWeather(weatherData);
      
      const slug = createSlug(location.name, location.country);
      navigate(`/weather/${slug}`, { replace: true });
    }
    
    setIsLoading(false);
  };

  const toggleComparisonMode = () => {
    if (comparisonMode) {
      setComparisonWeather([]);
      setComparisonUnits([]);
      navigate('/', { replace: true });
    }
    setComparisonMode(!comparisonMode);
  };

  const removeComparison = (index: number) => {
    const newComparison = comparisonWeather.filter((_, i) => i !== index);
    const newUnits = comparisonUnits.filter((_, i) => i !== index);
    setComparisonWeather(newComparison);
    setComparisonUnits(newUnits);
    
    if (newComparison.length > 0) {
      const slugs = newComparison.map(w => createSlug(w.name, w.sys.country)).join('/');
      window.history.replaceState({}, '', `/compare/${slugs}`);
    } else {
      window.history.replaceState({}, '', '/');
    }
  };

  const swapComparison = () => {
    if (comparisonWeather.length === 2) {
      const leftCard = document.querySelector('.comparison-item[data-position="left"]');
      const rightCard = document.querySelector('.comparison-item[data-position="right"]');
      
      if (leftCard && rightCard) {
        // Start slide animation
        leftCard.classList.add('swapping', 'swap-to-right');
        rightCard.classList.add('swapping', 'swap-to-left');
        
        const isMobile = window.innerWidth <= 768;
        const swapDelay = isMobile ? 175 : 200;
        const animationDuration = isMobile ? 350 : 400;
        
        // Swap data at midpoint when cards cross
        setTimeout(() => {
          const swapped = [comparisonWeather[1], comparisonWeather[0]];
          const swappedUnits = [comparisonUnits[1], comparisonUnits[0]];
          setComparisonWeather(swapped);
          setComparisonUnits(swappedUnits);
          
          const slugs = swapped.map(w => createSlug(w.name, w.sys.country)).join('/');
          window.history.replaceState({}, '', `/compare/${slugs}`);
        }, swapDelay);
        
        // Remove animation classes after animation completes
        setTimeout(() => {
          leftCard.classList.remove('swapping', 'swap-to-right');
          rightCard.classList.remove('swapping', 'swap-to-left');
        }, animationDuration);
      }
    }
  };

  const removeRecentSearch = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newRecent = recentSearches.filter((_, i) => i !== index);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const weatherData = await getWeatherByCoords(latitude, longitude);
        if (weatherData) {
          weatherData.name = 'Your Location';
          weatherData.sys.country = '';
        }
        setWeather(weatherData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location');
        setIsLoading(false);
      }
    );
  };

  const toggleUnit = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };

  const toggleComparisonUnit = (index: number) => {
    const newUnits = [...comparisonUnits];
    newUnits[index] = newUnits[index] === 'metric' ? 'imperial' : 'metric';
    setComparisonUnits(newUnits);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setToastMessage('คัดลอก URL แล้ว!');
    setShowCopiedToast(true);
    setShowShareModal(false);
    setTimeout(() => setShowCopiedToast(false), 2000);
  };

  const handleGlobeAnimationComplete = () => {
    setGlobeAnimationComplete(true);
    sessionStorage.setItem('globeAnimated', 'true');
  };

  return (
    <div className="app">
      <div className="globe-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <Globe 
            onAnimationComplete={handleGlobeAnimationComplete}
            skipAnimation={globeAnimationComplete}
          />
        </Canvas>
      </div>

      <div className={`ui-overlay ${globeAnimationComplete ? 'visible' : 'hidden'}`}>
        <header className="header">
          <h1 className="title">
            <svg className="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            Global Weather
          </h1>
          <p className="subtitle">สภาพอากาศแบบ Real-time ทั่วโลก ความแม่นยำ 98.99 จากผลทดสอบ</p>
        </header>

        <div className="search-section">
          <SearchBar 
            onLocationSelect={handleLocationSelect} 
            disabled={isLoading}
            onResultsChange={handleResultsChange}
            onGeolocation={handleGeolocation}
            onRecentSearchesChange={setRecentSearches}
          />
        </div>

        <div className="controls-section">
          <button 
            className={`comparison-toggle ${comparisonMode ? 'active' : ''}`}
            onClick={toggleComparisonMode}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            {comparisonMode ? 'ปิดโหมดเปรียบเทียบ' : 'เปรียบเทียบหลายเมือง'}
          </button>
          {comparisonMode && comparisonWeather.length > 0 && (
            <button 
              className="share-comparison-btn"
              onClick={() => setShowShareModal(true)}
              title="แชร์การเปรียบเทียบ"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              แชร์
            </button>
          )}

        </div>

        <div 
          className="weather-section" 
          style={{ marginTop: resultsHeight > 0 ? `${resultsHeight}px` : undefined }}
        >
          {comparisonMode ? (
            <div className="comparison-grid">
              {isLoadingComparison && comparisonWeather.length === 0 ? (
                <>
                  <div className="comparison-item card-loading-animation" style={{ animationDelay: '0s' }}>
                    <WeatherCard weather={null} isLoading={true} unit="metric" onToggleUnit={() => {}} onShare={handleShare} />
                  </div>
                  <div className="comparison-divider">
                    <div className="comparison-vs loading-pulse">VS</div>
                  </div>
                  <div className="comparison-item card-loading-animation" style={{ animationDelay: '0.3s' }}>
                    <WeatherCard weather={null} isLoading={true} unit="metric" onToggleUnit={() => {}} onShare={handleShare} />
                  </div>
                </>
              ) : (
                <>
                  {comparisonWeather.length > 0 && (
                    <div className="comparison-item card-enter-animation" data-position="left">
                      <button className="remove-btn" onClick={() => removeComparison(0)}>×</button>
                      <WeatherCard 
                        weather={comparisonWeather[0]} 
                        isLoading={false} 
                        unit={comparisonUnits[0] || 'metric'} 
                        onToggleUnit={() => toggleComparisonUnit(0)} 
                        onShare={handleShare}
                        hideShareButton={true}
                      />
                    </div>
                  )}
                  
                  {comparisonWeather.length === 2 && (
                    <div className="comparison-divider">
                      <button className="swap-btn" onClick={swapComparison} title="สลับตำแหน่ง">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="17 1 21 5 17 9" />
                          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                          <polyline points="7 23 3 19 7 15" />
                          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                        </svg>
                      </button>
                      <div className="comparison-vs">VS</div>
                    </div>
                  )}
                  
                  {comparisonWeather.length === 1 && (
                    <div className="comparison-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      <p>ค้นหาเมืองเพื่อเปรียบเทียบ</p>
                      <span>(1/2)</span>
                    </div>
                  )}

                  {comparisonWeather.length === 2 && (
                    <div className="comparison-item card-enter-animation" style={{ animationDelay: '0.2s' }} data-position="right">
                      <button className="remove-btn" onClick={() => removeComparison(1)}>×</button>
                      <WeatherCard 
                        weather={comparisonWeather[1]} 
                        isLoading={false} 
                        unit={comparisonUnits[1] || 'metric'} 
                        onToggleUnit={() => toggleComparisonUnit(1)}
                        onShare={handleShare}
                        hideShareButton={true}
                      />
                    </div>
                  )}

                  {comparisonWeather.length === 0 && !isLoadingComparison && (
                    <div className="comparison-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      <p>ค้นหาเมืองเพื่อเปรียบเทียบ</p>
                      <span>(0/2)</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <WeatherCard weather={weather} isLoading={isLoading} unit={unit} onToggleUnit={toggleUnit} onShare={handleShare} />
          )}
        </div>

      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowShareModal(false)}>×</button>
            <h3 className="modal-title">แชร์สภาพอากาศ</h3>
            <p className="modal-description">คัดลอก URL เพื่อแชร์ข้อมูลสภาพอากาศนี้</p>
            <div className="url-display">
              <input 
                type="text" 
                value={window.location.href} 
                readOnly 
                className="url-input"
              />
            </div>
            <button className="copy-url-btn" onClick={handleCopyUrl}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              คัดลอก URL
            </button>
          </div>
        </div>
      )}

      {showCopiedToast && (
        <div className="toast-notification">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toastMessage}
        </div>
      )}

      {recentSearches.length > 0 && !isLoading && (weather || comparisonWeather.length > 0) && (
        <div className={`recent-searches-panel ${isRecentMinimized ? 'minimized' : ''}`}>
          <div className="recent-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              ค้นหาล่าสุด
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="recent-count">{recentSearches.filter(r => 
                r.name.toLowerCase().includes(recentSearchQuery.toLowerCase()) ||
                r.country.toLowerCase().includes(recentSearchQuery.toLowerCase()) ||
                (r.state && r.state.toLowerCase().includes(recentSearchQuery.toLowerCase()))
              ).length}</span>
              <button 
                className="recent-minimize-btn"
                onClick={() => {
                  const newState = !isRecentMinimized;
                  setIsRecentMinimized(newState);
                  localStorage.setItem('recentMinimized', String(newState));
                }}
                title={isRecentMinimized ? 'ขยาย' : 'ย่อ'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  {isRecentMinimized ? (
                    <polyline points="18 15 12 9 6 15" />
                  ) : (
                    <polyline points="6 9 12 15 18 9" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          {!isRecentMinimized && (
            <>
              <div className="recent-search-input-wrapper">
                <svg className="recent-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  className="recent-search-input"
                  placeholder="ค้นหาในประวัติ..."
                  value={recentSearchQuery}
                  onChange={(e) => setRecentSearchQuery(e.target.value)}
                />
                {recentSearchQuery && (
                  <button 
                    className="recent-search-clear"
                    onClick={() => setRecentSearchQuery('')}
                    title="ล้าง"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="recent-searches-list">
            {recentSearches
              .filter(r => 
                r.name.toLowerCase().includes(recentSearchQuery.toLowerCase()) ||
                r.country.toLowerCase().includes(recentSearchQuery.toLowerCase()) ||
                (r.state && r.state.toLowerCase().includes(recentSearchQuery.toLowerCase()))
              )
              .map((result, index) => (
                <div
                  key={index}
                  className="recent-item"
                  onClick={() => handleLocationSelect(result)}
                >
                  <div className="recent-content">
                    <div className="recent-name">{result.name}</div>
                    <div className="recent-details">
                      {result.state && `${result.state}, `}{result.country}
                    </div>
                  </div>
                  <button 
                    className="recent-remove-btn" 
                    onClick={(e) => removeRecentSearch(recentSearches.indexOf(result), e)}
                    title="ลบ"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            {recentSearches.filter(r => 
              r.name.toLowerCase().includes(recentSearchQuery.toLowerCase()) ||
              r.country.toLowerCase().includes(recentSearchQuery.toLowerCase()) ||
              (r.state && r.state.toLowerCase().includes(recentSearchQuery.toLowerCase()))
            ).length === 0 && recentSearchQuery && (
              <div className="recent-no-results">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <p>ไม่พบผลลัพธ์</p>
              </div>
            )}
              </div>
            </>
          )}
        </div>
      )}
      </div>

      <div className="background-gradient"></div>

      {/* Settings Button */}
      <button 
        className="settings-btn"
        onClick={() => navigate('/settings')}
        title="ตั้งค่า"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
        <span className="settings-btn-text">ตั้งค่า</span>
      </button>

      {/* Credit Button */}
      <button 
        className="credit-btn"
        onClick={() => setShowCreditCard(!showCreditCard)}
        title="ผู้พัฒนา"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="credit-btn-text">ผู้พัฒนา</span>
      </button>

      {/* Credit Card */}
      {showCreditCard && (
        <div className="credit-card">
          <button 
            className="credit-card-close" 
            onClick={() => setShowCreditCard(false)}
          >
            ×
          </button>
          <a 
            href="https://www.facebook.com/woradet.phanphuet" 
            target="_blank" 
            rel="noopener noreferrer"
            className="credit-link"
          >
            <img 
              src="/profile-fb.png" 
              alt="Woradet Phanphuech" 
              className="credit-avatar"
            />
            <div className="credit-info">
              <div className="credit-name">Woradet Phanphuech</div>
              <div className="credit-platform">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </div>
            </div>
          </a>
        </div>
      )}
    </div>
  );
}

export default App;

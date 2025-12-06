import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import Globe from '../components/Globe';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const [defaultUnit, setDefaultUnit] = useState<'metric' | 'imperial'>(() => {
    const saved = localStorage.getItem('defaultUnit');
    return (saved as 'metric' | 'imperial') || 'metric';
  });

  const handleUnitChange = (unit: 'metric' | 'imperial') => {
    setDefaultUnit(unit);
    localStorage.setItem('defaultUnit', unit);
  };

  return (
    <div className="settings-page">
      <div className="globe-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <Globe />
        </Canvas>
      </div>

      <div className="settings-overlay">
        <div className="settings-container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>กลับ</span>
          </button>

          <div className="settings-header-page">
            <h1>ตั้งค่า</h1>
            <p>ปรับแต่งการแสดงผลตามความต้องการของคุณ</p>
          </div>

          <div className="settings-sections">
            <div className="settings-section">
              <div className="section-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
                </svg>
                <div>
                  <h2>การตั้งค่า</h2>
                  <p>ปรับแต่งการแสดงผลตามความต้องการของคุณ</p>
                </div>
              </div>
              
              <div className="setting-group">
                <div className="subsection-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                  <span>หน่วยอุณหภูมิ</span>
                </div>
                <div className="setting-options">
                  <button 
                    className={`option-card ${defaultUnit === 'metric' ? 'active' : ''}`}
                    onClick={() => handleUnitChange('metric')}
                  >
                    <div className="option-icon">°C</div>
                    <div className="option-content">
                      <div className="option-title">เซลเซียส</div>
                      <div className="option-description">หน่วยมาตรฐานสากล</div>
                    </div>
                  </button>
                  <button 
                    className={`option-card ${defaultUnit === 'imperial' ? 'active' : ''}`}
                    onClick={() => handleUnitChange('imperial')}
                  >
                    <div className="option-icon">°F</div>
                    <div className="option-content">
                      <div className="option-title">ฟาเรนไฮต์</div>
                      <div className="option-description">ใช้ในสหรัฐอเมริกา</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="settings-divider"></div>

              <div className="setting-group">
                <div className="subsection-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>ฟีเจอร์เพิ่มเติม</span>
                </div>
                <div className="coming-soon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <p>การตั้งค่าเพิ่มเติมจะมาในเวอร์ชันถัดไป</p>
                  <span>รอติดตามได้เลย!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="background-gradient"></div>
    </div>
  );
}

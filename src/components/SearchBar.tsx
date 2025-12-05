import { useState, useEffect, useRef } from 'react';
import { searchLocations } from '../services/weatherApi';
import type { SearchResult } from '../types';
import './SearchBar.css';

interface SearchBarProps {
  onLocationSelect: (location: SearchResult) => void;
  disabled?: boolean;
  onResultsChange?: (hasResults: boolean, height?: number) => void;
  onGeolocation?: () => void;
  onRecentSearchesChange?: (searches: SearchResult[]) => void;
}

export default function SearchBar({ onLocationSelect, disabled, onResultsChange, onGeolocation, onRecentSearchesChange }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const lastQueryRef = useRef('');

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        const searches = JSON.parse(saved);
        setRecentSearches(searches);
        onRecentSearchesChange?.(searches);
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }
  }, [onRecentSearchesChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onResultsChange?.(false, 0);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onResultsChange]);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (query.length > 2 && query !== lastQueryRef.current) {
        lastQueryRef.current = query;
        setIsLoading(true);
        
        // Start showing results immediately with loading state
        setIsOpen(true);
        
        const locations = await searchLocations(query);
        setResults(locations);
        setIsLoading(false);
        
        // Use requestAnimationFrame for smoother UI update
        requestAnimationFrame(() => {
          if (resultsRef.current) {
            const height = resultsRef.current.offsetHeight;
            onResultsChange?.(true, height);
          }
        });
      } else if (query.length <= 2) {
        lastQueryRef.current = '';
        setResults([]);
        setIsOpen(false);
        setIsLoading(false);
        onResultsChange?.(false, 0);
      }
    }, 200);

    return () => clearTimeout(delaySearch);
  }, [query, onResultsChange]);

  const handleSelect = (location: SearchResult) => {
    setQuery('');
    setIsOpen(false);
    setResults([]);
    lastQueryRef.current = '';
    onResultsChange?.(false, 0);
    
    // Save to recent searches
    const newRecent = [
      location,
      ...recentSearches.filter(r => !(r.lat === location.lat && r.lon === location.lon))
    ].slice(0, 20); // Keep up to 20 recent searches
    
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    onRecentSearchesChange?.(newRecent);
    
    onLocationSelect(location);
  };

  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="ค้นหาเมือง, ประเทศ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
        />
        {isLoading && <div className="search-loader"></div>}
        {!isLoading && onGeolocation && (
          <button 
            className="geolocation-btn" 
            onClick={onGeolocation}
            title="ใช้ตำแหน่งปัจจุบัน"
            disabled={disabled}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="search-results" ref={resultsRef}>
          {isLoading && results.length === 0 ? (
            <div className="search-result-item loading-item">
              <div className="skeleton-line skeleton-name"></div>
              <div className="skeleton-line skeleton-details"></div>
            </div>
          ) : results.length > 0 ? (
            results.map((result, index) => (
              <div
                key={`${result.lat}-${result.lon}`}
                className="search-result-item"
                onClick={() => handleSelect(result)}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="result-name">{result.name}</div>
                <div className="result-details">
                  {result.state && `${result.state}, `}{result.country}
                </div>
              </div>
            ))
          ) : null}
        </div>
      )}


    </div>
  );
}

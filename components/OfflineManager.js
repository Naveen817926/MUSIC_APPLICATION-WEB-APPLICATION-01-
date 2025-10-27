'use client';
import { useState, useEffect } from 'react';
import { Download, Trash2, Music, X } from 'lucide-react';

export default function OfflineManager({ onClose, onPlayOffline }) {
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = () => {
    // Load from localStorage (in real app, use IndexedDB)
    const saved = localStorage.getItem('offlineSongs');
    if (saved) {
      setDownloads(JSON.parse(saved));
    }
  };

  const deleteDownload = (id) => {
    const updated = downloads.filter(d => d.id !== id);
    setDownloads(updated);
    localStorage.setItem('offlineSongs', JSON.stringify(updated));
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10001,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%)',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ color: 'white', fontSize: '24px', margin: 0 }}>
            📥 Offline Downloads
          </h2>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: 'none',
            color: '#aaa',
            cursor: 'pointer'
          }}>
            <X size={24} />
          </button>
        </div>

        {/* Downloads List */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {downloads.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#aaa'
            }}>
              <Music size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <p>No offline downloads yet</p>
              <p style={{ fontSize: '14px' }}>
                Click download button while playing a song
              </p>
            </div>
          ) : (
            downloads.map((song) => (
              <div key={song.id} style={{
                padding: '16px',
                marginBottom: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.08)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
              onClick={() => onPlayOffline(song)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <img 
                    src={song.thumbnail} 
                    alt={song.title}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                  <div>
                    <p style={{ color: 'white', margin: 0, fontWeight: '600' }}>
                      {song.title}
                    </p>
                    <p style={{ color: '#aaa', margin: '4px 0 0', fontSize: '14px' }}>
                      {song.artist}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDownload(song.id);
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: 'pointer',
                    color: '#ef4444'
                  }}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

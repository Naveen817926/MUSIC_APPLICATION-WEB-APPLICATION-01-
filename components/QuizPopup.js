'use client';
import { X, Music } from 'lucide-react';

export default function QuizPopup({ song, onClose, onStartQuiz }) {
               return (
                              <div style={{
                                             position: 'fixed',
                                             top: 0,
                                             left: 0,
                                             right: 0,
                                             bottom: 0,
                                             background: 'rgba(0, 0, 0, 0.8)',
                                             display: 'flex',
                                             alignItems: 'center',
                                             justifyContent: 'center',
                                             zIndex: 10000,
                                             animation: 'fadeIn 0.3s ease'
                              }}>
                                             <div style={{
                                                            background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%)',
                                                            borderRadius: '20px',
                                                            padding: '32px',
                                                            maxWidth: '500px',
                                                            width: '90%',
                                                            position: 'relative',
                                                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                                                            animation: 'slideUp 0.3s ease'
                                             }}>
                                                            <button
                                                                           onClick={onClose}
                                                                           style={{
                                                                                          position: 'absolute',
                                                                                          top: '16px',
                                                                                          right: '16px',
                                                                                          background: 'transparent',
                                                                                          border: 'none',
                                                                                          color: '#aaa',
                                                                                          cursor: 'pointer',
                                                                                          fontSize: '24px',
                                                                                          transition: 'color 0.3s'
                                                                           }}
                                                                           onMouseEnter={(e) => e.target.style.color = '#fff'}
                                                                           onMouseLeave={(e) => e.target.style.color = '#aaa'}
                                                            >
                                                                           <X size={24} />
                                                            </button>

                                                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                                                           <Music size={48} style={{ color: '#667eea', marginBottom: '16px' }} />
                                                                           <h2 style={{
                                                                                          fontSize: '28px',
                                                                                          margin: 0,
                                                                                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                                          WebkitBackgroundClip: 'text',
                                                                                          WebkitTextFillColor: 'transparent',
                                                                                          backgroundClip: 'text'
                                                                           }}>
                                                                                          🎵 Song Quiz!
                                                                           </h2>
                                                            </div>

                                                            <div style={{ textAlign: 'center', margin: '24px 0' }}>
                                                                           <img
                                                                                          src={song?.thumbnail || 'https://via.placeholder.com/120'}
                                                                                          alt={song?.title || 'Song'}
                                                                                          style={{
                                                                                                         width: '120px',
                                                                                                         height: '120px',
                                                                                                         borderRadius: '12px',
                                                                                                         objectFit: 'cover',
                                                                                                         marginBottom: '16px',
                                                                                                         boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
                                                                                          }}
                                                                           />
                                                                           <h3 style={{ fontSize: '20px', margin: '8px 0', color: '#fff' }}>
                                                                                          {song?.title || 'Current Song'}
                                                                           </h3>
                                                                           <p style={{ color: '#aaa', fontSize: '14px' }}>Now Playing</p>
                                                            </div>

                                                            <p style={{ textAlign: 'center', fontSize: '18px', color: '#ddd', margin: '24px 0' }}>
                                                                           Do you want to take a quiz about this song?
                                                            </p>

                                                            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                                                                           <button
                                                                                          onClick={onClose}
                                                                                          style={{
                                                                                                         flex: 1,
                                                                                                         padding: '12px',
                                                                                                         fontSize: '16px',
                                                                                                         borderRadius: '10px',
                                                                                                         border: '1px solid rgba(255, 255, 255, 0.2)',
                                                                                                         background: 'rgba(255, 255, 255, 0.1)',
                                                                                                         color: 'white',
                                                                                                         cursor: 'pointer',
                                                                                                         transition: 'all 0.3s ease'
                                                                                          }}
                                                                                          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.15)'}
                                                                                          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                                                                           >
                                                                                          Not Now
                                                                           </button>
                                                                           <button
                                                                                          onClick={onStartQuiz}
                                                                                          style={{
                                                                                                         flex: 1,
                                                                                                         padding: '12px',
                                                                                                         fontSize: '16px',
                                                                                                         borderRadius: '10px',
                                                                                                         border: 'none',
                                                                                                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                                                         color: 'white',
                                                                                                         cursor: 'pointer',
                                                                                                         transition: 'all 0.3s ease'
                                                                                          }}
                                                                                          onMouseEnter={(e) => {
                                                                                                         e.target.style.transform = 'translateY(-2px)';
                                                                                                         e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                                                                                          }}
                                                                                          onMouseLeave={(e) => {
                                                                                                         e.target.style.transform = 'translateY(0)';
                                                                                                         e.target.style.boxShadow = 'none';
                                                                                          }}
                                                                           >
                                                                                          Let's Go! 🎯
                                                                           </button>
                                                            </div>
                                             </div>
                              </div>
               );
}

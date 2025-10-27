'use client';
import { useState, useEffect } from 'react';
import { Heart, X, Copy, Share2, Loader, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function LyricsDisplay({ song, onClose }) {
               const [highlightedLines, setHighlightedLines] = useState([]);
               const [lyrics, setLyrics] = useState([]);
               const [loading, setLoading] = useState(true);
               const [error, setError] = useState(null);

               // Fetch lyrics when component loads
               useEffect(() => {
                              fetchLyrics();
               }, [song]);
               const fetchLyrics = async () => {
                              setLoading(true);
                              setError(null);

                              try {
                                             // Clean the title - remove extra info
                                             const cleanTitle = song?.title
                                                            .replace(/(\s?[-|]\s.*)/, '')      // Removes anything after ' -' or '|'
                                                            .replace(/Lyric Video/i, '')       // Removes 'Lyric Video'
                                                            .replace(/Official/i, '')          // Removes 'Official'
                                                            .replace(/Video/i, '')             // Removes 'Video'
                                                            .trim();

                                             const artist = (song?.channelTitle && song?.channelTitle !== 'Unknown Artist')
                                                            ? song.channelTitle
                                                            : 'Various Artists';  // Default fallback

                                             // Try to fetch from Lyrics.ovh API (free, no key needed)
                                             const response = await axios.get(
                                                            `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(cleanTitle)}`
                                             );

                                             if (response.data && response.data.lyrics) {
                                                            // Split lyrics into lines
                                                            const lyricsLines = response.data.lyrics
                                                                           .split('\n')
                                                                           .filter(line => line.trim() !== '');
                                                            setLyrics(lyricsLines);
                                             } else {
                                                            setError('Lyrics not found for this song');
                                                            setLyrics(generateFallbackLyrics(song?.title));
                                             }
                              } catch (err) {
                                             console.error('Error fetching lyrics:', err);
                                             setError('Could not fetch lyrics');
                                             setLyrics(generateFallbackLyrics(song?.title));
                              } finally {
                                             setLoading(false);
                              }
               };


               const toggleHighlight = (index) => {
                              if (highlightedLines.includes(index)) {
                                             setHighlightedLines(highlightedLines.filter(i => i !== index));
                              } else {
                                             setHighlightedLines([...highlightedLines, index]);
                              }
               };

               const copyHighlighted = () => {
                              const highlighted = lyrics
                                             .filter((_, index) => highlightedLines.includes(index))
                                             .join('\n');
                              navigator.clipboard.writeText(highlighted);
                              alert('✅ Highlighted lyrics copied to clipboard!');
               };

               const shareHighlighted = () => {
                              const highlighted = lyrics
                                             .filter((_, index) => highlightedLines.includes(index))
                                             .join('\n');
                              const text = `🎵 From "${song?.title}" by ${song?.channelTitle}\n\n${highlighted}`;

                              if (navigator.share) {
                                             navigator.share({
                                                            title: `Lyrics from ${song?.title}`,
                                                            text: text
                                             });
                              } else {
                                             navigator.clipboard.writeText(text);
                                             alert('✅ Lyrics copied to clipboard!');
                              }
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
                                                            maxWidth: '700px',
                                                            width: '100%',
                                                            maxHeight: '85vh',
                                                            overflow: 'hidden',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            position: 'relative',
                                                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                                             }}>
                                                            {/* Header */}
                                                            <div style={{
                                                                           display: 'flex',
                                                                           justifyContent: 'space-between',
                                                                           alignItems: 'flex-start',
                                                                           marginBottom: '20px',
                                                                           paddingBottom: '16px',
                                                                           borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
                                                            }}>
                                                                           <div style={{ flex: 1 }}>
                                                                                          <h2 style={{
                                                                                                         color: 'white',
                                                                                                         fontSize: '24px',
                                                                                                         margin: '0 0 8px 0',
                                                                                                         fontWeight: 'bold'
                                                                                          }}>
                                                                                                         🎵 {song?.title || 'Lyrics'}
                                                                                          </h2>
                                                                                          <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>
                                                                                                         by {song?.channelTitle || 'Unknown Artist'}
                                                                                          </p>
                                                                           </div>
                                                                           <button
                                                                                          onClick={onClose}
                                                                                          style={{
                                                                                                         background: 'transparent',
                                                                                                         border: 'none',
                                                                                                         color: '#aaa',
                                                                                                         cursor: 'pointer',
                                                                                                         padding: '8px',
                                                                                                         transition: 'color 0.3s'
                                                                                          }}
                                                                                          onMouseEnter={(e) => e.target.style.color = '#fff'}
                                                                                          onMouseLeave={(e) => e.target.style.color = '#aaa'}
                                                                           >
                                                                                          <X size={24} />
                                                                           </button>
                                                            </div>

                                                            {/* Instructions */}
                                                            <div style={{
                                                                           padding: '12px 16px',
                                                                           background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                                                                           border: '1px solid rgba(102, 126, 234, 0.3)',
                                                                           borderRadius: '12px',
                                                                           marginBottom: '20px',
                                                                           fontSize: '14px',
                                                                           color: '#a0aeff',
                                                                           textAlign: 'center',
                                                                           fontWeight: '500'
                                                            }}>
                                                                           💡 Click on any line to highlight your favorite lyrics!
                                                            </div>

                                                            {/* Loading State */}
                                                            {loading && (
                                                                           <div style={{
                                                                                          display: 'flex',
                                                                                          flexDirection: 'column',
                                                                                          alignItems: 'center',
                                                                                          justifyContent: 'center',
                                                                                          padding: '60px 20px',
                                                                                          color: '#aaa'
                                                                           }}>
                                                                                          <Loader size={48} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                                                                                          <p style={{ fontSize: '16px' }}>Fetching lyrics...</p>
                                                                           </div>
                                                            )}

                                                            {/* Error State */}
                                                            {error && !loading && (
                                                                           <div style={{
                                                                                          padding: '16px',
                                                                                          background: 'rgba(239, 68, 68, 0.1)',
                                                                                          border: '1px solid rgba(239, 68, 68, 0.3)',
                                                                                          borderRadius: '8px',
                                                                                          marginBottom: '16px',
                                                                                          color: '#ff6b6b',
                                                                                          display: 'flex',
                                                                                          alignItems: 'center',
                                                                                          gap: '12px'
                                                                           }}>
                                                                                          <AlertCircle size={20} />
                                                                                          <span>{error} - Showing sample lyrics</span>
                                                                           </div>
                                                            )}

                                                            {/* Lyrics Container */}
                                                            {!loading && (
                                                                           <div style={{
                                                                                          flex: 1,
                                                                                          overflow: 'auto',
                                                                                          marginBottom: '16px',
                                                                                          padding: '8px',
                                                                                          scrollbarWidth: 'thin',
                                                                                          scrollbarColor: 'rgba(102, 126, 234, 0.5) rgba(255, 255, 255, 0.1)'
                                                                           }}>
                                                                                          {lyrics.map((line, index) => {
                                                                                                         const isHighlighted = highlightedLines.includes(index);

                                                                                                         return (
                                                                                                                        <div
                                                                                                                                       key={index}
                                                                                                                                       onClick={() => toggleHighlight(index)}
                                                                                                                                       style={{
                                                                                                                                                      padding: '14px 18px',
                                                                                                                                                      marginBottom: '10px',
                                                                                                                                                      borderRadius: '10px',
                                                                                                                                                      cursor: 'pointer',
                                                                                                                                                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                                                                                                      background: isHighlighted
                                                                                                                                                                     ? 'linear-gradient(135deg, rgba(245, 87, 108, 0.25) 0%, rgba(240, 147, 251, 0.25) 100%)'
                                                                                                                                                                     : 'rgba(255, 255, 255, 0.04)',
                                                                                                                                                      border: `2px solid ${isHighlighted
                                                                                                                                                                     ? 'rgba(245, 87, 108, 0.5)'
                                                                                                                                                                     : 'transparent'
                                                                                                                                                                     }`,
                                                                                                                                                      color: isHighlighted ? '#fff' : '#ccc',
                                                                                                                                                      fontSize: '16px',
                                                                                                                                                      lineHeight: '1.8',
                                                                                                                                                      position: 'relative',
                                                                                                                                                      transform: isHighlighted ? 'translateX(4px)' : 'translateX(0)',
                                                                                                                                                      boxShadow: isHighlighted
                                                                                                                                                                     ? '0 4px 16px rgba(245, 87, 108, 0.2)'
                                                                                                                                                                     : 'none'
                                                                                                                                       }}
                                                                                                                                       onMouseEnter={(e) => {
                                                                                                                                                      if (!isHighlighted) {
                                                                                                                                                                     e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                                                                                                                                                     e.target.style.transform = 'translateX(2px)';
                                                                                                                                                      }
                                                                                                                                       }}
                                                                                                                                       onMouseLeave={(e) => {
                                                                                                                                                      if (!isHighlighted) {
                                                                                                                                                                     e.target.style.background = 'rgba(255, 255, 255, 0.04)';
                                                                                                                                                                     e.target.style.transform = 'translateX(0)';
                                                                                                                                                      }
                                                                                                                                       }}
                                                                                                                        >
                                                                                                                                       {isHighlighted && (
                                                                                                                                                      <Heart
                                                                                                                                                                     size={18}
                                                                                                                                                                     style={{
                                                                                                                                                                                    position: 'absolute',
                                                                                                                                                                                    right: '14px',
                                                                                                                                                                                    top: '50%',
                                                                                                                                                                                    transform: 'translateY(-50%)',
                                                                                                                                                                                    fill: '#f5576c',
                                                                                                                                                                                    color: '#f5576c'
                                                                                                                                                                     }}
                                                                                                                                                      />
                                                                                                                                       )}
                                                                                                                                       {line}
                                                                                                                        </div>
                                                                                                         );
                                                                                          })}
                                                                           </div>
                                                            )}

                                                            {/* Action Buttons */}
                                                            {highlightedLines.length > 0 && !loading && (
                                                                           <div style={{
                                                                                          display: 'flex',
                                                                                          gap: '12px',
                                                                                          padding: '16px',
                                                                                          background: 'linear-gradient(135deg, rgba(245, 87, 108, 0.15) 0%, rgba(240, 147, 251, 0.15) 100%)',
                                                                                          borderRadius: '12px',
                                                                                          border: '1px solid rgba(245, 87, 108, 0.3)'
                                                                           }}>
                                                                                          <button
                                                                                                         onClick={copyHighlighted}
                                                                                                         style={{
                                                                                                                        flex: 1,
                                                                                                                        padding: '12px',
                                                                                                                        background: 'rgba(245, 87, 108, 0.2)',
                                                                                                                        border: '1px solid rgba(245, 87, 108, 0.4)',
                                                                                                                        borderRadius: '10px',
                                                                                                                        color: 'white',
                                                                                                                        cursor: 'pointer',
                                                                                                                        display: 'flex',
                                                                                                                        alignItems: 'center',
                                                                                                                        justifyContent: 'center',
                                                                                                                        gap: '8px',
                                                                                                                        fontSize: '15px',
                                                                                                                        fontWeight: '600',
                                                                                                                        transition: 'all 0.3s'
                                                                                                         }}
                                                                                                         onMouseEnter={(e) => {
                                                                                                                        e.target.style.background = 'rgba(245, 87, 108, 0.3)';
                                                                                                                        e.target.style.transform = 'translateY(-2px)';
                                                                                                         }}
                                                                                                         onMouseLeave={(e) => {
                                                                                                                        e.target.style.background = 'rgba(245, 87, 108, 0.2)';
                                                                                                                        e.target.style.transform = 'translateY(0)';
                                                                                                         }}
                                                                                          >
                                                                                                         <Copy size={18} />
                                                                                                         Copy ({highlightedLines.length})
                                                                                          </button>
                                                                                          <button
                                                                                                         onClick={shareHighlighted}
                                                                                                         style={{
                                                                                                                        flex: 1,
                                                                                                                        padding: '12px',
                                                                                                                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                                                                                        border: 'none',
                                                                                                                        borderRadius: '10px',
                                                                                                                        color: 'white',
                                                                                                                        cursor: 'pointer',
                                                                                                                        display: 'flex',
                                                                                                                        alignItems: 'center',
                                                                                                                        justifyContent: 'center',
                                                                                                                        gap: '8px',
                                                                                                                        fontSize: '15px',
                                                                                                                        fontWeight: '600',
                                                                                                                        transition: 'all 0.3s'
                                                                                                         }}
                                                                                                         onMouseEnter={(e) => {
                                                                                                                        e.target.style.transform = 'translateY(-2px)';
                                                                                                                        e.target.style.boxShadow = '0 6px 20px rgba(245, 87, 108, 0.4)';
                                                                                                         }}
                                                                                                         onMouseLeave={(e) => {
                                                                                                                        e.target.style.transform = 'translateY(0)';
                                                                                                                        e.target.style.boxShadow = 'none';
                                                                                                         }}
                                                                                          >
                                                                                                         <Share2 size={18} />
                                                                                                         Share
                                                                                          </button>
                                                                           </div>
                                                            )}
                                             </div>

                                             <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
                              </div>
               );
}

// Fallback lyrics if API fails
function generateFallbackLyrics(songTitle) {
               return [
                              `Lyrics for "${songTitle}"`,
                              "",
                              "Verse 1:",
                              "In the silence of the night",
                              "I hear your voice calling me",
                              "Through the darkness and the light",
                              "You're the melody I need",
                              "",
                              "Chorus:",
                              "Take my hand, don't let go",
                              "We'll dance until the morning glow",
                              "In this moment, we're alive",
                              "Together we will survive",
                              "",
                              "Verse 2:",
                              "Every heartbeat tells a story",
                              "Of the love we've come to know",
                              "In your eyes I see the glory",
                              "Of a future yet to show"
               ];
}

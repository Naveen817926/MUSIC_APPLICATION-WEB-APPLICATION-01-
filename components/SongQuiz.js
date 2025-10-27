'use client';
import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function SongQuiz({ song, onClose }) {
               const [currentQuestion, setCurrentQuestion] = useState(0);
               const [score, setScore] = useState(0);
               const [showResult, setShowResult] = useState(false);
               const [selectedAnswer, setSelectedAnswer] = useState(null);
               const [isCorrect, setIsCorrect] = useState(null);
               const [timeLeft, setTimeLeft] = useState(15);

               const questions = generateQuestions(song);

               // Timer Effect
               useEffect(() => {
                              if (selectedAnswer !== null) return; // Stop timer if answered

                              if (timeLeft === 0) {
                                             // Time's up - move to next question
                                             handleTimeUp();
                                             return;
                              }

                              const timer = setInterval(() => {
                                             setTimeLeft(prev => prev - 1);
                              }, 1000);

                              return () => clearInterval(timer);
               }, [timeLeft, selectedAnswer]);

               // Reset timer when question changes
               useEffect(() => {
                              setTimeLeft(15);
               }, [currentQuestion]);

               const handleTimeUp = () => {
                              setSelectedAnswer('TIME_UP');
                              setIsCorrect(false);

                              setTimeout(() => {
                                             if (currentQuestion + 1 < questions.length) {
                                                            setCurrentQuestion(currentQuestion + 1);
                                                            setSelectedAnswer(null);
                                                            setIsCorrect(null);
                                             } else {
                                                            setShowResult(true);
                                             }
                              }, 2500);
               };

               const handleAnswer = (answer) => {
                              const correct = answer === questions[currentQuestion].correct;
                              setSelectedAnswer(answer);
                              setIsCorrect(correct);
                              if (correct) setScore(score + 1);

                              setTimeout(() => {
                                             if (currentQuestion + 1 < questions.length) {
                                                            setCurrentQuestion(currentQuestion + 1);
                                                            setSelectedAnswer(null);
                                                            setIsCorrect(null);
                                             } else {
                                                            setShowResult(true);
                                             }
                              }, 2500);
               };

               if (showResult) {
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
                                                            zIndex: 10001
                                             }}>
                                                            <div style={{
                                                                           background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%)',
                                                                           borderRadius: '20px',
                                                                           padding: '48px 32px',
                                                                           maxWidth: '500px',
                                                                           width: '90%',
                                                                           textAlign: 'center',
                                                                           position: 'relative'
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
                                                                                                         cursor: 'pointer'
                                                                                          }}
                                                                           >
                                                                                          <X size={24} />
                                                                           </button>

                                                                           <h2 style={{ color: 'white', fontSize: '32px', marginBottom: '32px' }}>
                                                                                          🎉 Quiz Complete!
                                                                           </h2>

                                                                           <div style={{
                                                                                          width: '150px',
                                                                                          height: '150px',
                                                                                          borderRadius: '50%',
                                                                                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                                          display: 'flex',
                                                                                          flexDirection: 'column',
                                                                                          alignItems: 'center',
                                                                                          justifyContent: 'center',
                                                                                          margin: '0 auto 32px',
                                                                                          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
                                                                           }}>
                                                                                          <span style={{ fontSize: '48px', fontWeight: 'bold', color: 'white' }}>
                                                                                                         {score}
                                                                                          </span>
                                                                                          <span style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.8)' }}>
                                                                                                         / {questions.length}
                                                                                          </span>
                                                                           </div>

                                                                           <p style={{ fontSize: '18px', color: '#ddd', marginBottom: '32px' }}>
                                                                                          {score === questions.length ? "Perfect! You're a music expert! 🎵" :
                                                                                                         score >= questions.length * 0.7 ? "Great job! Keep listening! 🎧" :
                                                                                                                        score >= questions.length * 0.5 ? "Good effort! Practice more! 🎶" :
                                                                                                                                       "Keep exploring music! 🎵"}
                                                                           </p>

                                                                           <button
                                                                                          onClick={onClose}
                                                                                          style={{
                                                                                                         padding: '12px 32px',
                                                                                                         fontSize: '16px',
                                                                                                         borderRadius: '10px',
                                                                                                         border: 'none',
                                                                                                         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                                                         color: 'white',
                                                                                                         cursor: 'pointer',
                                                                                                         fontWeight: '600',
                                                                                                         transition: 'all 0.3s'
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
                                                                                          Done
                                                                           </button>
                                                            </div>
                                             </div>
                              );
               }

               const question = questions[currentQuestion];

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
                                             zIndex: 10001
                              }}>
                                             <div style={{
                                                            background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%)',
                                                            borderRadius: '20px',
                                                            padding: '32px',
                                                            maxWidth: '600px',
                                                            width: '90%',
                                                            position: 'relative'
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
                                                                                          cursor: 'pointer'
                                                                           }}
                                                            >
                                                                           <X size={24} />
                                                            </button>

                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                                                           <div style={{ color: '#aaa', fontSize: '14px' }}>
                                                                                          Question {currentQuestion + 1} of {questions.length}
                                                                           </div>

                                                                           {/* Timer */}
                                                                           <div style={{
                                                                                          display: 'flex',
                                                                                          alignItems: 'center',
                                                                                          gap: '8px',
                                                                                          padding: '6px 12px',
                                                                                          background: timeLeft <= 5 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(102, 126, 234, 0.2)',
                                                                                          border: `2px solid ${timeLeft <= 5 ? '#ef4444' : '#667eea'}`,
                                                                                          borderRadius: '20px',
                                                                                          color: timeLeft <= 5 ? '#ef4444' : '#667eea',
                                                                                          fontWeight: 'bold',
                                                                                          fontSize: '14px'
                                                                           }}>
                                                                                          <Clock size={16} />
                                                                                          <span>{timeLeft}s</span>
                                                                           </div>

                                                                           <div style={{ color: '#aaa', fontSize: '14px' }}>
                                                                                          Score: {score}
                                                                           </div>
                                                            </div>

                                                            <h3 style={{ fontSize: '22px', marginBottom: '32px', color: '#fff' }}>
                                                                           {question.question}
                                                            </h3>

                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                           {question.options.map((option, index) => {
                                                                                          const isThisCorrect = option === question.correct;
                                                                                          const showAsCorrect = selectedAnswer && isThisCorrect;
                                                                                          const showAsWrong = selectedAnswer === option && !isCorrect;

                                                                                          return (
                                                                                                         <button
                                                                                                                        key={index}
                                                                                                                        onClick={() => handleAnswer(option)}
                                                                                                                        disabled={selectedAnswer !== null}
                                                                                                                        style={{
                                                                                                                                       padding: '16px',
                                                                                                                                       background: showAsCorrect
                                                                                                                                                      ? 'rgba(34, 197, 94, 0.2)'
                                                                                                                                                      : showAsWrong
                                                                                                                                                                     ? 'rgba(239, 68, 68, 0.2)'
                                                                                                                                                                     : 'rgba(255, 255, 255, 0.05)',
                                                                                                                                       border: `2px solid ${showAsCorrect
                                                                                                                                                                     ? '#22c55e'
                                                                                                                                                                     : showAsWrong
                                                                                                                                                                                    ? '#ef4444'
                                                                                                                                                                                    : 'rgba(255, 255, 255, 0.1)'
                                                                                                                                                      }`,
                                                                                                                                       borderRadius: '12px',
                                                                                                                                       color: 'white',
                                                                                                                                       fontSize: '16px',
                                                                                                                                       cursor: selectedAnswer ? 'not-allowed' : 'pointer',
                                                                                                                                       display: 'flex',
                                                                                                                                       justifyContent: 'space-between',
                                                                                                                                       alignItems: 'center',
                                                                                                                                       transition: 'all 0.3s ease'
                                                                                                                        }}
                                                                                                                        onMouseEnter={(e) => {
                                                                                                                                       if (!selectedAnswer) {
                                                                                                                                                      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                                                                                                                                      e.target.style.transform = 'translateX(4px)';
                                                                                                                                       }
                                                                                                                        }}
                                                                                                                        onMouseLeave={(e) => {
                                                                                                                                       if (!selectedAnswer) {
                                                                                                                                                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                                                                                                                                      e.target.style.transform = 'translateX(0)';
                                                                                                                                       }
                                                                                                                        }}
                                                                                                         >
                                                                                                                        <span>{option}</span>
                                                                                                                        {showAsCorrect && (
                                                                                                                                       <CheckCircle size={24} color="#22c55e" />
                                                                                                                        )}
                                                                                                                        {showAsWrong && (
                                                                                                                                       <XCircle size={24} color="#ef4444" />
                                                                                                                        )}
                                                                                                         </button>
                                                                                          );
                                                                           })}
                                                            </div>

                                                            {/* Show correct answer if wrong or time up */}
                                                            {selectedAnswer && !isCorrect && (
                                                                           <div style={{
                                                                                          marginTop: '20px',
                                                                                          padding: '12px',
                                                                                          background: 'rgba(34, 197, 94, 0.1)',
                                                                                          border: '1px solid rgba(34, 197, 94, 0.3)',
                                                                                          borderRadius: '8px',
                                                                                          color: '#22c55e',
                                                                                          textAlign: 'center',
                                                                                          fontSize: '14px'
                                                                           }}>
                                                                                          {selectedAnswer === 'TIME_UP' ? '⏰ Time\'s Up! ' : ''}
                                                                                          ✓ Correct Answer: <strong>{question.correct}</strong>
                                                                           </div>
                                                            )}
                                             </div>
                              </div>
               );
}

// Generate 6 questions - NO SHUFFLING
function generateQuestions(song) {
               const questions = [];
               const songTitle = song?.title || "Unknown Song";
               const artist = song?.artist || song?.channelTitle || "Unknown Artist";

               questions.push({
                              question: `What is the title of this song?`,
                              options: [songTitle, "Different Song", "Another Track", "Random Title"],
                              correct: songTitle
               });

               questions.push({
                              question: `Who is the artist/channel of this song?`,
                              options: [artist, "Different Artist", "Another Singer", "Random Channel"],
                              correct: artist
               });

               questions.push({
                              question: `What type of content is this?`,
                              options: ["Music Video", "Audio Only", "Live Performance", "Cover Song"],
                              correct: "Music Video"
               });

               questions.push({
                              question: `Which genre does this song likely belong to?`,
                              options: ["Pop", "Rock", "Classical", "Electronic"],
                              correct: "Pop"
               });

               questions.push({
                              question: `Where is this song from?`,
                              options: ["YouTube", "Spotify", "SoundCloud", "Apple Music"],
                              correct: "YouTube"
               });

               questions.push({
                              question: `Is this song currently playing?`,
                              options: ["Yes", "No", "Maybe", "I don't know"],
                              correct: "Yes"
               });

               return questions;
}

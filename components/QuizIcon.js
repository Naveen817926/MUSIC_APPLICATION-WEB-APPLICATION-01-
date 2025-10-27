'use client';
import { Brain } from 'lucide-react';

export default function QuizIcon({ onClick }) {
               return (
                              <button
                                             onClick={onClick}
                                             style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            padding: '8px 16px',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            border: 'none',
                                                            borderRadius: '20px',
                                                            color: 'white',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease',
                                                            marginLeft: '16px',
                                                            fontSize: '14px'
                                             }}
                                             onMouseEnter={(e) => {
                                                            e.target.style.transform = 'translateY(-2px)';
                                                            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                                             }}
                                             onMouseLeave={(e) => {
                                                            e.target.style.transform = 'translateY(0)';
                                                            e.target.style.boxShadow = 'none';
                                             }}
                                             title="Take Quiz"
                              >
                                             <Brain size={24} />
                                             <span>Quiz</span>
                              </button>
               );
}

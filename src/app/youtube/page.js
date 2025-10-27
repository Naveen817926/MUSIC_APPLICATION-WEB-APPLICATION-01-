'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import Image from 'next/image';
import './page.css';
import {
    Play, Pause, SkipBack, SkipForward, Volume2, Heart, Search, Home, Music, User,
    Plus, Shuffle, Repeat, MoreVertical, TrendingUp, Users, BarChart3, Shield, Mic, Share2, Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import QuizIcon from '../../../components/QuizIcon';
import QuizPopup from '../../../components/QuizPopup';
import SongQuiz from '../../../components/SongQuiz';
import LyricsDisplay from '../../../components/LyricsDisplay';
import OfflineManager from '../../../components/OfflineManager';



export default function Page() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSong, setCurrentSong] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(70);
    const [activeTab, setActiveTab] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [playlists, setPlaylists] = useState([]);
    const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [songs, setSongs] = useState([]);
    const [filteredSongs, setFilteredSongs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [filterGenres, setFilterGenres] = useState([]);
    const [filterArtists, setFilterArtists] = useState([]);
    const [filterPopularity, setFilterPopularity] = useState([0, 10000000]);
    const [allArtists, setAllArtists] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
    const [selectedSongForPlaylist, setSelectedSongForPlaylist] = useState(null);
    const [editingSong, setEditingSong] = useState(null);
    const [editingPlaylist, setEditingPlaylist] = useState(null); // New state for editing playlists
    const [artists, setArtists] = useState([]);
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState(null);
    const [youtubeQuotaExceeded, setYoutubeQuotaExceeded] = useState(false);
    const [queue, setQueue] = useState([]);
    const [showQuizPopup, setShowQuizPopup] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizSong, setQuizSong] = useState(null);
    //lyrics
    const [showLyrics, setShowLyrics] = useState(false);
    const [showOfflineManager, setShowOfflineManager] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffle, setShuffle] = useState(false);
    const [repeat, setRepeat] = useState('off');
    const [isLoadingSong, setIsLoadingSong] = useState(false);
    const [likedSongs, setLikedSongs] = useState(new Set());
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);
    const recentlyPlayedRef = useRef(recentlyPlayed);
    const [youtubePlayer, setYoutubePlayer] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const playerRef = useRef(null);
    const searchTimerRef = useRef(null);
    const recognitionRef = useRef(null);
    const [searchCache, setSearchCache] = useState({});
    const CACHE_DURATION = 3600000; // 1 hour
    const API_KEY = 'AIzaSyD00QYdB-HBtrTlvbuWF1tIVlI8V_e6y3g';
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backendserver-edb4bafdgxcwg7d5.centralindia-01.azurewebsites.net';
    const DEFAULT_COVER = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center';
    const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=center';
    const [sharePlaylist, setSharePlaylist] = useState(null);
    const [shareUrl, setShareUrl] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);

    const AVAILABLE_GENRES = [
        'Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'Country', 'R&B', 'Metal', 'Indie'
    ];

    const parseDuration = (iso) => {
        const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        const hours = parseInt(match?.[1] || 0);
        const mins = parseInt(match?.[2] || 0);
        const secs = parseInt(match?.[3] || 0);
        return hours * 3600 + mins * 60 + secs;
    };

    // Ensure volume values are valid integers between 0 and 100
    const clampVolume = (v) => {
        let n = Number(v);
        if (!isFinite(n)) n = 0;
        n = Math.round(n);
        return Math.max(0, Math.min(100, n));
    };

    // Safely apply volume to a YouTube player instance (or the stored youtubePlayer)
    const safeSetVolume = (vol, playerInstance = youtubePlayer) => {
        const v = clampVolume(vol);
        if (playerInstance && typeof playerInstance.setVolume === 'function') {
            try {
                playerInstance.setVolume(v);
            } catch (err) {
                console.error('safeSetVolume failed:', err, 'volume:', v);
            }
        }
        return v;
    };

    const formatDuration = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Load filter preferences from local storage
    useEffect(() => {
        const savedGenres = localStorage.getItem('filterGenres');
        const savedArtists = localStorage.getItem('filterArtists');
        const savedPopularity = localStorage.getItem('filterPopularity');
        if (savedGenres) setFilterGenres(JSON.parse(savedGenres));
        if (savedArtists) setFilterArtists(JSON.parse(savedArtists));
        if (savedPopularity) setFilterPopularity(JSON.parse(savedPopularity));
    }, []);

    // Save filter preferences to local storage
    useEffect(() => {
        localStorage.setItem('filterGenres', JSON.stringify(filterGenres));
        localStorage.setItem('filterArtists', JSON.stringify(filterArtists));
        localStorage.setItem('filterPopularity', JSON.stringify(filterPopularity));
    }, [filterGenres, filterArtists, filterPopularity]);

    const generateRecommendations = useCallback((allSongs, recentlyOverride = null) => {
        console.log('[recGen] called with', Array.isArray(allSongs) ? allSongs.length : 0, 'allSongs, recentlyOverride?', Array.isArray(recentlyOverride));
        if (!allSongs || allSongs.length === 0) {
            // Avoid clearing existing recommendations when transient calls pass an empty list
            console.log('[recGen] no allSongs candidates -> skipping update (preserve current recommendations)');
            return;
        }
        // Build a unique combined catalog to compute features against
        const combinedSongs = [...new Set([...allSongs, ...songs, ...filteredSongs].map(s => JSON.stringify(s)))].map(s => JSON.parse(s));

        // Helper to parse duration strings like "3:45" into seconds.
        const parseFormattedDuration = (dur) => {
            if (!dur && dur !== 0) return 0;
            if (typeof dur === 'number') return dur;
            const parts = String(dur).split(':').map(p => Number(p));
            if (parts.length === 1) return parts[0] || 0;
            if (parts.length === 2) return (parts[0] * 60) + (parts[1] || 0);
            if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + (parts[2] || 0);
            return 0;
        };

        const allGenres = [...new Set(combinedSongs.map(song => (song.genre || 'Music')))].filter(Boolean);
        const allArtists = [...new Set(combinedSongs.map(song => song.artist || 'Unknown'))].filter(Boolean);

        // Build feature vector with: one-hot genres, one-hot artists, normalized plays, normalized duration, recency score
        const maxPlays = Math.max(...combinedSongs.map(s => s.plays || 0), 1);
        const maxDuration = Math.max(...combinedSongs.map(s => parseFormattedDuration(s.duration) || 0), 1);

        // use override when provided so callers can compute recommendations immediately
        const activeRecently = Array.isArray(recentlyOverride) ? recentlyOverride : recentlyPlayed;

        const createFeatureVector = (song) => {
            const genreVector = allGenres.map(genre => (song.genre || 'Music') === genre ? 1 : 0);
            const artistVector = allArtists.map(artist => (song.artist || 'Unknown') === artist ? 1 : 0);
            const plays = (song.plays || 0) / maxPlays;
            const durationNorm = parseFormattedDuration(song.duration) / maxDuration;
            // recency: more weight for recentlyPlayed earlier in the array
            const idx = activeRecently.findIndex(s => s.id === song.id);
            const recency = idx >= 0 ? Math.exp(-idx / Math.max(1, activeRecently.length)) : 0;
            return [...genreVector, ...artistVector, plays, durationNorm, recency];
        };

        const cosineSimilarity = (vecA, vecB) => {
            const dot = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
            const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
            const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
            return (magA && magB) ? dot / (magA * magB) : 0;
        };

        // token overlap based title similarity (simple and fast)
        const titleSimilarity = (a = '', b = '') => {
            try {
                const ta = (a || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
                const tb = (b || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
                if (ta.length === 0 || tb.length === 0) return 0;
                const setB = new Set(tb);
                const common = ta.filter(t => setB.has(t)).length;
                return common / Math.max(ta.length, tb.length);
            } catch (err) {
                return 0;
            }
        };

        // If our combined catalog is tiny (e.g., only the recently played seed), try to expand
        if (combinedSongs.length <= 1) {
            const cachedPopular = (searchCache && searchCache['__popular__'] && Array.isArray(searchCache['__popular__'].data)) ? searchCache['__popular__'].data : null;
            if (cachedPopular && cachedPopular.length > 0) {
                console.log('[recGen] expanding combinedSongs with cached popular (', cachedPopular.length, ')');
                const union = [...new Map([...combinedSongs, ...cachedPopular].map(s => [s.id, s])).values()];
                // override combinedSongs for scoring
                combinedSongs.splice(0, combinedSongs.length, ...union);
            } else if (typeof fetchPopularSongs === 'function') {
                console.log('[recGen] no cached popular data, triggering fetchPopularSongs() to populate candidates');
                try { fetchPopularSongs(); } catch (err) { console.warn('fetchPopularSongs call failed:', err); }
            } else {
                console.log('[recGen] no fetchPopularSongs available and no cached popular results');
            }
        }

        const songVectors = combinedSongs.map(song => ({ song, vector: createFeatureVector(song) }));
        console.log('[recGen] combinedSongs:', combinedSongs.length, 'maxPlays:', maxPlays, 'maxDuration:', maxDuration);

        // Build user profile from recentlyPlayed (weighted by recency)
        const userPreferenceSongs = (Array.isArray(recentlyOverride) ? recentlyOverride : recentlyPlayed) && (Array.isArray(recentlyOverride) ? recentlyOverride.length > 0 : recentlyPlayed.length > 0)
            ? (Array.isArray(recentlyOverride) ? recentlyOverride.filter(s => s && s.id) : recentlyPlayed.filter(s => s && s.id))
            : Array.from(likedSongs).map(id => combinedSongs.find(s => s.id === id)).filter(Boolean);

        // If there is exactly one recently played song, use straightforward heuristics first
        if (userPreferenceSongs.length === 1) {
            console.log('[recGen] single seed detected:', userPreferenceSongs[0]?.title || userPreferenceSongs[0]?.id);
            const seed = userPreferenceSongs[0];
            // Prefer same artist, then same genre, ordered by a combined score that includes title overlap and popularity
            const scored = combinedSongs
                .filter(s => s.id !== seed.id)
                .map(s => {
                    const artistBoost = (s.artist || '') === (seed.artist || '') ? 1.2 : 0;
                    const genreBoost = (s.genre || '') === (seed.genre || '') ? 0.6 : 0;
                    const albumBoost = (s.album || '') === (seed.album || '') ? 0.4 : 0;
                    const titleSim = titleSimilarity(s.title, seed.title) * 0.8; // scale down
                    const popularity = Math.log10((s.plays || 1) + 1) / Math.log10(maxPlays + 1);
                    const baseVec = createFeatureVector(s);
                    const seedVec = createFeatureVector(seed);
                    const sim = cosineSimilarity(seedVec, baseVec);
                    // Combined score: similarity + explicit boosts + popularity
                    const score = (sim * 0.6) + artistBoost + genreBoost + albumBoost + titleSim + (popularity * 0.2);
                    return { song: s, score };
                })
                .sort((a, b) => b.score - a.score);

            const merged = [];
            for (const item of scored) {
                if (merged.length >= 12) break; // gather a larger pool then apply diversity
                if (!merged.find(m => m.id === item.song.id)) merged.push(item.song);
            }

            // If merged is empty (catalog too small), try to populate candidates via cached popular
            if (merged.length === 0) {
                const cachedPopular = (searchCache && searchCache['__popular__'] && Array.isArray(searchCache['__popular__'].data)) ? searchCache['__popular__'].data : null;
                if (cachedPopular && cachedPopular.length > 0) {
                    console.log('[recGen] using cached popular to populate single-seed merged list');
                    merged.push(...cachedPopular.slice(0, 12));
                } else {
                    // Trigger a targeted search for the seed's artist or title to get candidates
                    const q = (seed.artist || seed.title || '').toString();
                    const qKey = q.toLowerCase().trim();
                    if (qKey && !searchCache[qKey]) {
                        console.log('[recGen] single-seed: triggering searchSongs(', q, ') to populate recommendations');
                        try { searchSongs(q); } catch (err) { console.warn('searchSongs call failed:', err); }
                    } else {
                        console.log('[recGen] single-seed: no query or already cached');
                    }
                }
            }

            // Enforce some diversity: max 2 songs per artist
            const final = [];
            const perArtist = {};
            for (const s of merged) {
                const art = s.artist || 'Unknown';
                perArtist[art] = (perArtist[art] || 0) + 1;
                if (perArtist[art] <= 2) final.push(s);
                if (final.length >= 6) break;
            }

            console.log('[recGen] final single-seed recommendations:', final.slice(0, 6).map(s => s.id));
            setRecommendations(final.slice(0, 6));
            return;
        }

        // For multiple recently played songs, form a user vector by weighted average
        if (userPreferenceSongs.length === 0) {
            // no history -> random/poplular fallback
            const shuffled = [...combinedSongs].sort(() => 0.5 - Math.random()).slice(0, 6);
            console.log('[recGen] no seeds, fallback shuffled:', shuffled.map(s => s.id));
            setRecommendations(shuffled);
            return;
        }

        // weight recentlyPlayed songs by exponential recency (earlier = more recent)
        const weights = userPreferenceSongs.map((s, i) => Math.exp(-i / Math.max(1, userPreferenceSongs.length)));
        const userVectors = userPreferenceSongs.map(s => createFeatureVector(s));
        const vectorLength = userVectors[0]?.length || (allGenres.length + allArtists.length + 3);
        const userVector = new Array(vectorLength).fill(0);
        let totalWeight = 0;
        userVectors.forEach((vec, idx) => {
            const w = weights[idx] || 1;
            totalWeight += w;
            vec.forEach((val, i) => { userVector[i] += (val || 0) * w; });
        });
        if (totalWeight > 0) for (let i = 0; i < userVector.length; i++) userVector[i] /= totalWeight;

        // Compute enhanced scores: combine cosine similarity with explicit matches to recently played seeds
        const recentlyIds = new Set(userPreferenceSongs.map(s => s.id));

        const scores = songVectors.map(({ song, vector }) => {
            // base similarity to user vector
            const baseSim = cosineSimilarity(userVector, vector);

            // explicit boosts if this song matches any recently played seed
            const matches = userPreferenceSongs.map(seed => {
                const artistMatch = (seed.artist || '') === (song.artist || '') ? 1 : 0;
                const genreMatch = (seed.genre || '') === (song.genre || '') ? 1 : 0;
                const albumMatch = (seed.album || '') === (song.album || '') ? 1 : 0;
                const titleSim = titleSimilarity(seed.title, song.title);
                // recency: if seed is recent, boost proportionally
                const seedIdx = activeRecently.findIndex(s => s.id === seed.id);
                const seedRecency = seedIdx >= 0 ? Math.exp(-seedIdx / Math.max(1, activeRecently.length)) : 0;
                return { artistMatch, genreMatch, albumMatch, titleSim, seedRecency };
            });
            // aggregate boosts across seeds using recency-weighted averages so multiple seeds contribute
            const totalRecency = matches.reduce((sum, m) => sum + (m.seedRecency || 0), 0) || 1;
            const artistBoost = (matches.reduce((sum, m) => sum + (m.artistMatch || 0) * (m.seedRecency || 0), 0) / totalRecency) * 0.8;
            const genreBoost = (matches.reduce((sum, m) => sum + (m.genreMatch || 0) * (m.seedRecency || 0), 0) / totalRecency) * 0.4;
            const albumBoost = (matches.reduce((sum, m) => sum + (m.albumMatch || 0) * (m.seedRecency || 0), 0) / totalRecency) * 0.3;
            const titleBoost = (matches.reduce((sum, m) => sum + (m.titleSim || 0) * (m.seedRecency || 0), 0) / totalRecency) * 0.5;
            const recencyBoost = (matches.reduce((sum, m) => Math.max(sum, m.seedRecency || 0), 0)) * 0.35;

            // popularity factor (log-scaled) helps prefer known songs when relevant
            const popularity = Math.log10((song.plays || 1) + 1) / Math.log10(maxPlays + 1);

            const finalScore = (baseSim * 0.5) + artistBoost + genreBoost + albumBoost + (titleBoost * 0.6) + (recencyBoost * 0.8) + (popularity * 0.15);
            return { song, score: finalScore };
        });

        // Sort by score, filter recently played, and apply per-artist diversity cap
        const sorted = scores.sort((a, b) => b.score - a.score).map(s => s.song).filter(s => !recentlyIds.has(s.id));
        console.log('[recGen] scored candidates:', scores.length, 'sorted:', sorted.length, 'recentlyIds:', recentlyIds.size);

        const result = [];
        const artistCount = {};
        for (const s of sorted) {
            const art = s.artist || 'Unknown';
            artistCount[art] = (artistCount[art] || 0) + 1;
            if (artistCount[art] > 2) continue; // cap songs per artist to improve diversity
            result.push(s);
            if (result.length >= 6) break;
        }

        // If still not enough recommendations, fill with popular songs not in recent list
        if (result.length < 6) {
            const popular = [...combinedSongs].filter(s => !recentlyIds.has(s.id) && !result.find(r => r.id === s.id)).sort((a, b) => (b.plays || 0) - (a.plays || 0));
            for (const p of popular) {
                result.push(p);
                if (result.length >= 6) break;
            }
        }

        console.log('[recGen] final recommendations:', result.slice(0, 6).map(r => ({ id: r.id, title: r.title })), 'resultLen:', result.length);
        setRecommendations(result.slice(0, 6));
    }, [recentlyPlayed, likedSongs, songs, filteredSongs]);

    const startVoiceSearch = async () => {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('Voice search is not supported in this browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        // Check if already listening
        if (isListening && recognitionRef.current) {
            return;
        }

        try {
            // Check microphone permission if permissions API is available
            if (navigator.permissions && navigator.permissions.query) {
                try {
                    const permissionResult = await navigator.permissions.query({ name: 'microphone' });

                    if (permissionResult.state === 'denied') {
                        setError('Microphone access is blocked. Please allow microphone access in your browser settings and refresh the page.');
                        return;
                    }
                } catch (permError) {
                    // Permissions API failed, continue with direct request
                    console.warn('Permissions API failed:', permError);
                }
            }

            // Try to request microphone access directly
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });

                // Stop the stream immediately after getting permission
                stream.getTracks().forEach(track => track.stop());

            } catch (mediaError) {
                if (mediaError.name === 'NotAllowedError' || mediaError.name === 'PermissionDeniedError') {
                    setError('Microphone access denied. Please click "Allow" when your browser asks for microphone permission.');
                    return;
                } else if (mediaError.name === 'NotFoundError') {
                    setError('No microphone found. Please connect a microphone and try again.');
                    return;
                } else if (mediaError.name === 'NotReadableError') {
                    setError('Microphone is already in use by another application.');
                    return;
                } else {
                    setError('Unable to access microphone. Please check your browser settings.');
                    return;
                }
            }

            // Create new recognition instance
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;

            // Configure recognition
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                console.log('Voice recognition started');
                setIsListening(true);
                setError(null);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log('Voice recognition result:', transcript);
                setSearchQuery(transcript);
                searchSongs(transcript);
            };

            recognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                setIsListening(false);

                // Provide specific error messages
                switch (event.error) {
                    case 'not-allowed':
                        setError('Microphone access denied. Please enable microphone permissions.');
                        break;
                    case 'no-speech':
                        setError('No speech detected. Please try again.');
                        break;
                    case 'network':
                        setError('Network error. Voice search requires internet connection.');
                        break;
                    case 'aborted':
                        setError('Voice recognition was aborted.');
                        break;
                    case 'audio-capture':
                        setError('No microphone found. Please connect a microphone.');
                        break;
                    case 'language-not-supported':
                        setError('Language not supported by your browser.');
                        break;
                    default:
                        setError(`Voice recognition failed: ${event.error}`);
                }
            };

            recognition.onend = () => {
                console.log('Voice recognition ended');
                setIsListening(false);
                recognitionRef.current = null;
            };

            // Start recognition
            recognition.start();

        } catch (err) {
            console.error('Failed to start voice recognition:', err);
            setError('Failed to start voice search. Please try again.');
            setIsListening(false);
        }
    };


    const stopVoiceSearch = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            } catch (err) {
                console.error('Error stopping recognition:', err);
            }
        }
        setIsListening(false);
    };

    const selectSong = useCallback(async (song, songList = null) => {
        console.log('🎵 Selecting song:', song.title);

        setError(null);
        setIsPlaying(false);

        if (!song?.id) {
            setError('Invalid song selected');
            return;
        }

        if (songList && songList.length > 0) {
            const validSongs = songList.filter(s => s.id);
            setQueue(validSongs);
            const index = validSongs.findIndex(s => s.id === song.id);
            setCurrentIndex(index >= 0 ? index : 0);
        } else {
            setQueue(prev => {
                if (prev.length === 0) {
                    const validSongs = (filteredSongsRef.current.length > 0 ? filteredSongsRef.current : songsRef.current).filter(s => s.id);
                    const index = validSongs.findIndex(s => s.id === song.id);
                    setCurrentIndex(index >= 0 ? index : 0);
                    return validSongs;
                } else {
                    const index = prev.findIndex(s => s.id === song.id);
                    if (index >= 0) {
                        setCurrentIndex(index);
                    }
                    return prev;
                }
            });
        }

        setCurrentSong(song);
        setIsPlaying(true);
        // update recently played and its ref so recommendation can use latest data immediately
        setRecentlyPlayed(prev => {
            const newPlayed = [song, ...prev.filter(s => s.id !== song.id)];
            const sliced = newPlayed.slice(0, 5);
            try { recentlyPlayedRef.current = sliced; } catch (e) { /* ignore */ }
            // immediately generate recommendations using the updated recently played list
            try {
                // include recently played as candidates too to avoid empty pools
                generateRecommendationsRef.current([...(sliced || []), ...songsRef.current, ...filteredSongsRef.current], sliced);
            } catch (err) {
                // fallback to calling without override
                try { generateRecommendationsRef.current([...(sliced || []), ...songsRef.current, ...filteredSongsRef.current], sliced); } catch (e) { /* ignore */ }
            }
            return sliced;
        });
    }, []);

    const selectSongRef = useRef();

    useEffect(() => {
        selectSongRef.current = selectSong;
    }, [selectSong]);

    const playNext = useCallback(() => {
        setQueue(currentQueue => {
            if (currentQueue.length === 0) return currentQueue;

            setCurrentIndex(prevIndex => {
                let nextIndex;
                // use refs so playNext stays stable and doesn't recreate effects when shuffle/repeat toggles
                const useShuffle = shuffleRef.current;
                const useRepeat = repeatRef.current;
                if (useShuffle) {
                    nextIndex = Math.floor(Math.random() * currentQueue.length);
                } else {
                    nextIndex = prevIndex + 1;
                    if (nextIndex >= currentQueue.length) {
                        if (useRepeat === 'all') {
                            nextIndex = 0;
                        } else {
                            setIsPlaying(false);
                            return prevIndex;
                        }
                    }
                }

                selectSongRef.current(currentQueue[nextIndex]);
                return nextIndex;
            });

            return currentQueue;
        });
    }, []);

    const playPrevious = useCallback(() => {
        if (queue.length === 0) return;

        if (currentTime > 3) {
            if (youtubePlayer) {
                youtubePlayer.seekTo(0);
            }
            return;
        }

        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
            if (repeat === 'all') {
                prevIndex = queue.length - 1;
            } else {
                prevIndex = 0;
            }
        }

        setCurrentIndex(prevIndex);
        selectSong(queue[prevIndex]);
    }, [queue, currentIndex, currentTime, repeat, youtubePlayer, selectSong]);

    const fetchPlaylists = useCallback(async () => {
        if (!currentUser?.id) return;

        try {
            const response = await axios.get(`${BACKEND_URL}/api/playlists/${currentUser.id}`);
            const playlistsData = response.data.map(playlist => ({
                ...playlist,
                id: playlist._id
            }));
            console.log('Fetched playlists:', playlistsData);
            setPlaylists(playlistsData);
        } catch (err) {
            console.error('Failed to fetch playlists:', err);
            setError('Failed to load playlists');
        }
    }, [currentUser, BACKEND_URL]);

    const fetchAllPlaylists = useCallback(async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/playlists`);
            return response.data;
        } catch (err) {
            console.error('Failed to fetch all playlists:', err);
            setError('Failed to load all playlists');
            return [];
        }
    }, [BACKEND_URL]);

    useEffect(() => {
        if (currentUser?.id) {
            fetchPlaylists();
        }
    }, [currentUser, fetchPlaylists]);

    const deletePlaylist = async (playlistId) => {
        if (!window.confirm('Are you sure you want to delete this playlist?')) return;

        try {
            await axios.delete(`${BACKEND_URL}/api/playlists/${playlistId}`);
            setPlaylists(prev => prev.filter(p => (p._id || p.id) !== playlistId));

            if ((selectedPlaylist?._id || selectedPlaylist?.id) === playlistId) {
                setSelectedPlaylist(null);
                setActiveTab('playlists');
            }
        } catch (err) {
            console.error('Failed to delete playlist:', err);
            setError('Failed to delete playlist');
        }
    };

    const removeSongFromPlaylist = async (playlistId, songId) => {
        try {
            const response = await axios.delete(
                `${BACKEND_URL}/api/playlists/${playlistId}/songs/${songId}`
            );

            setPlaylists(prev =>
                prev.map(playlist =>
                    (playlist._id || playlist.id) === playlistId ? response.data.playlist : playlist
                )
            );

            if ((selectedPlaylist?._id || selectedPlaylist?.id) === playlistId) {
                setSelectedPlaylist(response.data.playlist);
            }
        } catch (err) {
            console.error('Failed to remove song:', err);
            setError('Failed to remove song from playlist');
        }
    };

    const startEditPlaylist = (playlist) => {
        setEditingPlaylist({ ...playlist });
    };

    const saveEditPlaylist = async () => {
        if (!editingPlaylist) return;

        try {
            const response = await axios.put(
                `${BACKEND_URL}/api/playlists/${editingPlaylist._id || editingPlaylist.id}`,
                { name: editingPlaylist.name, cover: editingPlaylist.cover || DEFAULT_COVER }
            );

            setPlaylists(prev =>
                prev.map(playlist =>
                    (playlist._id || playlist.id) === (editingPlaylist._id || editingPlaylist.id)
                        ? response.data.playlist
                        : playlist
                )
            );

            if ((selectedPlaylist?._id || selectedPlaylist?.id) === (editingPlaylist._id || editingPlaylist.id)) {
                setSelectedPlaylist(response.data.playlist);
            }

            setEditingPlaylist(null);
        } catch (err) {
            console.error('Failed to update playlist:', err);
            setError('Failed to update playlist');
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = clampVolume(e?.target?.value);
        // update UI immediately
        setVolume(newVolume);
        // attempt to apply to player if ready
        safeSetVolume(newVolume);
    };
    const handleSharePlaylist = async (playlist) => {
        if (!playlist || !playlist.id) {
            console.error('Invalid playlist:', playlist);
            setError('Cannot share playlist: Invalid playlist data');
            return;
        }
        if (!currentUser?.id) {
            console.error('Invalid user:', currentUser);
            setError('Cannot share playlist: User not logged in');
            return;
        }

        setSharePlaylist(playlist);
        const baseUrl = window.location.origin;
        const playlistUrl = `${baseUrl}/shared/playlist/${playlist.id}`;
        setShareUrl(playlistUrl);
        setShowShareModal(true);

        console.log('Sharing playlist:', playlist.id, 'User ID:', currentUser.id);

        try {
            const response = await axios.post(`${BACKEND_URL}/api/playlists/${playlist.id}/share`, {
                userId: currentUser.id
            });
            const shareToken = response.data.shareToken;
            const secureUrl = `${baseUrl}/shared/playlist/${playlist.id}?token=${shareToken}`;
            setShareUrl(secureUrl);
        } catch (err) {
            console.error('Failed to generate share token:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to generate share link. Please try again.');
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Link copied to clipboard!');
        }
    };

    const shareToSocial = (platform) => {
        const text = `Check out my playlist: ${sharePlaylist?.name}`;
        const url = encodeURIComponent(shareUrl);

        let shareLink = '';

        switch (platform) {
            case 'whatsapp':
                shareLink = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
                break;
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
                break;
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'telegram':
                shareLink = `https://t.me/share/url?url=${url}&text=${encodeURIComponent(text)}`;
                break;
            case 'linkedin':
                shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                break;
            default:
                return;
        }

        window.open(shareLink, '_blank', 'width=600,height=400');
    };

    const playNextRef = useRef();
    const repeatRef = useRef();
    const shuffleRef = useRef(shuffle);
    const filteredSongsRef = useRef(filteredSongs);
    const songsRef = useRef(songs);
    const generateRecommendationsRef = useRef();

    useEffect(() => {
        filteredSongsRef.current = filteredSongs;
    }, [filteredSongs]);

    useEffect(() => {
        recentlyPlayedRef.current = recentlyPlayed;
    }, [recentlyPlayed]);

    // Ensure recommendations update when recentlyPlayed changes (covers play actions)
    useEffect(() => {
        try {
            const all = [...recentlyPlayedRef.current, ...songsRef.current, ...filteredSongsRef.current];
            if (generateRecommendationsRef.current) {
                generateRecommendationsRef.current(all, recentlyPlayedRef.current);
            }
        } catch (err) {
            console.warn('Failed to regenerate recommendations on recentlyPlayed change:', err);
        }
    }, [recentlyPlayed]);

    useEffect(() => {
        songsRef.current = songs;
    }, [songs]);

    useEffect(() => {
        generateRecommendationsRef.current = generateRecommendations;
    }, [generateRecommendations]);

    useEffect(() => {
        playNextRef.current = playNext;
    }, [playNext]);

    useEffect(() => {
        shuffleRef.current = shuffle;
    }, [shuffle]);

    useEffect(() => {
        repeatRef.current = repeat;
    }, [repeat]);

    const handleStateChange = useCallback((event) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            setDuration(event.target.getDuration());
            setIsLoadingSong(false);
            setError(null);
        } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
        } else if (event.data === window.YT.PlayerState.ENDED) {
            if (repeatRef.current === 'one') {
                event.target.seekTo(0);
                event.target.playVideo();
            } else {
                playNextRef.current();
            }
        } else if (event.data === window.YT.PlayerState.BUFFERING) {
            setIsLoadingSong(true);
            setDuration(event.target.getDuration());
        } else if (event.data === window.YT.PlayerState.UNSTARTED) {
            setIsLoadingSong(true);
        }
    }, []);

    useEffect(() => {
        // Create the YouTube Player only after the playerRef node exists.
        // Some race conditions cause the YouTube widget to access an iframe
        // that hasn't been attached yet which results in "reading 'src' of null".
        let retryTimer = null;
        let scriptTag = null;

        const createPlayerIfReady = () => {
            if (!playerRef.current || !window.YT || !window.YT.Player) return false;
            try {
                /* eslint-disable no-new */
                new window.YT.Player(playerRef.current, {
                    height: '0',
                    width: '0',
                    events: {
                        onReady: (event) => {
                            setYoutubePlayer(event.target);
                            // apply initial volume safely
                            try { safeSetVolume(volume, event.target); } catch (err) { console.error('Failed to set initial volume via safeSetVolume:', err); }
                        },
                        onStateChange: handleStateChange,
                        onError: (event) => {
                            console.error('YouTube Player error:', event.data);
                            if ([2, 5, 100, 101, 150].includes(event.data)) {
                                setError('This video cannot be played. Trying next...');
                                setTimeout(() => { playNext(); }, 2000);
                            }
                            setIsPlaying(false);
                        }
                    }
                });
                return true;
            } catch (err) {
                console.error('createPlayerIfReady error:', err);
                return false;
            }
        };

        const waitForReady = (attempt = 0) => {
            if (createPlayerIfReady()) return;
            if (attempt >= 50) {
                console.error('YT.Player creation timed out after retries');
                return;
            }
            retryTimer = setTimeout(() => waitForReady(attempt + 1), 100);
        };

        if (!window.YT) {
            scriptTag = document.createElement('script');
            scriptTag.src = 'https://www.youtube.com/iframe_api';
            const firstScript = document.getElementsByTagName('script')[0];
            firstScript?.parentNode?.insertBefore(scriptTag, firstScript);
            window.onYouTubeIframeAPIReady = () => {
                waitForReady(0);
            };
        } else {
            waitForReady(0);
        }

        return () => {
            if (retryTimer) clearTimeout(retryTimer);
            if (scriptTag && scriptTag.parentNode) scriptTag.parentNode.removeChild(scriptTag);
            if (youtubePlayer && typeof youtubePlayer.destroy === 'function') {
                try { youtubePlayer.destroy(); } catch (err) { console.error('Error destroying player:', err); }
            }
        };
    }, [handleStateChange, playNext, youtubePlayer]); useEffect(() => {
        let interval;
        if (isPlaying && youtubePlayer) {
            interval = setInterval(() => {
                setCurrentTime(youtubePlayer.getCurrentTime());
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, youtubePlayer]);

    useEffect(() => {
        // whenever volume or player changes, apply volume safely
        safeSetVolume(volume);
    }, [volume, youtubePlayer]);

    useEffect(() => {
        if (youtubePlayer && currentSong?.id) {
            setIsLoadingSong(true);
            const tryLoad = (attempt = 0) => {
                try {
                    const iframe = youtubePlayer && typeof youtubePlayer.getIframe === 'function'
                        ? youtubePlayer.getIframe()
                        : playerRef.current && playerRef.current.querySelector('iframe');

                    if (!iframe) {
                        if (attempt < 20) return setTimeout(() => tryLoad(attempt + 1), 100);
                        console.error('safeLoadVideoById: iframe not ready');
                        setIsLoadingSong(false);
                        return;
                    }

                    if (iframe.src == null) {
                        if (attempt < 20) return setTimeout(() => tryLoad(attempt + 1), 100);
                        console.error('safeLoadVideoById: iframe.src is null/undefined');
                        setIsLoadingSong(false);
                        return;
                    }

                    youtubePlayer.loadVideoById(currentSong.id);
                } catch (err) {
                    console.error('tryLoad error:', err);
                    if (attempt < 20) return setTimeout(() => tryLoad(attempt + 1), 150);
                    setIsLoadingSong(false);
                }
            };

            tryLoad(0);
        }
    }, [currentSong, youtubePlayer]);

    const playSong = useCallback(async (song) => {
        if (!youtubePlayer || !song) return;

        setIsLoadingSong(true);
        setCurrentSong(song);
        setError(null);
        // Retry a few times to ensure the internal iframe is attached
        const tryPlay = (attempt = 0) => {
            try {
                const iframe = youtubePlayer && typeof youtubePlayer.getIframe === 'function'
                    ? youtubePlayer.getIframe()
                    : playerRef.current && playerRef.current.querySelector('iframe');

                if (!iframe) {
                    if (attempt < 20) return setTimeout(() => tryPlay(attempt + 1), 100);
                    throw new Error('iframe not available');
                }

                if (iframe.src == null) {
                    if (attempt < 20) return setTimeout(() => tryPlay(attempt + 1), 100);
                    throw new Error('iframe.src is null');
                }

                // Safe to call player API
                try {
                    youtubePlayer.loadVideoById(song.id);
                    // set volume if possible, but use the safe helper
                    safeSetVolume(volume);
                    if (typeof youtubePlayer.playVideo === 'function') {
                        youtubePlayer.playVideo();
                    }
                } catch (innerErr) {
                    console.error('player API error:', innerErr);
                    if (attempt < 20) return setTimeout(() => tryPlay(attempt + 1), 150);
                    throw innerErr;
                }
            } catch (err) {
                console.error('Failed to play song:', err);
                setError('Failed to play song');
                setIsLoadingSong(false);
            }
        };

        tryPlay(0);
    }, [youtubePlayer, volume]);

    const fetchPopularSongs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'snippet',
                    maxResults: 5,
                    order: 'viewCount',
                    type: 'video',
                    videoCategoryId: '10',
                    key: API_KEY
                }
            });

            const videoIds = response.data.items.map(item => item.id.videoId).join(',');

            const detailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                params: {
                    part: 'contentDetails,snippet,statistics',
                    id: videoIds,
                    key: API_KEY
                }
            });

            const mappedSongs = detailsResponse.data.items.map(video => {
                const durationSeconds = parseDuration(video.contentDetails.duration);
                const randomGenre = AVAILABLE_GENRES[Math.floor(Math.random() * AVAILABLE_GENRES.length)];
                return {
                    id: video.id,
                    title: video.snippet.title || 'Unknown Title',
                    artist: video.snippet.channelTitle || 'Unknown Artist',
                    album: 'YouTube',
                    duration: formatDuration(durationSeconds),
                    cover: video.snippet.thumbnails?.medium?.url || DEFAULT_COVER,
                    genre: randomGenre,
                    plays: parseInt(video.statistics?.viewCount || 0)
                };
            });

            setSongs(mappedSongs);
            setFilteredSongs(mappedSongs);
            // clear quota flag on success
            setYoutubeQuotaExceeded(false);
            // store popular songs in cache under a stable key
            const cacheKeyPopular = '__popular__';
            setSearchCache(prev => ({
                ...prev,
                [cacheKeyPopular]: {
                    data: mappedSongs,
                    timestamp: Date.now()
                }
            }));

            generateRecommendations([...mappedSongs, ...filteredSongs]);

            const uniqueArtists = [...new Set(mappedSongs.map(song => song.artist))];
            setAllArtists(prev => [...new Set([...prev, ...uniqueArtists])]);
            setArtists(uniqueArtists.map((name, idx) => ({
                id: idx + 1,
                name,
                songs: mappedSongs.filter(s => s.artist === name).length,
                albums: new Set(mappedSongs.filter(s => s.artist === name).map(s => s.album)).size
            })));

        } catch (err) {
            console.error('Failed to fetch popular songs:', err);
            if (err?.response?.status === 403) {
                // mark quota exceeded so admin sees a banner
                setYoutubeQuotaExceeded(true);
                setError('YouTube quota exceeded. Some catalog features may be unavailable.');
            } else {
                setError('Failed to fetch popular music from YouTube');
            }
        } finally {
            setLoading(false);
        }
    }, [generateRecommendations, filteredSongs]);

    // Track which user deletions are in-flight to avoid double-clicks and show UI feedback
    const [usersDeleting, setUsersDeleting] = useState(new Set());

    const fetchUsers = useCallback(async () => {
        try {
            setUsersLoading(true);
            setUsersError(null);
            const { data } = await axios.get(`${BACKEND_URL}/api/users`);
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setUsersError('Failed to load users from server');
        } finally {
            setUsersLoading(false);
        }
    }, [BACKEND_URL]);

    useEffect(() => {
        const storedUser = window.localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            setIsAdmin(user.role === 'admin');
            // populate initial songs catalog so admin panels show data
            try { fetchPopularSongs(); } catch (err) { console.warn('fetchPopularSongs failed at init:', err); }
        }
    }, []);

    // When admin opens the Admin panel, fetch global playlists and ensure songs are populated
    useEffect(() => {
        if (activeTab === 'admin' && isAdmin) {
            (async () => {
                try {
                    setLoading(true);
                    // fetch global playlists for admin overview
                    const all = await fetchAllPlaylists();
                    if (Array.isArray(all) && all.length > 0) {
                        const playlistsData = all.map(p => ({ ...p, id: p._id || p.id }));
                        setPlaylists(playlistsData);
                    }

                    // ensure songs are available for Songs/Artists management
                    if ((songs || []).length === 0) {
                        try { await fetchPopularSongs(); } catch (err) { console.warn('fetchPopularSongs failed in admin effect:', err); }
                    }
                } catch (err) {
                    console.error('Failed to load admin overview data:', err);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [activeTab, isAdmin, fetchAllPlaylists, fetchPopularSongs, songs]);

    useEffect(() => {
        if (songs.length > 0 || filteredSongs.length > 0) {
            generateRecommendations([...songs, ...filteredSongs]);
        }
    }, [songs, filteredSongs, generateRecommendations]);

    useEffect(() => {
        if (activeTab === 'admin' && isAdmin && users.length === 0) {
            fetchUsers();
        }
    }, [activeTab, isAdmin, users.length, fetchUsers]);

    const searchSongs = (query) => {
        const cacheKey = query.toLowerCase();
        const cached = searchCache[cacheKey];

        // Check cache first
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            setFilteredSongs(cached.data);
            setLoading(false);
            return;
        }

        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        if (!query) {
            setFilteredSongs(songs);
            generateRecommendations(songs);
            return;
        }

        searchTimerRef.current = setTimeout(async () => {
            try {
                setLoading(true);
                setError(null); // Clear previous errors

                const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        part: 'snippet',
                        q: query,
                        maxResults: 10,
                        type: 'video',
                        videoCategoryId: '10',
                        key: API_KEY
                    }
                });

                if (!response.data.items || response.data.items.length === 0) {
                    setFilteredSongs([]);
                    setError('No results found');
                    setLoading(false);
                    return;
                }

                const videoIds = response.data.items.map(item => item.id.videoId).join(',');

                const detailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                    params: {
                        part: 'contentDetails,snippet,statistics',
                        id: videoIds,
                        key: API_KEY
                    }
                });

                const mappedSongs = detailsResponse.data.items.map(video => {
                    const durationSeconds = parseDuration(video.contentDetails.duration);
                    const randomGenre = AVAILABLE_GENRES[Math.floor(Math.random() * AVAILABLE_GENRES.length)];
                    return {
                        id: video.id,
                        title: video.snippet.title || 'Unknown Title',
                        artist: video.snippet.channelTitle || 'Unknown Artist',
                        album: 'YouTube',
                        duration: formatDuration(durationSeconds),
                        cover: video.snippet.thumbnails?.medium?.url || DEFAULT_COVER,
                        genre: randomGenre,
                        plays: parseInt(video.statistics?.viewCount || 0)
                    };
                });

                setFilteredSongs(mappedSongs);

                // ✅ SAVE TO CACHE
                setSearchCache(prev => ({
                    ...prev,
                    [cacheKey]: {
                        data: mappedSongs,
                        timestamp: Date.now()
                    }
                }));

                generateRecommendations([...songs, ...mappedSongs]);

                const uniqueArtists = [...new Set(mappedSongs.map(song => song.artist))];
                setAllArtists(prev => [...new Set([...prev, ...uniqueArtists])]);

            } catch (err) {
                console.error('Search failed:', err);

                // Better error handling
                if (err.response?.status === 403) {
                    setError('YouTube quota exceeded. Please try again later.');
                } else if (err.response?.status === 400) {
                    setError('Invalid search query. Please try different keywords.');
                } else {
                    setError('Search failed. Please check your connection.');
                }
            } finally {
                setLoading(false);
            }
        }, 500);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setIsAdmin(false);
        setCurrentSong(null);
        setIsPlaying(false);
        setActiveTab('home');
        setSongs([]);
        setFilteredSongs([]);
        setPlaylists([]);
        setUsers([]);
        setQueue([]);
        setCurrentIndex(0);
        setRecentlyPlayed([]);
        setYoutubePlayer(null);
        window.localStorage.removeItem('user');
        router.push('/dashboard');
    };

    // ADD SAVE OFFLINE FUNCTION HERE
    const saveOffline = () => {
        if (!currentSong) {
            alert('Play a song first!');
            return;
        }

        const downloads = JSON.parse(localStorage.getItem('offlineSongs') || '[]');

        if (downloads.find(d => d.id === currentSong.id)) {
            alert('Already downloaded!');
            return;
        }

        downloads.push({
            id: currentSong.id,
            title: currentSong.title,
            artist: currentSong.channelTitle,
            thumbnail: currentSong.thumbnail,
            url: currentSong.url,
            downloadedAt: new Date().toISOString()
        });

        localStorage.setItem('offlineSongs', JSON.stringify(downloads));
        alert('✅ Saved for offline playback!');
    };


    const togglePlay = () => {
        if (!youtubePlayer || !currentSong) return;

        try {
            if (isPlaying) {
                if (typeof youtubePlayer.pauseVideo === 'function') {
                    youtubePlayer.pauseVideo();
                }
            } else {
                if (typeof youtubePlayer.playVideo === 'function') {
                    youtubePlayer.playVideo();
                }
            }
        } catch (err) {
            console.error('Failed to toggle play/pause:', err);
        }
    };

    const handleSeek = (e) => {
        if (!youtubePlayer) return;

        const seekTime = Number(e.target.value);
        setCurrentTime(seekTime);

        try {
            if (typeof youtubePlayer.seekTo === 'function') {
                youtubePlayer.seekTo(seekTime, true);
            }
        } catch (err) {
            console.error('Failed to seek:', err);
        }
    };

    const toggleShuffle = () => setShuffle(prev => !prev);

    const toggleRepeat = () => {
        const modes = ['off', 'all', 'one'];
        setRepeat(prev => {
            const currentModeIndex = modes.indexOf(prev);
            return modes[(currentModeIndex + 1) % modes.length];
        });
    };

    const toggleLike = (songId) => {
        setLikedSongs(prev => {
            const newLiked = new Set(prev);
            if (newLiked.has(songId)) {
                newLiked.delete(songId);
            } else {
                newLiked.add(songId);
            }
            return newLiked;
        });
    };

    const formatTime = (seconds) => {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const createPlaylist = async () => {
        if (!newPlaylistName.trim() || !currentUser?.id) return;

        try {
            const response = await axios.post(`${BACKEND_URL}/api/playlists`, {
                name: newPlaylistName,
                userId: currentUser.id,
                cover: DEFAULT_COVER
            });

            setPlaylists(prev => [...prev, response.data.playlist]);
            setNewPlaylistName('');
            setShowCreatePlaylist(false);
        } catch (err) {
            console.error('Failed to create playlist:', err);
            setError('Failed to create playlist');
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        searchSongs(query);
    };

    const applyFilters = useCallback(() => {
        // Prefer the current search results (filteredSongsRef) when there is an active search query.
        // Otherwise fall back to the full songs list. This ensures filters apply to search results
        // instead of overwriting them by always starting from `songs`.
        const baseList = searchQuery
            ? (filteredSongsRef.current && filteredSongsRef.current.length > 0 ? filteredSongsRef.current : (songs || []))
            : (songs && songs.length > 0 ? songs : (filteredSongsRef.current || []));
        let filtered = [...baseList];

        if (filterGenres.length > 0) {
            filtered = filtered.filter(song => filterGenres.includes(song.genre));
        }
        if (filterArtists.length > 0) {
            filtered = filtered.filter(song => filterArtists.includes(song.artist));
        }
        if (searchQuery) {
            filtered = filtered.filter(song =>
                (song.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (song.artist?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                (song.album?.toLowerCase() || '').includes(searchQuery.toLowerCase())
            );
        }
        filtered = filtered.filter(song =>
            song.plays >= filterPopularity[0] && song.plays <= filterPopularity[1]
        );

        setFilteredSongs(filtered);
    }, [songs, filterGenres, filterArtists, searchQuery, filterPopularity]);

    // Helper to apply filters immediately after a state update
    const applyFiltersToList = useCallback((nextFilterGenres, nextFilterArtists, nextFilterPopularity, nextSearchQuery) => {
        const genres = nextFilterGenres ?? filterGenres;
        const artists = nextFilterArtists ?? filterArtists;
        const popularity = nextFilterPopularity ?? filterPopularity;
        const query = typeof nextSearchQuery === 'string' ? nextSearchQuery : searchQuery;

        // When a query is present (either passed in or the current searchQuery), prefer the
        // search results (filteredSongsRef.current) so filters refine the results of the search.
        const baseList = query
            ? (filteredSongsRef.current && filteredSongsRef.current.length > 0 ? filteredSongsRef.current : (songs || []))
            : ((songs && songs.length > 0) ? songs : (filteredSongsRef.current || []));
        let filtered = [...baseList];
        if (genres.length > 0) filtered = filtered.filter(song => genres.includes(song.genre));
        if (artists.length > 0) filtered = filtered.filter(song => artists.includes(song.artist));
        if (query) {
            filtered = filtered.filter(song =>
                (song.title?.toLowerCase() || '').includes(query.toLowerCase()) ||
                (song.artist?.toLowerCase() || '').includes(query.toLowerCase()) ||
                (song.album?.toLowerCase() || '').includes(query.toLowerCase())
            );
        }
        filtered = filtered.filter(song => (song.plays || 0) >= (popularity[0] || 0) && (song.plays || 0) <= (popularity[1] || 10000000));

        setFilteredSongs(filtered);
    }, [songs, filterGenres, filterArtists, filterPopularity, searchQuery]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const toggleGenreFilter = (genre) => {
        setFilterGenres(prev => {
            const next = prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre];
            // apply immediately
            applyFiltersToList(next, undefined, undefined, undefined);
            return next;
        });
    };

    const toggleArtistFilter = (artist) => {
        setFilterArtists(prev => {
            const next = prev.includes(artist) ? prev.filter(a => a !== artist) : [...prev, artist];
            applyFiltersToList(undefined, next, undefined, undefined);
            return next;
        });
    };

    const handlePopularityChange = (e) => {
        const value = Number(e.target.value);
        const next = [0, value];
        setFilterPopularity(next);
        applyFiltersToList(undefined, undefined, next, undefined);
    };

    const addSongToPlaylist = async (playlistId) => {
        if (!selectedSongForPlaylist) return;

        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/playlists/${playlistId}/songs`,
                selectedSongForPlaylist
            );

            setPlaylists(prev =>
                prev.map(playlist =>
                    (playlist._id || playlist.id) === playlistId ? response.data.playlist : playlist
                )
            );

            setShowAddToPlaylist(false);
            setSelectedSongForPlaylist(null);
        } catch (err) {
            console.error('Failed to add song:', err);
            if (err.response?.data?.message === 'Song already in playlist') {
                alert('This song is already in the playlist');
            } else {
                setError('Failed to add song to playlist');
            }
        }
    };

    const openPlaylist = (playlist) => {
        setSelectedPlaylist(playlist);
        setActiveTab('playlist-detail');
    };

    const deleteSong = (songId) => {
        if (window.confirm('Are you sure you want to delete this song?')) {
            setSongs(prev => prev.filter(song => song.id !== songId));
            setFilteredSongs(prev => prev.filter(song => song.id !== songId));
        }
    };

    const startEditSong = (song) => setEditingSong({ ...song });

    const saveEditSong = () => {
        if (!editingSong) return;

        setSongs(prev => prev.map(song => song.id === editingSong.id ? editingSong : song));
        setFilteredSongs(prev => prev.map(song => song.id === editingSong.id ? editingSong : song));
        setEditingSong(null);
    };

    const deleteArtist = (artistName) => {
        if (window.confirm(`Are you sure you want to delete ${artistName} and all their songs?`)) {
            setSongs(prev => prev.filter(song => song.artist !== artistName));
            setFilteredSongs(prev => prev.filter(song => song.artist !== artistName));
            setArtists(prev => prev.filter(artist => artist.name !== artistName));
            setAllArtists(prev => prev.filter(artist => artist !== artistName));
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        // prevent double deletion
        if (usersDeleting.has(userId)) return;

        try {
            setUsersDeleting(prev => new Set(prev).add(userId));
            await axios.delete(`${BACKEND_URL}/api/users/${userId}`);
            setUsers(prev => prev.filter(user => (user._id || user.id) !== userId));
        } catch (err) {
            console.error('Failed to delete user:', err);
            setUsersError('Failed to delete user');
        } finally {
            setUsersDeleting(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        }
    };

    const playAllSongs = (songList) => {
        if (songList.length === 0) return;

        const validSongs = songList.filter(s => s.id);
        if (validSongs.length === 0) {
            setError('No playable songs in this list');
            return;
        }

        selectSong(validSongs[0], validSongs);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (!currentUser) {
        return (
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="logo-container">
                            <Music className="logo-icon" />
                        </div>
                        <h1 className="app-title">MusicStream</h1>
                        <p className="app-subtitle">Your personal music companion</p>
                    </div>
                    <div className="login-buttons">
                        <button onClick={() => router.push('/login')} className="login-btn user-btn">
                            Login as User
                        </button>
                        <button onClick={() => router.push('/login')} className="login-btn admin-btn">
                            Login as Admin
                        </button>
                    </div>
                    {loading && <p>Loading...</p>}
                    {error && <p className="error-text">Error: {error}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <div ref={playerRef} style={{ display: 'none' }}></div>

            <header className="header">
                <div className="header-content">
                    <div className="header-left">
                        <Music className="header-logo" />
                        <h1 className="header-title">MusicStream</h1>
                    </div>
                    <div className="header-center">
                        <div className="search-container">
                            <Search className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search songs, artists, albums... or use voice search"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="search-input"
                            />
                            <button
                                onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                                className={`voice-search-btn ${isListening ? 'listening' : ''}`}
                                title={isListening ? 'Stop voice search' : 'Start voice search'}
                            >
                                <Mic className="mic-icon" />
                            </button>
                        </div>
                    </div>
                    <div className="header-right">
                        <Image
                            src={currentUser.avatar || DEFAULT_AVATAR}
                            alt={currentUser.username || currentUser.name || 'User'}
                            className="user-avatar"
                            width={100}
                            height={100}
                            priority
                        />
                        <span className="user-name">{currentUser.username || currentUser.name}</span>
                        <QuizIcon onClick={() => {
                            if (currentSong) {
                                setQuizSong(currentSong);
                                setShowQuizPopup(true);
                            } else {
                                alert('Play a song first to take the quiz!');
                            }
                        }} />
                        <button
                            onClick={() => {
                                if (currentSong) {
                                    setShowLyrics(true);
                                } else {
                                    alert('Play a song first to see lyrics!');
                                }
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                border: 'none',
                                borderRadius: '20px',
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer',
                                marginLeft: '16px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(245, 87, 108, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <Music size={24} />
                            <span>Lyrics</span>
                        </button>
                        <button
                            onClick={() => setShowOfflineManager(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none',
                                borderRadius: '20px',
                                color: 'white',
                                fontWeight: '600',
                                cursor: 'pointer',
                                marginLeft: '16px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <Download size={24} />
                            <span>Offline</span>
                        </button>



                        <button onClick={handleLogout} className="logout-btn">Logout</button>
                    </div>
                </div>
            </header>
            <div className="main-layout">
                <aside className="sidebar">
                    <nav className="nav-menu">
                        <button onClick={() => setActiveTab('home')} className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}>
                            <Home className="nav-icon" /><span>Home</span>
                        </button>
                        <button onClick={() => setActiveTab('search')} className={`nav-item ${activeTab === 'search' ? 'active' : ''}`}>
                            <Search className="nav-icon" /><span>Search</span>
                        </button>
                        <button onClick={() => setActiveTab('playlists')} className={`nav-item ${activeTab === 'playlists' ? 'active' : ''}`}>
                            <Music className="nav-icon" /><span>My Playlists</span>
                        </button>
                        {isAdmin && (
                            <button onClick={() => setActiveTab('admin')} className={`nav-item ${activeTab === 'admin' ? 'active admin' : ''}`}>
                                <Shield className="nav-icon" /><span>Admin Panel</span>
                            </button>
                        )}
                    </nav>
                    <div className="quick-playlists">
                        <h3 className="quick-title">Quick Playlists</h3>
                        <div className="playlist-list">
                            {playlists.slice(0, 3).map(playlist => (
                                <div
                                    key={playlist._id || playlist.id}
                                    className="playlist-item"
                                    onClick={() => openPlaylist(playlist)}
                                >
                                    <Image
                                        src={playlist.cover || DEFAULT_COVER}
                                        alt={playlist.name}
                                        className="playlist-cover"
                                        width={300}
                                        height={300}
                                        loading="lazy"
                                    />
                                    <div className="playlist-info">
                                        <p className="playlist-name">{playlist.name}</p>
                                        <p className="playlist-count">{playlist.songs.length} songs</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
                <main className="main-content">
                    {activeTab === 'home' && (
                        <div className="home-content">
                            <div className="welcome-section">
                                <h2 className="welcome-title">Welcome back, {currentUser.username || currentUser.name}!</h2>
                                {loading ? <p>Loading...</p> : error ? <p className="error-text">{error}</p> : (
                                    <>
                                        <div className="featured-songs">
                                            {songs.map((song) => (
                                                <div key={song.id} className="song-card" onClick={() => selectSong(song)}>
                                                    <div className="song-cover-container">
                                                        <Image
                                                            src={song.cover || DEFAULT_COVER}
                                                            alt={song.title || 'Song'}
                                                            className="song-cover"
                                                            width={300}
                                                            height={300}
                                                            loading="lazy"
                                                        />
                                                        <button className="play-overlay"><Play className="play-icon" /></button>
                                                    </div>
                                                    <h3 className="song-title">{song.title}</h3>
                                                    <p className="song-artist">{song.artist}</p>
                                                    <Heart
                                                        className={`heart-icon ${likedSongs.has(song.id) ? 'liked' : ''}`}
                                                        onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="recent-section">
                                            <h3 className="section-title">Recently Played</h3>
                                            <div className="recent-list">
                                                {recentlyPlayed.slice(0, 3).map((song) => (
                                                    <div key={song.id} className="recent-item" onClick={() => selectSong(song)}>
                                                        <Image
                                                            src={song.cover || DEFAULT_COVER}
                                                            alt={song.title || 'Song'}
                                                            className="recent-cover"
                                                            width={300}
                                                            height={300}
                                                            loading="lazy"
                                                        />
                                                        <div className="recent-info">
                                                            <h4 className="recent-title">{song.title}</h4>
                                                            <p className="recent-artist">{song.artist} • {song.album}</p>
                                                        </div>
                                                        <span className="recent-duration">{song.duration}</span>
                                                        <button className="recent-play"><Play className="recent-play-icon" /></button>
                                                        <Heart
                                                            className={`heart-icon ${likedSongs.has(song.id) ? 'liked' : ''}`}
                                                            onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="recommendations-section">
                                            <h3 className="section-title">Recommended For You</h3>
                                            <div className="featured-songs">
                                                {recommendations.map((song) => (
                                                    <div key={song.id} className="song-card" onClick={() => selectSong(song)}>
                                                        <div className="song-cover-container">
                                                            <Image
                                                                src={song.cover || DEFAULT_COVER}
                                                                alt={song.title || 'Song'}
                                                                className="song-cover"
                                                                width={300}
                                                                height={300}
                                                                loading="lazy"
                                                            />
                                                            <button className="play-overlay"><Play className="play-icon" /></button>
                                                        </div>
                                                        <h3 className="song-title">{song.title}</h3>
                                                        <p className="song-artist">{song.artist}</p>
                                                        <span className="song-genre">{song.genre}</span>
                                                        <Heart
                                                            className={`heart-icon ${likedSongs.has(song.id) ? 'liked' : ''}`}
                                                            onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'search' && (
                        <div className="search-content">
                            <h2 className="page-title">Search & Browse</h2>
                            <div className="filter-section">
                                <div className="filter-group">
                                    <label className="filter-label">Genres:</label>
                                    <div className="filter-checkboxes">
                                        {AVAILABLE_GENRES.map(genre => (
                                            <label
                                                key={genre}
                                                className="checkbox-label"
                                                role="checkbox"
                                                tabIndex={0}
                                                aria-checked={filterGenres.includes(genre)}
                                                onClick={() => toggleGenreFilter(genre)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        toggleGenreFilter(genre);
                                                    }
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={filterGenres.includes(genre)}
                                                    readOnly
                                                />
                                                {genre}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="filter-group">
                                    <label className="filter-label">Artists:</label>
                                    <div className="filter-checkboxes">
                                        {allArtists.map(artist => (
                                            <label
                                                key={artist}
                                                className="checkbox-label"
                                                role="checkbox"
                                                tabIndex={0}
                                                aria-checked={filterArtists.includes(artist)}
                                                onClick={() => toggleArtistFilter(artist)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        toggleArtistFilter(artist);
                                                    }
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={filterArtists.includes(artist)}
                                                    readOnly
                                                />
                                                {artist}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="filter-group">
                                    <label className="filter-label">Popularity (Plays):</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="10000000"
                                        step="10000"
                                        value={filterPopularity[1]}
                                        onChange={handlePopularityChange}
                                        className="filter-slider"
                                    />
                                    <span>{filterPopularity[1].toLocaleString()} plays</span>
                                </div>
                            </div>
                            {loading ? <p>Loading...</p> : error ? <p className="error-text">{error}</p> : filteredSongs.length > 0 ? (
                                <div className="search-results">
                                    {filteredSongs.map((song) => (
                                        <div key={song.id} className="search-item">
                                            <Image
                                                src={song.cover || DEFAULT_COVER}
                                                alt={song.title || 'Song'}
                                                className="search-cover"
                                                width={300}
                                                height={300}
                                                loading="lazy"
                                            />
                                            <div className="search-info" onClick={() => selectSong(song)}>
                                                <h4 className="search-title">{song.title}</h4>
                                                <p className="search-artist">{song.artist} • {song.album}</p>
                                                <p className="search-genre">{song.genre} • {song.plays.toLocaleString()} plays</p>
                                            </div>
                                            <div className="search-actions">
                                                <span className="search-duration">{song.duration}</span>
                                                <button
                                                    className="add-playlist-btn"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedSongForPlaylist(song); setShowAddToPlaylist(true); }}
                                                    title="Add to playlist"
                                                >
                                                    <Plus className="plus-icon-small" />
                                                </button>
                                                <Heart
                                                    className={`heart-icon ${likedSongs.has(song.id) ? 'liked' : ''}`}
                                                    onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                                                />
                                                <button className="search-play" onClick={() => selectSong(song)}>
                                                    <Play className="search-play-icon" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-search">
                                    <Search className="empty-icon" />
                                    <p className="empty-text">{searchQuery ? 'No songs found' : 'Use filters to browse songs or search above'}</p>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'playlists' && (
                        <div className="playlists-content">
                            <div className="playlists-header">
                                <h2 className="page-title">My Playlists</h2>
                                <button onClick={() => setShowCreatePlaylist(true)} className="create-playlist-btn">
                                    <Plus className="plus-icon" /><span>Create Playlist</span>
                                </button>
                            </div>
                            {showCreatePlaylist && (
                                <div className="create-playlist-form">
                                    <h3 className="form-title">Create New Playlist</h3>
                                    <div className="form-controls">
                                        <input
                                            type="text"
                                            placeholder="Playlist name"
                                            value={newPlaylistName}
                                            onChange={(e) => setNewPlaylistName(e.target.value)}
                                            className="playlist-input"
                                        />
                                        <button onClick={createPlaylist} className="create-btn">Create</button>
                                        <button onClick={() => setShowCreatePlaylist(false)} className="cancel-btn">Cancel</button>
                                    </div>
                                </div>
                            )}
                            {loading ? <p>Loading...</p> : error ? <p className="error-text">{error}</p> : (
                                <div className="playlists-grid">
                                    {playlists.map(playlist => (
                                        <div
                                            key={playlist.id || playlist._id} // Use id if available, fallback to _id
                                            className="playlist-card-wrapper"
                                        >
                                            <div
                                                className="playlist-card"
                                                onClick={() => openPlaylist(playlist)}
                                            >
                                                <Image
                                                    src={playlist.cover || DEFAULT_COVER}
                                                    alt={playlist.name}
                                                    className="playlist-card-cover"
                                                    width={300}
                                                    height={300}
                                                    loading="lazy"
                                                />
                                                <div className="playlist-card-overlay">
                                                    <button
                                                        className="playlist-play-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            playAllSongs(playlist.songs);
                                                        }}
                                                    >
                                                        <Play className="play-icon" />
                                                    </button>
                                                </div>
                                                <h3 className="playlist-card-name">{playlist.name}</h3>
                                                <p className="playlist-card-count">{playlist.songs.length} songs</p>
                                            </div>
                                            <button
                                                className="share-playlist-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('Clicked share for playlist:', playlist);
                                                    handleSharePlaylist(playlist);
                                                }}
                                                title="Share playlist"
                                            >
                                                <Share2 className="share-icon" /> Share
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'playlist-detail' && selectedPlaylist && (
                        <div className="playlist-detail-content">
                            <div className="playlist-detail-header">
                                <button onClick={() => setActiveTab('playlists')} className="back-btn">← Back to Playlists</button>
                                <div className="playlist-header-content">
                                    <Image
                                        src={selectedPlaylist.cover || DEFAULT_COVER}
                                        alt={selectedPlaylist.name || 'Playlist'}
                                        className="playlist-detail-cover"
                                        width={300}
                                        height={300}
                                        loading="lazy"
                                    />
                                    <div className="playlist-header-info">
                                        <h2 className="playlist-detail-title">{selectedPlaylist.name}</h2>
                                        <p className="playlist-detail-count">{selectedPlaylist.songs.length} songs</p>
                                        {selectedPlaylist.songs.length > 0 && (
                                            <button onClick={() => playAllSongs(selectedPlaylist.songs)} className="play-all-btn">
                                                <Play className="play-icon" /> Play All
                                            </button>
                                        )}
                                        {isAdmin && (
                                            <div className="playlist-actions">
                                                <button
                                                    onClick={() => startEditPlaylist(selectedPlaylist)}
                                                    className="edit-btn"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deletePlaylist(selectedPlaylist._id || selectedPlaylist.id)}
                                                    className="delete-btn"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {editingPlaylist && (editingPlaylist._id || editingPlaylist.id) === (selectedPlaylist._id || selectedPlaylist.id) ? (
                                <div className="edit-playlist-form">
                                    <h3 className="form-title">Edit Playlist</h3>
                                    <div className="form-controls">
                                        <input
                                            type="text"
                                            placeholder="Playlist name"
                                            value={editingPlaylist.name}
                                            onChange={(e) => setEditingPlaylist({ ...editingPlaylist, name: e.target.value })}
                                            className="playlist-input"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Cover URL"
                                            value={editingPlaylist.cover || DEFAULT_COVER}
                                            onChange={(e) => setEditingPlaylist({ ...editingPlaylist, cover: e.target.value })}
                                            className="playlist-input"
                                        />
                                        <button onClick={saveEditPlaylist} className="create-btn">Save</button>
                                        <button onClick={() => setEditingPlaylist(null)} className="cancel-btn">Cancel</button>
                                    </div>
                                </div>
                            ) : null}
                            <div className="playlist-songs-list">
                                {selectedPlaylist.songs.length === 0 ? (
                                    <div className="empty-playlist">
                                        <Music className="empty-icon" />
                                        <p className="empty-text">No songs in this playlist yet</p>
                                        <button onClick={() => setActiveTab('search')} className="browse-btn">Browse Songs</button>
                                    </div>
                                ) : (
                                    selectedPlaylist.songs.map((song, index) => (
                                        <div key={song.id} className="playlist-song-item" onClick={() => selectSong(song, selectedPlaylist.songs)}>
                                            <span className="song-number">{index + 1}</span>
                                            <Image
                                                src={song.cover || DEFAULT_COVER}
                                                alt={song.title || 'Song'}
                                                className="playlist-song-cover"
                                                width={300}
                                                height={300}
                                                loading="lazy"
                                            />
                                            <div className="playlist-song-info">
                                                <h4 className="playlist-song-title">{song.title}</h4>
                                                <p className="playlist-song-artist">{song.artist}</p>
                                            </div>
                                            <span className="playlist-song-album">{song.album}</span>
                                            <span className="playlist-song-duration">{song.duration}</span>
                                            <button className="playlist-song-play">
                                                <Play className="play-icon-small" />
                                            </button>
                                            <Heart
                                                className={`heart-icon ${likedSongs.has(song.id) ? 'liked' : ''}`}
                                                onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                                            />
                                            {isAdmin && (
                                                <button
                                                    className="remove-song-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeSongFromPlaylist(selectedPlaylist._id || selectedPlaylist.id, song.id);
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'admin' && isAdmin && (
                        <div className="admin-content">
                            <h2 className="page-title">Admin Dashboard</h2>
                            {youtubeQuotaExceeded && (
                                <div className="admin-banner quota-exceeded">
                                    <p>
                                        YouTube API quota appears to be exceeded. Some catalog data (popular songs, search) may be unavailable.
                                    </p>
                                    <div className="banner-actions">
                                        <button className="retry-btn" onClick={() => { setError(null); fetchPopularSongs(); }}>Retry</button>
                                        <button className="dismiss-btn" onClick={() => setYoutubeQuotaExceeded(false)}>Dismiss</button>
                                    </div>
                                </div>
                            )}
                            <div className="stats-grid">
                                <div className="stat-card blue-gradient">
                                    <div className="stat-content">
                                        <div className="stat-info">
                                            <p className="stat-label">Total Songs</p>
                                            <p className="stat-value">{songs.length}</p>
                                        </div>
                                        <Music className="stat-icon" />
                                    </div>
                                </div>
                                <div className="stat-card green-gradient">
                                    <div className="stat-content">
                                        <div className="stat-info">
                                            <p className="stat-label">Active Users</p>
                                            <p className="stat-value">{users.length}</p>
                                        </div>
                                        <Users className="stat-icon" />
                                    </div>
                                </div>
                                <div className="stat-card orange-gradient">
                                    <div className="stat-content">
                                        <div className="stat-info">
                                            <p className="stat-label">Total Plays</p>
                                            <p className="stat-value">{songs.reduce((sum, song) => sum + (song.plays || 0), 0).toLocaleString()}</p>
                                        </div>
                                        <TrendingUp className="stat-icon" />
                                    </div>
                                </div>
                                <div className="stat-card purple-gradient">
                                    <div className="stat-content">
                                        <div className="stat-info">
                                            <p className="stat-label">Playlists</p>
                                            <p className="stat-value">{playlists.length}</p>
                                        </div>
                                        <BarChart3 className="stat-icon" />
                                    </div>
                                </div>
                            </div>
                            <div className="admin-panel">
                                <h3 className="panel-title">User Management</h3>
                                {usersLoading ? (
                                    <p>Loading users from server...</p>
                                ) : usersError ? (
                                    <div className="error-section">
                                        <p className="error-text">{usersError}</p>
                                        <button onClick={fetchUsers} className="retry-btn">Retry</button>
                                    </div>
                                ) : users.length === 0 ? (
                                    <p>No users found</p>
                                ) : (
                                    <div className="user-list">
                                        {users.map((user) => (
                                            <div key={user._id} className="user-item">
                                                <div className="user-left">
                                                    <div className="user-icon"><User className="user-icon-svg" /></div>
                                                    <div className="user-details">
                                                        <p className="user-item-name">{user.username}</p>
                                                        <p className="user-email">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="user-right">
                                                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                                                    <span className="join-date">{formatDate(user.joinDate)}</span>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => deleteUser(user._id || user.id)}
                                                        disabled={usersDeleting.has(user._id || user.id)}
                                                    >
                                                        {usersDeleting.has(user._id || user.id) ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                    <button className="user-menu"><MoreVertical className="menu-icon" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="admin-panel">
                                <h3 className="panel-title">Songs Management</h3>
                                {editingSong ? (
                                    <div className="edit-song-form">
                                        <h4 className="form-title">Edit Song</h4>
                                        <div className="form-grid">
                                            <input
                                                type="text"
                                                placeholder="Song Title"
                                                value={editingSong.title || ''}
                                                onChange={(e) => setEditingSong({ ...editingSong, title: e.target.value })}
                                                className="form-input"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Artist"
                                                value={editingSong.artist || ''}
                                                onChange={(e) => setEditingSong({ ...editingSong, artist: e.target.value })}
                                                className="form-input"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Album"
                                                value={editingSong.album || ''}
                                                onChange={(e) => setEditingSong({ ...editingSong, album: e.target.value })}
                                                className="form-input"
                                            />
                                            <select
                                                value={editingSong.genre || 'Music'}
                                                onChange={(e) => setEditingSong({ ...editingSong, genre: e.target.value })}
                                                className="form-select"
                                            >
                                                {AVAILABLE_GENRES.map(genre => (
                                                    <option key={genre} value={genre}>{genre}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-actions">
                                            <button onClick={saveEditSong} className="save-btn">Save Changes</button>
                                            <button onClick={() => setEditingSong(null)} className="cancel-btn">Cancel</button>
                                        </div>
                                    </div>
                                ) : null}
                                <div className="songs-list">
                                    {songs.map((song) => (
                                        <div key={song.id} className="admin-song-item">
                                            <Image
                                                src={song.cover || DEFAULT_COVER}
                                                alt={song.title || 'Song'}
                                                className="admin-song-cover"
                                                width={300}
                                                height={300}
                                                loading="lazy"
                                            />
                                            <div className="admin-song-info">
                                                <h4 className="admin-song-title">{song.title}</h4>
                                                <p className="admin-song-artist">{song.artist} • {song.album}</p>
                                                <p className="admin-song-genre">{song.genre} • {(song.plays || 0).toLocaleString()} plays</p>
                                            </div>
                                            <div className="admin-song-actions">
                                                <button onClick={() => startEditSong(song)} className="edit-btn">Edit</button>
                                                <button onClick={() => deleteSong(song.id)} className="delete-btn">Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="admin-panel">
                                <h3 className="panel-title">Artists Management</h3>
                                <div className="artists-grid">
                                    {artists.map((artist) => (
                                        <div key={artist.id} className="artist-card">
                                            <div className="artist-icon-circle"><User className="artist-icon" /></div>
                                            <h4 className="artist-name">{artist.name}</h4>
                                            <p className="artist-stats">{artist.songs} songs • {artist.albums} albums</p>
                                            <button onClick={() => deleteArtist(artist.name)} className="delete-artist-btn">Remove</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="admin-panel">
                                <h3 className="panel-title">Playlists Management</h3>
                                {editingPlaylist ? (
                                    <div className="edit-playlist-form">
                                        <h4 className="form-title">Edit Playlist</h4>
                                        <div className="form-grid">
                                            <input
                                                type="text"
                                                placeholder="Playlist Name"
                                                value={editingPlaylist.name}
                                                onChange={(e) => setEditingPlaylist({ ...editingPlaylist, name: e.target.value })}
                                                className="form-input"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Cover URL"
                                                value={editingPlaylist.cover || DEFAULT_COVER}
                                                onChange={(e) => setEditingPlaylist({ ...editingPlaylist, cover: e.target.value })}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button onClick={saveEditPlaylist} className="save-btn">Save Changes</button>
                                            <button onClick={() => setEditingPlaylist(null)} className="cancel-btn">Cancel</button>
                                        </div>
                                    </div>
                                ) : null}
                                <div className="playlists-grid">
                                    {playlists.map(playlist => (
                                        <div key={playlist.id || playlist._id} className="playlist-card">
                                            <div onClick={() => openPlaylist(playlist)}>
                                                <Image
                                                    src={playlist.cover || DEFAULT_COVER}
                                                    alt={playlist.name}
                                                    className="playlist-card-cover"
                                                    width={300}
                                                    height={300}
                                                    loading="lazy"
                                                />
                                                <div className="playlist-card-overlay">
                                                    <button
                                                        className="playlist-play-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            playAllSongs(playlist.songs);
                                                        }}
                                                    >
                                                        <Play className="play-icon" />
                                                    </button>
                                                </div>
                                                <h3 className="playlist-card-name">{playlist.name}</h3>
                                                <p className="playlist-card-count">{playlist.songs.length} songs</p>
                                            </div>
                                            <button
                                                className="share-playlist-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('Clicked share for playlist (admin):', playlist);
                                                    handleSharePlaylist(playlist);
                                                }}
                                                title="Share playlist"
                                            >
                                                <Share2 className="share-icon" /> Share
                                            </button>
                                            <div className="playlist-actions">
                                                <button
                                                    onClick={() => startEditPlaylist(playlist)}
                                                    className="edit-btn"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deletePlaylist(playlist.id || playlist._id)}
                                                    className="delete-btn"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            {showAddToPlaylist && (
                <div className="modal-overlay" onClick={() => setShowAddToPlaylist(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Add to Playlist</h3>
                        <p className="modal-subtitle">Select a playlist for {selectedSongForPlaylist?.title || 'Song'}</p>
                        <div className="modal-playlist-list">
                            {playlists.map(playlist => (
                                <button
                                    key={playlist._id || playlist.id}
                                    onClick={() => addSongToPlaylist(playlist._id || playlist.id)}
                                    className="modal-playlist-item"
                                >
                                    <Image
                                        src={playlist.cover || DEFAULT_COVER}
                                        alt={playlist.name}
                                        className="modal-playlist-cover"
                                        width={300}
                                        height={300}
                                        loading="lazy"
                                    />
                                    <span className="modal-playlist-name">{playlist.name}</span>
                                    <span className="modal-playlist-count">{playlist.songs.length} songs</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowAddToPlaylist(false)} className="modal-close-btn">Close</button>
                    </div>
                </div>
            )}
            {currentSong && (
                <div className="music-player">
                    <div className="player-content">
                        <div className="player-left">
                            <Image
                                src={currentSong.cover || DEFAULT_COVER}
                                alt={currentSong.title || 'Song'}
                                className="player-cover"
                                width={300}
                                height={300}
                                loading="lazy"
                            />
                            <div className="player-info">
                                <h4 className="player-title">{currentSong.title}</h4>
                                <p className="player-artist">{currentSong.artist}</p>
                            </div>
                        </div>
                        <div className="player-controls">
                            <button className={`control-btn ${shuffle ? 'active' : ''}`} onClick={toggleShuffle}>
                                <Shuffle className="control-icon" />
                            </button>
                            <button className="control-btn" onClick={playPrevious}>
                                <SkipBack className="control-icon" />
                            </button>
                            <button onClick={togglePlay} className="play-btn">
                                {isPlaying ? <Pause className="play-icon" /> : <Play className="play-icon" />}
                            </button>
                            <button className="control-btn" onClick={playNext}>
                                <SkipForward className="control-icon" />
                            </button>
                            <button className={`control-btn ${repeat !== 'off' ? 'active' : ''}`} onClick={toggleRepeat}>
                                <Repeat className="control-icon" />
                                {repeat === 'one' && <span className="repeat-indicator">1</span>}
                            </button>
                        </div>
                        <div className="player-right">
                            <Heart
                                className={`heart-btn ${likedSongs.has(currentSong.id) ? 'liked' : ''}`}
                                onClick={() => toggleLike(currentSong.id)}
                            />
                            <div className="volume-controls">
                                <Volume2 className="volume-icon" />
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="volume-slider"
                                    aria-label="Volume control"
                                />
                                <span className="volume-value">{volume}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="progress-section">
                        {error && <p className="player-error">{error}</p>}
                        {isLoadingSong && <p className="player-loading">Loading...</p>}
                        <div className="progress-time">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="progress-bar"
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>
            )}
            {showShareModal && sharePlaylist && (
                <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
                    <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Share Playlist</h3>
                        <p className="modal-subtitle">{sharePlaylist.name}</p>

                        {/* Copy Link Section */}
                        <div className="share-link-section">
                            <input
                                type="text"
                                value={shareUrl}
                                readOnly
                                className="share-link-input"
                            />
                            <button
                                onClick={() => copyToClipboard(shareUrl)}
                                className="copy-link-btn"
                            >
                                Copy Link
                            </button>
                        </div>

                        {/* Social Share Buttons */}
                        <div className="social-share-section">
                            <h4 className="share-section-title">Share on social media</h4>
                            <div className="social-share-buttons">
                                <button
                                    onClick={() => shareToSocial('whatsapp')}
                                    className="social-btn whatsapp"
                                    title="Share on WhatsApp"
                                >
                                    <svg viewBox="0 0 24 24" width="24" height="24">
                                        <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                    WhatsApp
                                </button>

                                <button
                                    onClick={() => shareToSocial('twitter')}
                                    className="social-btn twitter"
                                    title="Share on Twitter"
                                >
                                    <svg viewBox="0 0 24 24" width="24" height="24">
                                        <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                    Twitter
                                </button>

                                <button
                                    onClick={() => shareToSocial('facebook')}
                                    className="social-btn facebook"
                                    title="Share on Facebook"
                                >
                                    <svg viewBox="0 0 24 24" width="24" height="24">
                                        <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                    Facebook
                                </button>

                                <button
                                    onClick={() => shareToSocial('telegram')}
                                    className="social-btn telegram"
                                    title="Share on Telegram"
                                >
                                    <svg viewBox="0 0 24 24" width="24" height="24">
                                        <path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                    </svg>
                                    Telegram
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="modal-close-btn"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            {
                showQuizPopup && quizSong && (
                    <QuizPopup
                        song={quizSong}
                        onClose={() => setShowQuizPopup(false)}
                        onStartQuiz={() => {
                            setShowQuizPopup(false);
                            setShowQuiz(true);
                        }}
                    />
                )}

            {showQuiz && quizSong && (
                <SongQuiz
                    song={quizSong}
                    onClose={() => {
                        setShowQuiz(false);
                        setQuizSong(null);
                    }}
                />
            )}
            {showLyrics && currentSong && (
                <LyricsDisplay
                    song={currentSong}
                    onClose={() => setShowLyrics(false)}
                />
            )}


            {showOfflineManager && (
                <OfflineManager
                    onClose={() => setShowOfflineManager(false)}
                    onPlayOffline={(song) => {
                        setCurrentSong(song);
                        setShowOfflineManager(false);
                        setIsPlaying(true);
                    }}
                />
            )}

        </div>
    );
}

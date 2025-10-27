'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import QuizComponent from '../../components/QuizComponent';

export default function QuizPage() {
               const searchParams = useSearchParams();
               // Get songQuiz param as JSON string from query params
               const songQuizParam = searchParams.get('songQuiz');
               const songQuiz = songQuizParam ? JSON.parse(songQuizParam) : null;

               return (
                              <QuizComponent questionsFromSong={songQuiz} />
               );
}

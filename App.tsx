import { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Sparkles, 
  Trophy, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  BookOpen, 
  ChevronRight
} from 'lucide-react';
import { QUESTIONS, Question, Option } from './questions';
import { sounds } from './audio';

type LetterStatus = 'pending' | 'correct' | 'incorrect' | 'passed';

export default function App() {
  // Game state
  const [questions, setQuestions] = useState<Question[]>(QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [letterStatuses, setLetterStatuses] = useState<Record<number, LetterStatus>>({});
  const [selectedOptionId, setSelectedOptionId] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  
  // Interactive translation states (User requested: click question to reveal Armenian, click options to reveal Armenian)
  const [showQuestionTranslation, setShowQuestionTranslation] = useState<boolean>(false);
  const [revealedOptionTranslations, setRevealedOptionTranslations] = useState<Record<string, boolean>>({});
  const [alwaysShowAllTranslations, setAlwaysShowAllTranslations] = useState<boolean>(false);

  // Resolution / feedback state
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [lastSubmissionResult, setLastSubmissionResult] = useState<{ isCorrect: boolean; questionId: number } | null>(null);

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Game completion
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [resultsFilter, setResultsFilter] = useState<'all' | 'errors' | 'correct'>('all');

  // Rosco circular loop track
  const [vueltasCount, setVueltasCount] = useState<number>(1);

  const currentQuestion = questions[currentIndex];

  // Initialize sound settings
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // Reset translations when changing question
  useEffect(() => {
    setShowQuestionTranslation(false);
    setRevealedOptionTranslations({});
    setSelectedOptionId(null);
    setHasSubmitted(false);
    setLastSubmissionResult(null);
  }, [currentIndex]);

  // Statistics calculation
  const stats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let pending = 0;

    questions.forEach((q) => {
      const st = letterStatuses[q.id];
      if (st === 'correct') correct++;
      else if (st === 'incorrect') incorrect++;
      else pending++;
    });

    return { correct, incorrect, pending, total: questions.length };
  }, [questions, letterStatuses]);

  // Check if all answered
  useEffect(() => {
    if (stats.pending === 0 && !isGameOver && Object.keys(letterStatuses).length > 0) {
      setIsGameOver(true);
      sounds.playVictory();
    }
  }, [stats.pending, isGameOver, letterStatuses]);

  // Find next pending question in Rosco ring
  const moveToNextPending = (fromIndex: number) => {
    const total = questions.length;
    let nextIdx = (fromIndex + 1) % total;
    let loops = 0;

    // Detect new vuelta when wrapping around to index 0
    if (nextIdx <= fromIndex) {
      setVueltasCount((v) => v + 1);
    }

    while (loops < total) {
      const q = questions[nextIdx];
      const status = letterStatuses[q.id];
      if (status !== 'correct' && status !== 'incorrect') {
        setCurrentIndex(nextIdx);
        return;
      }
      nextIdx = (nextIdx + 1) % total;
      loops++;
    }

    // If none left, end game
    setIsGameOver(true);
    sounds.playVictory();
  };

  // PASAPALABRA action: Pass turn to next letter, keep it pending
  const handlePasapalabra = () => {
    sounds.playPasapalabra();
    setLetterStatuses((prev) => ({
      ...prev,
      [currentQuestion.id]: 'passed',
    }));
    moveToNextPending(currentIndex);
  };

  // Submit Answer action
  const handleAnswerSubmit = (optionId: 'A' | 'B' | 'C' | 'D') => {
    if (hasSubmitted) return;

    const isCorrect = optionId === currentQuestion.correctOption;
    setHasSubmitted(true);
    setLastSubmissionResult({ isCorrect, questionId: currentQuestion.id });

    if (isCorrect) {
      sounds.playCorrect();
      setLetterStatuses((prev) => ({
        ...prev,
        [currentQuestion.id]: 'correct',
      }));
    } else {
      sounds.playError();
      setLetterStatuses((prev) => ({
        ...prev,
        [currentQuestion.id]: 'incorrect',
      }));
    }
  };

  // Move to next after reviewing explanation
  const handleNextAfterExplanation = () => {
    moveToNextPending(currentIndex);
  };

  // Reset entire game
  const handleRestart = () => {
    setLetterStatuses({});
    setCurrentIndex(0);
    setIsGameOver(false);
    setVueltasCount(1);
    setSelectedOptionId(null);
    setHasSubmitted(false);
    setLastSubmissionResult(null);
  };

  // Toggle translation for a specific option
  const toggleOptionTranslation = (optId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedOptionTranslations((prev) => ({
      ...prev,
      [optId]: !prev[optId],
    }));
  };

  return (
    <div className="min-h-screen bg-[#040e29] text-white flex flex-col selection:bg-amber-400 selection:text-slate-900 relative overflow-hidden">
      {/* Dynamic TV Studio Background Lighting & Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top radial spotlight */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-blue-500/25 via-indigo-600/15 to-transparent rounded-full blur-3xl studio-ambient" />
        {/* Rosco central aura */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        {/* Bottom subtle gradient */}
        <div className="absolute -bottom-24 left-0 right-0 h-64 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 border-b border-blue-900/60 bg-[#03091e]/80 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-400/30 text-slate-950 font-black text-xl tracking-tighter">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-1.5">
                  PASAPALABRA <span className="text-amber-400 font-extrabold text-sm sm:text-base tracking-normal">🇪🇸 ↔ 🇦🇲</span>
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-900/80 text-blue-200 border border-blue-700/50">
                  {vueltasCount}ª Vuelta
                </span>
              </div>
              <p className="text-xs text-blue-300/80 font-medium">
                Pretérito Perfecto · Indefinido · Imperfecto · Pluscuamperfecto (27 Նոր իրավիճակ)
              </p>
            </div>
          </div>

          {/* Controls & Badges */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Global translation switch */}
            <button
              id="btn-toggle-all-translations"
              onClick={() => setAlwaysShowAllTranslations(!alwaysShowAllTranslations)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                alwaysShowAllTranslations
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                  : 'bg-blue-950/70 text-blue-200 border-blue-800/80 hover:bg-blue-900/60'
              }`}
              title="Ցույց տալ բոլոր հայերեն թարգմանությունները"
            >
              {alwaysShowAllTranslations ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">
                {alwaysShowAllTranslations ? 'Թաքցնել թարգմանությունները' : 'Միշտ ցույց տալ թարգմանությունը'}
              </span>
              <span className="md:hidden">🇦🇲 Թարգմանություն</span>
            </button>

            {/* Sound toggle */}
            <button
              id="btn-toggle-sound"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-blue-950/70 border border-blue-800/80 text-blue-300 hover:text-white hover:bg-blue-900/60 transition-all"
              title={soundEnabled ? 'Ձայնն անջատել / Silenciar' : 'Ձայնը միացնել / Activar sonido'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Restart button */}
            <button
              id="btn-restart-game"
              onClick={handleRestart}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-950/70 border border-blue-800/80 text-blue-200 hover:bg-blue-900/60 transition-all"
              title="Սկսել նորից / Reiniciar el Rosco"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Նոր խաղ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Top TV Scoreboard Panel (Clean 3-column score counters) */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 pt-3 pb-1">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto">
          {/* Correct Count (Green Circle Badge) */}
          <div className="bg-gradient-to-b from-emerald-500 to-green-700 rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-center shadow-lg shadow-emerald-600/30 border border-emerald-400/60 text-white">
            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-emerald-100 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ճիշտ (Aciertos)
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-none mt-0.5">
              {stats.correct}
            </span>
          </div>

          {/* Incorrect Count (Red Circle Badge) */}
          <div className="bg-gradient-to-b from-rose-500 to-red-700 rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-center shadow-lg shadow-rose-600/30 border border-rose-400/60 text-white">
            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-rose-100 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              Սխալ (Fallos)
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-none mt-0.5">
              {stats.incorrect}
            </span>
          </div>

          {/* Remaining Count (Blue Badge) */}
          <div className="bg-gradient-to-b from-blue-600 to-indigo-800 rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-center shadow-lg shadow-blue-700/30 border border-blue-400/50 text-white">
            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-wider text-blue-100 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Մնացել է
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-none mt-0.5">
              {stats.pending}
            </span>
          </div>
        </div>
      </div>

      {/* Main Game Screen */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10">
        {!isGameOver ? (
          <>
            {/* The Iconic Pasapalabra Circular Wheel (El Rosco) */}
            <div className="w-full max-w-[340px] sm:max-w-[420px] md:max-w-[460px] lg:max-w-[500px] aspect-square relative flex items-center justify-center shrink-0 my-2 lg:my-0">
              {/* Outer circular tracks matching TV studio */}
              <div className="absolute inset-[8%] rounded-full border border-blue-500/15 shadow-[0_0_40px_rgba(37,99,235,0.15)] pointer-events-none" />
              <div className="absolute inset-[11%] rounded-full border border-blue-400/25 pointer-events-none" />
              <div className="absolute inset-[14%] rounded-full border border-blue-500/10 pointer-events-none" />

              {/* Center Rosco Badge / Status */}
              <div className="absolute inset-[26%] rounded-full bg-gradient-to-b from-[#0b1b46] to-[#050e29] border border-blue-500/30 flex flex-col items-center justify-center text-center p-3 sm:p-4 shadow-inner pointer-events-none z-10">
                <span className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-300 font-bold">
                  {currentQuestion.tenseCategory}
                </span>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-wider my-0.5">
                  {currentQuestion.letter}
                </div>
                <span className="text-[10px] sm:text-xs text-blue-200/90 font-medium px-2 py-0.5 rounded-full bg-blue-900/60 border border-blue-700/50">
                  {currentIndex + 1} / {questions.length}
                </span>
              </div>

              {/* 27 Letters arranged precisely in a circle */}
              {questions.map((q, idx) => {
                const total = questions.length;
                // Symmetrical placement: apex (top) is centered between Z and A, just like TV show
                const angle = ((idx + 0.5) / total) * 2 * Math.PI - Math.PI / 2;
                // Calibrated radius percentage from center to keep all letters strictly within frame
                const radiusPct = 39; 
                const x = 50 + radiusPct * Math.cos(angle);
                const y = 50 + radiusPct * Math.sin(angle);

                const isCurrent = idx === currentIndex;
                const status = letterStatuses[q.id];

                // Determine orb appearance
                let orbClasses = 'bg-gradient-to-br from-blue-600 to-indigo-900 border-blue-400/60 text-white shadow-md shadow-blue-950';
                if (isCurrent) {
                  orbClasses = 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 font-black ring-4 ring-yellow-300 rosco-active-orb z-20';
                } else if (status === 'correct') {
                  orbClasses = 'bg-gradient-to-br from-emerald-500 to-green-700 border-emerald-300/80 text-white shadow-emerald-500/40';
                } else if (status === 'incorrect') {
                  orbClasses = 'bg-gradient-to-br from-rose-500 to-red-700 border-rose-300/80 text-white shadow-rose-500/40';
                } else if (status === 'passed') {
                  orbClasses = 'bg-gradient-to-br from-amber-600/90 to-yellow-800/90 border-amber-400/60 text-amber-100 shadow-amber-900/40';
                }

                return (
                  <div
                    key={q.id}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center pointer-events-auto"
                  >
                    <button
                      id={`rosco-letter-${q.letter}`}
                      onClick={() => {
                        sounds.playTick();
                        setCurrentIndex(idx);
                      }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-black text-xs sm:text-sm md:text-base border transition-all duration-300 hover:scale-115 focus:outline-none cursor-pointer ${orbClasses}`}
                      title={`Տառ ${q.letter} · ${q.tenseCategory}`}
                    >
                      {q.letter}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Interactive Question & Choices Card */}
            <div className="w-full max-w-2xl flex flex-col gap-4">
              {/* Question / Situation Box */}
              <div 
                id="question-situation-card"
                onClick={() => setShowQuestionTranslation(!showQuestionTranslation)}
                className="bg-gradient-to-b from-[#0e1d4a] to-[#09153a] border-2 border-blue-500/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden cursor-pointer hover:border-amber-400/60 transition-all duration-200 group"
              >
                {/* Header tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                      {currentQuestion.letter}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300/90 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-500/30">
                      {currentQuestion.tenseCategory}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-300 group-hover:text-amber-300 transition-colors">
                    <span>{showQuestionTranslation || alwaysShowAllTranslations ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</span>
                    <span className="font-semibold underline decoration-dotted">
                      {showQuestionTranslation || alwaysShowAllTranslations ? 'Թաքցնել հայերենը' : 'Սեղմեք հայերեն թարգմանության համար'}
                    </span>
                  </div>
                </div>

                {/* Spanish Situation Text */}
                <div className="text-base sm:text-lg font-semibold text-white leading-relaxed flex items-start gap-2.5">
                  <span className="text-xl select-none">🇪🇸</span>
                  <div>{currentQuestion.situationEs}</div>
                </div>

                {/* Armenian Translation Box (Opened on click or if alwaysShowAllTranslations is on) */}
                {(showQuestionTranslation || alwaysShowAllTranslations) && (
                  <div className="mt-3.5 pt-3.5 border-t border-blue-800/60 text-sm sm:text-base text-amber-200/95 font-medium leading-relaxed flex items-start gap-2.5 bg-blue-950/40 p-3 rounded-xl border border-amber-400/20">
                    <span className="text-xl select-none">🇦🇲</span>
                    <div>
                      <span className="text-xs uppercase font-bold text-amber-400/90 block mb-0.5">Հայերեն թարգմանություն՝</span>
                      {currentQuestion.situationAm}
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions banner */}
              <div className="text-xs text-blue-300/80 px-1 flex items-center justify-between">
                <span>Կարդա իրավիճակը և ընտրիր ամենահարմար պատասխանը։</span>
                <span className="text-[11px] text-amber-300/90">💡 Կտտացրեք տարբերակի վրա՝ թարգմանությունը տեսնելու համար</span>
              </div>

              {/* Options List (A, B, C, D) */}
              <div className="grid grid-cols-1 gap-2.5">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  const isOptTranslationShown = alwaysShowAllTranslations || revealedOptionTranslations[opt.id];
                  const isCorrectAnswer = opt.id === currentQuestion.correctOption;

                  let borderAndBg = 'bg-[#0a173d]/90 hover:bg-[#0f2154] border-blue-700/50 text-white';
                  if (isSelected && !hasSubmitted) {
                    borderAndBg = 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 text-amber-100';
                  } else if (hasSubmitted) {
                    if (isCorrectAnswer) {
                      borderAndBg = 'bg-emerald-900/40 border-emerald-400 ring-2 ring-emerald-400 text-emerald-100';
                    } else if (isSelected && !isCorrectAnswer) {
                      borderAndBg = 'bg-rose-900/40 border-rose-400 ring-2 ring-rose-400 text-rose-100';
                    } else {
                      borderAndBg = 'opacity-50 bg-[#07112c] border-blue-900/40 text-slate-400';
                    }
                  }

                  return (
                    <div
                      key={opt.id}
                      id={`option-card-${opt.id}`}
                      onClick={() => {
                        if (!hasSubmitted) {
                          setSelectedOptionId(opt.id);
                          sounds.playTick();
                        }
                      }}
                      className={`rounded-xl border p-3.5 sm:p-4 transition-all duration-200 cursor-pointer shadow-md ${borderAndBg}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Option Badge A, B, C, D */}
                          <span
                            className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-black text-sm border transition-colors ${
                              isSelected
                                ? 'bg-amber-400 text-slate-950 border-amber-300'
                                : 'bg-blue-900/70 text-blue-200 border-blue-700/60'
                            }`}
                          >
                            {opt.id}
                          </span>

                          {/* Spanish Text */}
                          <div className="flex-1">
                            <div className="text-sm sm:text-base font-semibold leading-snug">
                              {opt.textEs}
                            </div>

                            {/* Armenian translation for option */}
                            {isOptTranslationShown && (
                              <div className="mt-2 text-xs sm:text-sm text-amber-200/90 font-medium bg-blue-950/60 p-2 rounded-lg border border-amber-400/20 flex items-start gap-1.5">
                                <span className="text-xs">🇦🇲</span>
                                <span>{opt.textAm}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive Click-to-Translate button on each choice */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            id={`btn-translate-option-${opt.id}`}
                            onClick={(e) => toggleOptionTranslation(opt.id, e)}
                            className="px-2 py-1 rounded text-[11px] font-semibold bg-blue-900/50 hover:bg-blue-800 text-blue-200 hover:text-white border border-blue-700/50 flex items-center gap-1 transition-all"
                            title="Կտտացրեք հայերեն թարգմանության համար"
                          >
                            <span>🇦🇲</span>
                            <span className="hidden sm:inline">
                              {isOptTranslationShown ? 'Թաքցնել' : 'Թարգմանել'}
                            </span>
                          </button>

                          {/* Selection indicator radio / check */}
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-amber-400 border-amber-300 text-slate-950' : 'border-blue-600/60 bg-blue-950/40'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons: PASAPALABRA vs SUBMIT */}
              {!hasSubmitted ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Big Iconic PASAPALABRA Button */}
                  <button
                    id="btn-pasapalabra"
                    onClick={handlePasapalabra}
                    className="py-3 px-5 rounded-xl font-black text-sm sm:text-base uppercase tracking-wider bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-300 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span>PASAPALABRA</span>
                    <span className="text-xs font-bold text-slate-800 opacity-80">(Բաց թողնել)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Submit / Confirm Button */}
                  <button
                    id="btn-submit-answer"
                    disabled={!selectedOptionId}
                    onClick={() => {
                      if (selectedOptionId) handleAnswerSubmit(selectedOptionId);
                    }}
                    className={`py-3 px-5 rounded-xl font-bold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 border transition-all ${
                      selectedOptionId
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-400 shadow-lg shadow-blue-600/30 cursor-pointer active:scale-[0.98]'
                        : 'bg-blue-950/50 text-blue-400/40 border-blue-900/40 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Պատասխանել (Responder)</span>
                  </button>
                </div>
              ) : (
                /* Immediate Post-Answer Feedback & Grammar Explanation */
                <div className="bg-[#0b1b46] border-2 border-blue-500/60 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {lastSubmissionResult?.isCorrect ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-base sm:text-lg">
                          <CheckCircle2 className="w-5 h-5" />
                          ¡CORRECTO! · ՃԻՇՏ Է
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-rose-400 font-extrabold text-base sm:text-lg">
                          <XCircle className="w-5 h-5" />
                          ¡FALLO! · ՍԽԱԼ Է
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-blue-200 font-semibold px-2.5 py-1 rounded-full bg-blue-900/80 border border-blue-700/60">
                      Ճիշտ պատասխան՝ {currentQuestion.correctOption}
                    </span>
                  </div>

                  {/* Grammar Explanations in Spanish and Armenian */}
                  <div className="bg-blue-950/80 rounded-xl p-3.5 border border-blue-800/80 flex flex-col gap-2">
                    <div className="text-xs sm:text-sm text-blue-100 flex items-start gap-2">
                      <span className="text-base select-none">🇪🇸</span>
                      <span>{currentQuestion.explanationEs}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-amber-200/90 flex items-start gap-2 pt-1 border-t border-blue-900/60">
                      <span className="text-base select-none">🇦🇲</span>
                      <span>{currentQuestion.explanationAm}</span>
                    </div>
                  </div>

                  {/* Next Question Button */}
                  <button
                    id="btn-continue-next-letter"
                    onClick={handleNextAfterExplanation}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span>Հաջորդ տառը (Siguiente)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Final Results & Review Screen */
          <div className="w-full max-w-4xl bg-gradient-to-b from-[#0d1e4c] to-[#07112c] rounded-3xl border-2 border-blue-500/50 p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
            {/* Header / Trophy */}
            <div className="text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-400/30 mb-3">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                {stats.pending === 0 ? '¡ROSCÓN COMPLETADO!' : '¡JUEGO TERMINADO!'}
              </h2>
              <p className="text-blue-200 text-sm mt-1">
                Արդյունքներ՝ 27 իրավիճակների ամփոփում (Pretérito Perfecto, Indefinido, Imperfecto, Pluscuamperfecto)
              </p>
            </div>

            {/* Score Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto w-full">
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 text-center">
                <span className="text-xs uppercase text-emerald-300 font-bold block">Ճիշտ (Aciertos)</span>
                <span className="text-3xl font-black text-emerald-400">{stats.correct}</span>
              </div>
              <div className="bg-rose-950/60 border border-rose-500/40 rounded-2xl p-4 text-center">
                <span className="text-xs uppercase text-rose-300 font-bold block">Սխալ (Fallos)</span>
                <span className="text-3xl font-black text-rose-400">{stats.incorrect}</span>
              </div>
              <div className="bg-blue-950/60 border border-blue-500/40 rounded-2xl p-4 text-center">
                <span className="text-xs uppercase text-blue-300 font-bold block">Չպատասխանված</span>
                <span className="text-3xl font-black text-blue-400">{stats.pending}</span>
              </div>
              <div className="bg-amber-950/60 border border-amber-500/40 rounded-2xl p-4 text-center">
                <span className="text-xs uppercase text-amber-300 font-bold block">Ճշգրտություն</span>
                <span className="text-3xl font-black text-amber-400">
                  {stats.total - stats.pending > 0
                    ? Math.round((stats.correct / (stats.total - stats.pending)) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center justify-center gap-2 border-b border-blue-800/60 pb-3">
              <button
                onClick={() => setResultsFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  resultsFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-blue-950/60 text-blue-300 hover:bg-blue-900/60'
                }`}
              >
                Բոլոր 27 հարցերը ({questions.length})
              </button>
              <button
                onClick={() => setResultsFilter('errors')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  resultsFilter === 'errors'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-blue-950/60 text-rose-300 hover:bg-blue-900/60'
                }`}
              >
                Սխալները ({stats.incorrect})
              </button>
              <button
                onClick={() => setResultsFilter('correct')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  resultsFilter === 'correct'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-blue-950/60 text-emerald-300 hover:bg-blue-900/60'
                }`}
              >
                Ճիշտ պատասխանները ({stats.correct})
              </button>
            </div>

            {/* List of reviewed questions with full Spanish & Armenian text */}
            <div className="max-h-96 overflow-y-auto pr-1 flex flex-col gap-3">
              {questions
                .filter((q) => {
                  const st = letterStatuses[q.id];
                  if (resultsFilter === 'errors') return st === 'incorrect';
                  if (resultsFilter === 'correct') return st === 'correct';
                  return true;
                })
                .map((q) => {
                  const status = letterStatuses[q.id];
                  const correctOpt = q.options.find((o) => o.id === q.correctOption);

                  return (
                    <div
                      key={q.id}
                      className="bg-blue-950/40 rounded-xl p-4 border border-blue-800/60 flex flex-col gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              status === 'correct'
                                ? 'bg-emerald-600 text-white'
                                : status === 'incorrect'
                                ? 'bg-rose-600 text-white'
                                : 'bg-blue-800 text-blue-200'
                            }`}
                          >
                            {q.letter}
                          </span>
                          <span className="text-xs font-semibold text-blue-200">
                            {q.tenseCategory}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            status === 'correct'
                              ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-600/40'
                              : status === 'incorrect'
                              ? 'text-rose-300 bg-rose-950/80 border border-rose-600/40'
                              : 'text-blue-300 bg-blue-950 border border-blue-700/40'
                          }`}
                        >
                          {status === 'correct' ? 'ՃԻՇՏ' : status === 'incorrect' ? 'ՍԽԱԼ' : 'ՉԻ ՊԱՏԱՍԽԱՆՎԵԼ'}
                        </span>
                      </div>

                      {/* Question situation */}
                      <div className="text-sm font-semibold text-white">
                        🇪🇸 {q.situationEs}
                      </div>
                      <div className="text-xs text-amber-200/90 font-medium">
                        🇦🇲 {q.situationAm}
                      </div>

                      {/* Correct answer */}
                      <div className="bg-blue-900/40 rounded-lg p-2.5 border border-blue-700/40 flex flex-col gap-1 text-xs">
                        <span className="font-bold text-emerald-300">
                          Ճիշտ պատասխան՝ ({correctOpt?.id}) {correctOpt?.textEs}
                        </span>
                        <span className="text-amber-200/80">
                          🇦🇲 {correctOpt?.textAm}
                        </span>
                      </div>

                      {/* Explanation */}
                      <div className="text-xs text-blue-300/90 bg-blue-950/60 p-2 rounded-lg border border-blue-800/40">
                        <span className="text-blue-200 font-bold block mb-0.5">Բացատրություն՝</span>
                        <div>{q.explanationAm}</div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                id="btn-play-again"
                onClick={handleRestart}
                className="py-3 px-6 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-300 flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Խաղալ նորից (Jugar de nuevo)</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 border-t border-blue-900/40 py-2.5 px-4 text-center text-xs text-blue-300/60">
        El Rosco · Pasapalabra Español (Իսպաներենի անցյալ ժամանակներ) · Հայերեն թարգմանությամբ
      </footer>
    </div>
  );
}

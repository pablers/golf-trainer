import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { CLUB_TEMPO_CONFIGS, INITIAL_HOLE_SCORES } from './constants';
import type { ClubTempoConfig, ScorecardSessionSetup, GolfCourse, RoundType, WeatherCondition, WindCondition, Scorecard as ScorecardType } from './types';
import { useMetronome } from './hooks/useMetronome';
import { generateWavBlob } from './services/audioService';
import ClubSelector from './components/ClubSelector';
import TempoSlider from './components/TempoSlider';
import Controls from './components/Controls';
import { GolfBallIcon } from './components/icons';
import Navigation from './components/Navigation';
import Scorecard from './components/Scorecard';
import ScorecardSetup from './components/ScorecardSetup';
import ConditionsSetup from './components/ConditionsSetup';

type View = 'metronome' | 'scorecard';
type ScorecardStep = 'setup' | 'conditions' | 'playing';

// Hardcoded user ID for now. In a real app, this would come from an auth system.
const FAKE_USER_ID = 'clxsm5n8g000008l3g6g2h3f2'; // This should match a user in your seed data

const MetronomeView: React.FC = () => {
    const [selectedClubId, setSelectedClubId] = useState<string>(CLUB_TEMPO_CONFIGS[2].id); // Default to Mid Iron
  
    const selectedClubConfig = useMemo(
      () => CLUB_TEMPO_CONFIGS.find(club => club.id === selectedClubId)!,
      [selectedClubId]
    );
  
    const [bpm, setBpm] = useState<number>(selectedClubConfig.default);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
  
    useMetronome(bpm, isPlaying);
    
    const handleClubChange = useCallback((clubId: string) => {
      const newClubConfig = CLUB_TEMPO_CONFIGS.find(club => club.id === clubId)!;
      setSelectedClubId(clubId);
      setBpm(newClubConfig.default);
      if (isPlaying) {
        setIsPlaying(false);
      }
    }, [isPlaying]);
  
    const handleBpmChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      setBpm(Number(event.target.value));
    }, []);
  
    const handlePlayPause = useCallback(() => {
      setIsPlaying(prev => !prev);
    }, []);
  
    const handleDownload = useCallback(async () => {
      setIsDownloading(true);
      try {
        const blob = await generateWavBlob(bpm, 15);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `golf_metronome_${selectedClubConfig.name.replace(/\s/g, '_')}_${bpm}bpm.wav`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } catch (error) {
        console.error("Failed to generate or download audio file:", error);
        alert("No se pudo generar el archivo de audio. Por favor, intente de nuevo.");
      } finally {
        setIsDownloading(false);
      }
    }, [bpm, selectedClubConfig.name]);

    return (
        <div className="w-full flex-grow flex flex-col justify-center">
            <header className="p-6 border-b border-gray-700/50 text-center">
                <div className="flex justify-center items-center gap-3 mb-2">
                    <GolfBallIcon className="w-8 h-8 text-green-400" />
                    <h1 className="text-3xl font-bold tracking-tight text-white">Golf Master Trainer</h1>
                </div>
              <p className="text-gray-400 mt-2">Seleccione un palo y ajuste el tempo de su swing.</p>
            </header>

            <main className="p-6 md:p-8 space-y-8">
              <ClubSelector
                clubs={CLUB_TEMPO_CONFIGS}
                selectedClubId={selectedClubId}
                onSelectClub={handleClubChange}
              />
    
              <div className="text-center space-y-4">
                <div className="text-7xl lg:text-8xl font-bold text-green-400 tracking-tighter tabular-nums">
                  {bpm}
                </div>
                <TempoSlider
                  min={selectedClubConfig.range.min}
                  max={selectedClubConfig.range.max}
                  value={bpm}
                  optimalStart={selectedClubConfig.optimalRange.start}
                  optimalEnd={selectedClubConfig.optimalRange.end}
                  onChange={handleBpmChange}
                />
              </div>
              
              <div>
                <Controls
                  isPlaying={isPlaying}
                  isDownloading={isDownloading}
                  onPlayPause={handlePlayPause}
                  onDownload={handleDownload}
                />
              </div>
            </main>
        </div>
    );
}

export default function App(): React.ReactNode {
  const [activeView, setActiveView] = useState<View>('metronome');
  const [scorecardStep, setScorecardStep] = useState<ScorecardStep>('setup');
  const [sessionSetup, setSessionSetup] = useState<Partial<ScorecardSessionSetup>>({});
  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [currentScorecard, setCurrentScorecard] = useState<ScorecardType | null>(null);

  // Fetch golf courses when the app loads
  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('http://localhost:3001/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error(error);
        // In a real app, you'd want to show an error to the user
      }
    }
    fetchCourses();
  }, []);

  const handleViewChange = (view: View) => {
    if (view !== 'scorecard' && activeView === 'scorecard') {
      setScorecardStep('setup');
      setSessionSetup({});
      setCurrentScorecard(null);
    }
    setActiveView(view);
  };

  const handleSetupContinue = (course: GolfCourse, roundType: RoundType) => {
    setSessionSetup({ course, roundType });
    setScorecardStep('conditions');
  };

  const handleConditionsStart = async (weather: WeatherCondition, wind: WindCondition) => {
    const finalSetup = { ...sessionSetup, weather, wind };
    setSessionSetup(finalSetup);

    // Create the payload for the new scorecard
    const newScorecardPayload = {
      userId: FAKE_USER_ID,
      golfCourseId: finalSetup.course!.id,
      roundType: finalSetup.roundType,
      weather: finalSetup.weather,
      wind: finalSetup.wind,
      holeScores: INITIAL_HOLE_SCORES.map(hole => ({ ...hole, strokes: 0, putts: 0, comment: '' })), // Initialize with some defaults
    };

    try {
      const response = await fetch('http://localhost:3001/api/scorecards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newScorecardPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to create scorecard');
      }

      const createdScorecard = await response.json();
      setCurrentScorecard(createdScorecard);
      setScorecardStep('playing');

    } catch (error) {
      console.error(error);
      // Show an error message to the user
    }
  };

  const handleConditionsBack = () => {
    setScorecardStep('setup');
  };

  const renderScorecardView = () => {
    switch (scorecardStep) {
      case 'setup':
        // Pass the fetched courses to the ScorecardSetup component
        return <ScorecardSetup onContinue={handleSetupContinue} courses={courses} />;
      case 'conditions':
        return <ConditionsSetup onStart={handleConditionsStart} onBack={handleConditionsBack} />;
      case 'playing':
        // The Scorecard component now receives the full scorecard object
        if (currentScorecard) {
          return <Scorecard scorecard={currentScorecard} />;
        }
        // Fallback to setup if scorecard data is missing
        setScorecardStep('setup');
        return <ScorecardSetup onContinue={handleSetupContinue} courses={courses} />;
      default:
        setScorecardStep('setup');
        return <ScorecardSetup onContinue={handleSetupContinue} courses={courses} />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white flex flex-col items-center justify-center p-0 sm:p-4 font-sans">
      <div className="w-full max-w-md h-screen sm:h-[90vh] sm:max-h-[700px] mx-auto bg-gray-800/50 rounded-none sm:rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700/50 overflow-hidden flex flex-col">
        {activeView === 'metronome' && <MetronomeView />}
        {activeView === 'scorecard' && renderScorecardView()}
        
        <Navigation activeView={activeView} onViewChange={handleViewChange} />
      </div>
      <footer className="hidden sm:block text-center mt-8 text-gray-500 text-sm">
        <p>Generado por un experto en React y Gemini.</p>
      </footer>
    </div>
  );
}
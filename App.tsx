import React, { useState, useCallback, useMemo } from 'react';
import { CLUB_TEMPO_CONFIGS, GOLF_COURSES, INITIAL_HOLE_SCORES } from './constants';
import type { ClubTempoConfig, ScorecardSessionSetup, GolfCourse, RoundType, WeatherCondition, WindCondition } from './types';
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
const SESSION_STORAGE_KEY = 'golf-session-data';

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

  const handleViewChange = (view: View) => {
    if (view !== 'scorecard' && activeView === 'scorecard') {
      // Optionally reset the flow when navigating away from the scorecard section
      setScorecardStep('setup');
      setSessionSetup({});
    }
    setActiveView(view);
  };

  const handleSetupContinue = (course: GolfCourse, roundType: RoundType) => {
    setSessionSetup({ course, roundType });
    setScorecardStep('conditions');
  };

  const handleConditionsStart = (weather: WeatherCondition, wind: WindCondition) => {
    // Starting a new round, clear previous saved data to ensure a fresh card
    localStorage.removeItem(SESSION_STORAGE_KEY);
    
    setSessionSetup(prev => ({ ...prev, weather, wind }));
    setScorecardStep('playing');
  };

  const handleConditionsBack = () => {
    setScorecardStep('setup');
  };

  const renderScorecardView = () => {
    switch (scorecardStep) {
      case 'setup':
        return <ScorecardSetup onContinue={handleSetupContinue} />;
      case 'conditions':
        return <ConditionsSetup onStart={handleConditionsStart} onBack={handleConditionsBack} />;
      case 'playing':
        if (sessionSetup.course && sessionSetup.roundType) {
          return <Scorecard setup={sessionSetup as ScorecardSessionSetup} />;
        }
        // Fallback to setup if session data is missing for some reason
        setScorecardStep('setup');
        return <ScorecardSetup onContinue={handleSetupContinue} />;
      default:
        setScorecardStep('setup');
        return <ScorecardSetup onContinue={handleSetupContinue} />;
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
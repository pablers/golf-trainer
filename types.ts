
export interface ClubTempoConfig {
  id: string;
  name: string;
  range: {
    min: number;
    max: number;
  };
  optimalRange: {
    start: number;
    end: number;
  };
  default: number;
}

export interface TempoOption {
  bpm: number;
  label: string;
  description: string;
}

export interface HoleScore {
  hole: number;
  par: number;
  strokeIndex: number;
  strokes: number | null;
  putts: number | null;
  comment: string | null;
}

export interface PostRoundAnswers {
  weather_h7_confirm?: 'yes' | 'no';
  weather_h7_new?: 'sunny' | 'cloudy' | 'rainy';
  wind_h7_change?: 'same' | 'higher' | 'lower';

  weather_h15_confirm?: 'yes' | 'no';
  weather_h15_new?: 'sunny' | 'cloudy' | 'rainy';
  wind_h15_change?: 'same' | 'higher' | 'lower';
  
  turf_condition?: 'very_short' | 'correct' | 'longish' | 'long' | 'irregular';
  green_speed?: 'fast' | 'medium' | 'slow' | 'irregular';
  physical_state?: 'good' | 'bit_tired' | 'tired' | 'discomfort';
  mental_state?: 'focused' | 'neutral' | 'distracted' | 'frustrated';
}

export type RoundType = 'front' | 'back' | 'full';
export type WeatherCondition = 'dry' | 'humid' | 'rainy' | 'variable';
export type WindCondition = 'none' | 'light' | 'moderate' | 'strong';

export interface GolfCourse {
  id: string;
  name: string;
  address: string | null;
  municipality: string | null;
  province: string | null;
  region: string | null;
  phone: string | null;
  email: string | null;
  url: string | null;
  latitude: string | null;
  longitude: string | null;
}

export interface ScorecardSessionSetup {
  course: GolfCourse;
  roundType: RoundType;
  weather: WeatherCondition;
  wind: WindCondition;
}
import type { ClubTempoConfig, HoleScore } from './types';
import { GOLF_COURSES_DATA } from './data/courses';

export const CLUB_TEMPO_CONFIGS: ClubTempoConfig[] = [
  { 
    id: 'driver', 
    name: 'Driver', 
    range: { min: 100, max: 126 }, 
    optimalRange: { start: 108, end: 118 }, 
    default: 112 
  },
  { 
    id: 'long_iron', 
    name: 'Hierro Largo', 
    range: { min: 105, max: 126 }, 
    optimalRange: { start: 110, end: 120 }, 
    default: 115 
  },
  { 
    id: 'mid_iron', 
    name: 'Hierro Medio', 
    range: { min: 109, max: 133 }, 
    optimalRange: { start: 116, end: 126 }, 
    default: 121 
  },
  { 
    id: 'wedge', 
    name: 'Wedge', 
    range: { min: 115, max: 141 }, 
    optimalRange: { start: 122, end: 134 }, 
    default: 128 
  },
];

export const GOLF_COURSES = GOLF_COURSES_DATA;

const defaultPars = [4, 5, 4, 3, 4, 5, 4, 3, 4, 4, 5, 4, 3, 4, 5, 4, 3, 4];
// Standard Stroke Index distribution (Men's)
const strokeIndexes = [9, 1, 13, 17, 5, 3, 11, 15, 7, 8, 2, 12, 16, 4, 6, 10, 14, 18];


export const INITIAL_HOLE_SCORES: HoleScore[] = defaultPars.map((par, index) => ({
  hole: index + 1,
  par: par,
  strokeIndex: strokeIndexes[index],
  strokes: null,
  putts: null,
  comment: null,
}));
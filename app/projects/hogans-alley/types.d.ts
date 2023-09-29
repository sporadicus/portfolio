import {
  MutableRefObject,
  Dispatch,
  SetStateAction,
  } from 'react'
import { targetHandles } from './commonVals'


export type ClearCanvasLine = {
  x: number;
  y: number;
  w: number;
  h: number;
}
export type DrawCanvasLine = {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}
export type ScoreHatLineDimensions = [
  [number[]],
  [number[]],
  [number[]],
  [number[]],
  [number[]],
  [number[], number[], number[], number[]],
]

export type TargetHandle = keyof typeof targetHandles;
export type SlotLocation = 0 | 1 | 2;
export type NumeralString = '0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9';

export type TargetState = TargetStateResets & {
  domRef: MutableRefObject<HTMLDivElement|null>;
}
export type TargetStates = {
  0: TargetState;
  1: TargetState;
  2: TargetState;
}
export type TargetStateResets = {
  slot:           SlotLocation;
  pointValue:     number;
  isBaddie:       boolean;
  isSpinning:     boolean;
  hasBeenTagged:  boolean;
  spinAnime:      anime.AnimeTimelineInstance|null;
  blinkAnime:     anime.AnimeTimelineInstance|null;
}

export type TargetProps = {
  targetHandle: TargetHandle;
  targetSlot:   SlotLocation;
  tagTarget:    ( targetSlot: SlotLocation ) => void;
}

export type RoomProps = {
  setHighScore:     Dispatch<SetStateAction<number>>;
  setCurrentScore:  Dispatch<SetStateAction<number>>;
  setMissTally:     Dispatch<SetStateAction<number>>;
  roundCount:       MutableRefObject<number>;
}

export type ScoreBoardProps = {
  highScore:    number;
  currentScore: number;
  missTally:    number;
  roundCount:   MutableRefObject<number>;
}

export type ScoreFieldProps = {
  scoreType: 'current' | 'high';
}
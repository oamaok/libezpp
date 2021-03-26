import { Vec2 } from './vec2'

export type General = {
  audioFilename: string
  audioLeadIn: number
  previewTime: number
  countdown: number
  sampleSet: string
  stackLeniency: number
  mode: number
  letterboxInBreaks: boolean
  useSkinSprites: boolean
  overlayPosition: string
  skinPreference: string
  epilepsyWarning: boolean
  countdownOffset: number
  specialStyle: boolean
  widescreenStoryboard: boolean
  samplesMatchPlaybackRate: boolean
}

export type Metadata = {
  title: string
  titleUnicode: string
  artist: string
  artistUnicode: string
  creator: string
  version: string
  source: string
  tags: string
  id: number
  setId: number
}

export type Difficulty = {
  hp: number
  cs: number
  od: number
  ar: number
  sliderMultiplier: number
  sliderTickRate: number
}

export type BeatmapBase = {
  version: number
  general: General
  metadata: Metadata
  difficulty: Difficulty
  timingPoints: TimingPoint[]
  hitObjects: HitObject[]
}

export type OsuBeatmap = {
  mode: 'osu'
  id: number
  setId: number
} & BeatmapBase

export type TaikoBeatmap = {
  mode: 'taiko'
  id: number
  setId: number
} & BeatmapBase

export type ManiaBeatmap = {
  mode: 'mania'
  id: number
  setId: number
} & BeatmapBase

export type CatchBeatmap = {
  mode: 'catch'
  id: number
  setId: number
} & BeatmapBase

export type Beatmap = OsuBeatmap | TaikoBeatmap | ManiaBeatmap | CatchBeatmap

export type TimingPoint = {
  time: number
  beatLength: number
  meter: number
  sampleSet: number
  sampleIndex: number
  volume: number
  uninherited: boolean
  effects: number
}

export type CircleObject = {
  type: 'circle'
  position: Vec2
  time: number
  hitSample: string
}

export type SliderCurve = {
  type: 'B' | 'C' | 'L' | 'P'
  points: Vec2[]
  slides: number
  length: number
  edgeSounds: number[]
  edgeSets: string[]
}

export type SliderObject = {
  type: 'slider'
  position: Vec2
  time: number
  curve: SliderCurve
  hitSample: string
}

export type SpinnerObject = {
  type: 'spinner'
  position: Vec2
  hitSample: string
  time: number
  endTime: number
}

export type HoldObject = {
  type: 'hold'
  position: Vec2
  time: number
}

export type HitObject = CircleObject | SliderObject | SpinnerObject | HoldObject

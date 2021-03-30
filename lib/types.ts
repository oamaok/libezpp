import { Vec2 } from './vec2'

export type General = Readonly<{
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
}>

export type Metadata = Readonly<{
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
}>

export type Stats = {
  hp: number
  cs: number
  od: number
  ar: number
  sliderMultiplier: number
  sliderTickRate: number
}

export type BeatmapBase = Readonly<{
  version: number
  general: General
  metadata: Metadata
  stats: Stats
  timingPoints: TimingPoint[]
  hitObjects: HitObject[]
}>

export type OsuBeatmap = Readonly<{
  mode: 'osu'
  id: number
  setId: number
  objectCounts: ObjectCounts
}> &
  BeatmapBase

export type TaikoBeatmap = Readonly<{
  mode: 'taiko'
  id: number
  setId: number
  objectCounts: ObjectCounts
}> &
  BeatmapBase

export type ManiaBeatmap = Readonly<{
  mode: 'mania'
  id: number
  setId: number
  objectCounts: ObjectCounts
}> &
  BeatmapBase

export type CatchBeatmap = Readonly<{
  mode: 'catch'
  id: number
  setId: number
  objectCounts: ObjectCounts
}> &
  BeatmapBase

export type Beatmap = OsuBeatmap | TaikoBeatmap | ManiaBeatmap | CatchBeatmap

export type TimingPoint = Readonly<{
  time: number
  beatLength: number
  meter: number
  sampleSet: number
  sampleIndex: number
  volume: number
  inherited: boolean
  effects: number
}>

export type CircleObject = Readonly<{
  type: 'circle'
  position: Vec2
  time: number
  hitSample: string
}>

export type SliderCurve = Readonly<{
  type: 'B' | 'C' | 'L' | 'P'
  points: Vec2[]
  repetitions: number
  length: number
  edgeSounds: number[]
  edgeSets: string[]
}>

export type SliderObject = Readonly<{
  type: 'slider'
  position: Vec2
  time: number
  curve: SliderCurve
  hitSample: string
}>

export type SpinnerObject = Readonly<{
  type: 'spinner'
  hitSample: string
  time: number
  endTime: number
}>

export type HoldObject = Readonly<{
  type: 'hold'
  position: Vec2
  time: number
}>

export type InvalidObject = Readonly<{
  type: 'invalid'
}>

export type HitObject =
  | CircleObject
  | SliderObject
  | SpinnerObject
  | HoldObject
  | InvalidObject

export type CalculationOptions = {
  mods: number
  accuracy: number
  misses: number
  combo: number
}

export type ObjectCounts = {
  circles: number
  sliders: number
  spinners: number
  holds: number
}

export type ModBits = number

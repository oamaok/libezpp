import { Vec2 } from './vec2'

type General = {
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

type Metadata = {
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

type Difficulty = {
  hp: number
  cs: number
  od: number
  ar: number
  sliderMultiplier: number
  sliderTickRate: number
}

type BeatmapBase = {
  version: number
  general: General
  metadata: Metadata
  difficulty: Difficulty
  timingPoints: TimingPoint[]
  hitObjects: HitObject[]
}

type OsuBeatmap = {
  mode: 'osu'
} & BeatmapBase

type TaikoBeatmap = {
  mode: 'taiko'
} & BeatmapBase

type ManiaBeatmap = {
  mode: 'mania'
} & BeatmapBase

type CatchBeatmap = {
  mode: 'catch'
} & BeatmapBase

type Beatmap = OsuBeatmap | TaikoBeatmap | ManiaBeatmap | CatchBeatmap

type TimingPoint = {
  time: number
  beatLength: number
  meter: number
  sampleSet: number
  sampleIndex: number
  volume: number
  uninherited: boolean
  effects: number
}

type CircleObject = {
  type: 'circle'
  position: Vec2
  time: number
  hitSample: string
}

type SliderCurve = {
  type: 'B' | 'C' | 'L' | 'P'
  points: Vec2[]
  slides: number
  length: number
  edgeSounds: number[]
  edgeSets: string[]
}

type SliderObject = {
  type: 'slider'
  position: Vec2
  time: number
  curve: SliderCurve
  hitSample: string
}

type SpinnerObject = {
  type: 'spinner'
  position: Vec2
  hitSample: string
  time: number
  endTime: number
}

type HoldObject = {
  type: 'hold'
  position: Vec2
  time: number
}

type HitObject = CircleObject | SliderObject | SpinnerObject | HoldObject

const CIRCLE_OBJECT_BIT = 1 << 0
const SLIDER_OBJECT_BIT = 1 << 1
const SPINNER_OBJECT_BIT = 1 << 3
const HOLD_OBJECT_BIT = 1 << 7

const OBJECT_BITS =
  CIRCLE_OBJECT_BIT | SLIDER_OBJECT_BIT | SPINNER_OBJECT_BIT | HOLD_OBJECT_BIT

const DEFAULT_HIT_SAMPLE = '0:0:0:0:'

const parseCurvePoint = (curvePoint: string): Vec2 => {
  const [x, y] = curvePoint.split(':')
  return { x: parseInt(x), y: parseInt(y) }
}

const parseHitObject = (line: string): HitObject => {
  const [x, y, time, objectType, hitSound, ...objectParameters] = line.split(
    ','
  )
  const position: Vec2 = { x: parseInt(x), y: parseInt(y) }
  const hitSample = objectParameters.pop() || DEFAULT_HIT_SAMPLE

  switch (parseInt(objectType) & OBJECT_BITS) {
    case CIRCLE_OBJECT_BIT: {
      return {
        type: 'circle',
        time: parseInt(time),
        position,
        hitSample,
      }
    }

    case SLIDER_OBJECT_BIT: {
      const [
        curve,
        slides,
        length = '',
        edgeSounds = '',
        edgeSets = '',
      ] = objectParameters
      const [curveType, ...curvePoints] = curve.split('|')

      return {
        type: 'slider',
        time: parseInt(time),
        position,
        hitSample,
        curve: {
          type: curveType as SliderCurve['type'],
          points: curvePoints.map(parseCurvePoint),
          slides: parseInt(slides),
          length: parseFloat(length),
          edgeSounds: edgeSounds.split('|').map((sound) => parseInt(sound)),
          edgeSets: edgeSets.split('|'),
        },
      }
    }

    case SPINNER_OBJECT_BIT: {
      const [endTime] = objectParameters
      return {
        type: 'spinner',
        time: parseInt(time),
        position,
        hitSample,
        endTime: parseInt(endTime),
      }
    }

    case HOLD_OBJECT_BIT: {
      throw new Error('HOLD_OBJECT_BIT: unimplemented')
      // return { type: 'hold', time: parseInt(time), position }
    }

    default:
      throw new Error('Invalid hit object type')
  }
}

const parseTimingPoint = (line: string): TimingPoint => {
  const [
    time,
    beatLength,
    meter,
    sampleSet,
    sampleIndex,
    volume,
    uninherited,
    effects,
  ] = line.split(',')

  return {
    time: parseInt(time),
    beatLength: parseFloat(beatLength),
    meter: parseInt(meter),
    sampleSet: parseInt(sampleSet),
    sampleIndex: parseInt(sampleIndex),
    volume: parseInt(volume),
    uninherited: uninherited === '1',
    effects: parseInt(effects),
  }
}

const parseKeyValuePair = (line: string): [string, string] => {
  const [key, value = ''] = line.split(':')
  return [key.trim(), value.trim()]
}

type KeyMap<T> = Record<
  string,
  {
    [K in keyof T]: {
      key: K
      type: T[K] extends string
        ? 'string'
        : T[K] extends number
        ? 'integer' | 'decimal'
        : 'boolean'
    }
  }[keyof T]
>

const GENERAL_KEY_MAP: KeyMap<General> = {
  AudioFilename: { key: 'audioFilename', type: 'string' },
  AudioLeadIn: { key: 'audioLeadIn', type: 'integer' },
  PreviewTime: { key: 'previewTime', type: 'integer' },
  Countdown: { key: 'countdown', type: 'integer' },
  SampleSet: { key: 'sampleSet', type: 'string' },
  StackLeniency: { key: 'stackLeniency', type: 'decimal' },
  Mode: { key: 'mode', type: 'integer' },
  LetterboxInBreaks: { key: 'letterboxInBreaks', type: 'boolean' },
  UseSkinSprites: { key: 'useSkinSprites', type: 'boolean' },
  OverlayPosition: { key: 'overlayPosition', type: 'string' },
  SkinPreference: { key: 'skinPreference', type: 'string' },
  EpilepsyWarning: { key: 'epilepsyWarning', type: 'boolean' },
  CountdownOffset: { key: 'countdownOffset', type: 'integer' },
  SpecialStyle: { key: 'specialStyle', type: 'boolean' },
  WidescreenStoryboard: { key: 'widescreenStoryboard', type: 'boolean' },
  SamplesMatchPlaybackRate: {
    key: 'samplesMatchPlaybackRate',
    type: 'boolean',
  },
}

const DIFFICULTY_KEY_MAP: KeyMap<Difficulty> = {
  HPDrainRate: { key: 'hp', type: 'decimal' },
  CircleSize: { key: 'hp', type: 'decimal' },
  OverallDifficulty: { key: 'hp', type: 'decimal' },
  ApproachRate: { key: 'hp', type: 'decimal' },
  SliderMultiplier: { key: 'hp', type: 'decimal' },
  SliderTickRate: { key: 'hp', type: 'decimal' },
} as const

const METADATA_KEY_MAP: KeyMap<Metadata> = {
  Title: { key: 'title', type: 'string' },
  TitleUnicode: { key: 'titleUnicode', type: 'string' },
  Artist: { key: 'artist', type: 'string' },
  ArtistUnicode: { key: 'artistUnicode', type: 'string' },
  Creator: { key: 'creator', type: 'string' },
  Version: { key: 'version', type: 'string' },
  Source: { key: 'source', type: 'string' },
  Tags: { key: 'tags', type: 'string' },
  BeatmapID: { key: 'id', type: 'integer' },
  BeatmapSetID: { key: 'setId', type: 'integer' },
} as const

type Section =
  | null
  | 'General'
  | 'Editor'
  | 'Metadata'
  | 'Difficulty'
  | 'Events'
  | 'TimingPoints'
  | 'Colours'
  | 'HitObjects'

const parseKeyValuePairSection = <
  T extends Record<string, number | string | boolean>
>(
  lines: string[],
  keyMap: KeyMap<T>
): T => {
  const section: Record<keyof T, number | string | boolean> = {} as Record<
    keyof T,
    number | string | boolean
  >

  for (const line of lines) {
    const [key, value] = parseKeyValuePair(line)
    const sectionKey = keyMap[key]

    if (!sectionKey) throw new Error(`Unhandled key ${key}`)

    switch (sectionKey.type) {
      case 'integer':
        section[sectionKey.key] = parseInt(value)
        break
      case 'decimal':
        section[sectionKey.key] = parseFloat(value)
        break
      case 'string':
        section[sectionKey.key] = value
        break
      case 'boolean':
        section[sectionKey.key] = value === '1'
        break
    }
  }

  return section as T
}

const GAME_MODES = ['osu', 'taiko', 'catch', 'mania'] as const

const parse = (data: string): Beatmap => {
  const lines = data
    .split('\n')
    .filter((line) => {
      const isComment =
        line.startsWith(' ') || line.startsWith('_') || line.startsWith('//')
      const isEmpty = line.trim() === ''
      return !isComment && !isEmpty
    })
    .map((line) => line.trim())

  const [header] = lines.splice(0, 1)

  const sectionLines: Record<Exclude<Section, null>, string[]> = {
    General: [],
    Editor: [],
    Metadata: [],
    Difficulty: [],
    Events: [],
    TimingPoints: [],
    Colours: [],
    HitObjects: [],
  }

  let section: Section = null
  for (const line of lines) {
    if (line.startsWith('[')) {
      section = line.substr(1, line.length - 2) as Section
      continue
    }

    if (!section) continue

    sectionLines[section].push(line)
  }

  const beatmapBase: BeatmapBase = {
    version: NaN,
    general: parseKeyValuePairSection(sectionLines.General, GENERAL_KEY_MAP),
    metadata: parseKeyValuePairSection(sectionLines.Metadata, METADATA_KEY_MAP),
    difficulty: parseKeyValuePairSection(
      sectionLines.Difficulty,
      DIFFICULTY_KEY_MAP
    ),
    timingPoints: sectionLines.TimingPoints.map((line) =>
      parseTimingPoint(line)
    ),
    hitObjects: sectionLines.HitObjects.map((line) => parseHitObject(line)),
  }

  return {
    mode: GAME_MODES[beatmapBase.general.mode],
    ...beatmapBase,
  }
}

export {
  General,
  Metadata,
  Difficulty,
  BeatmapBase,
  OsuBeatmap,
  TaikoBeatmap,
  ManiaBeatmap,
  CatchBeatmap,
  Beatmap,
  TimingPoint,
  CircleObject,
  SliderCurve,
  SliderObject,
  SpinnerObject,
  HoldObject,
  HitObject,
  parse,
}

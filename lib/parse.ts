import {
  General,
  Metadata,
  Difficulty,
  BeatmapBase,
  Beatmap,
  TimingPoint,
  SliderCurve,
  HitObject,
} from './types'
import { Vec2 } from './vec2'

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

type SectionKeyMap<T> = Record<
  string,
  {
    [K in keyof T]: {
      key: K
      type: T[K] extends string
        ? 'string'
        : T[K] extends number
        ? 'integer' | 'decimal'
        : 'boolean'
      default?: T[K]
    }
  }[keyof T]
>

const GENERAL_KEY_MAP: SectionKeyMap<General> = {
  AudioFilename: { key: 'audioFilename', type: 'string' },
  AudioLeadIn: { key: 'audioLeadIn', type: 'integer', default: 0 },
  PreviewTime: { key: 'previewTime', type: 'integer', default: -1 },
  Countdown: { key: 'countdown', type: 'integer', default: 1 },
  SampleSet: { key: 'sampleSet', type: 'string', default: 'Normal' },
  StackLeniency: { key: 'stackLeniency', type: 'decimal', default: 0.7 },
  Mode: { key: 'mode', type: 'integer', default: 0 },
  LetterboxInBreaks: {
    key: 'letterboxInBreaks',
    type: 'boolean',
    default: false,
  },
  UseSkinSprites: { key: 'useSkinSprites', type: 'boolean', default: false },
  OverlayPosition: {
    key: 'overlayPosition',
    type: 'string',
    default: 'NoChange',
  },
  SkinPreference: { key: 'skinPreference', type: 'string', default: '' },
  EpilepsyWarning: { key: 'epilepsyWarning', type: 'boolean', default: false },
  CountdownOffset: { key: 'countdownOffset', type: 'integer', default: 0 },
  SpecialStyle: { key: 'specialStyle', type: 'boolean', default: false },
  WidescreenStoryboard: {
    key: 'widescreenStoryboard',
    type: 'boolean',
    default: false,
  },
  SamplesMatchPlaybackRate: {
    key: 'samplesMatchPlaybackRate',
    type: 'boolean',
    default: false,
  },
}

const DIFFICULTY_KEY_MAP: SectionKeyMap<Difficulty> = {
  HPDrainRate: { key: 'hp', type: 'decimal', default: -1 },
  CircleSize: { key: 'cs', type: 'decimal', default: -1 },
  OverallDifficulty: { key: 'od', type: 'decimal', default: -1 },
  ApproachRate: { key: 'ar', type: 'decimal', default: -1 },
  SliderMultiplier: { key: 'sliderMultiplier', type: 'decimal', default: -1 },
  SliderTickRate: { key: 'sliderTickRate', type: 'decimal', default: -1 },
} as const

const METADATA_KEY_MAP: SectionKeyMap<Metadata> = {
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
  sectionKeyMap: SectionKeyMap<T>
): T => {
  const section: Record<keyof T, number | string | boolean> = {} as Record<
    keyof T,
    number | string | boolean
  >

  for (const key in sectionKeyMap) {
    const defaultValue = sectionKeyMap[key].default
    if (defaultValue !== undefined)
      section[sectionKeyMap[key].key] = defaultValue
  }

  for (const line of lines) {
    const [key, value] = parseKeyValuePair(line)
    const sectionKey = sectionKeyMap[key]

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

export const parse = (data: string): Beatmap => {
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
  const version = parseInt(header.replace(/[\d]+/g, ''))

  const sectionLines: Record<Section, string[]> = {
    General: [],
    Editor: [],
    Metadata: [],
    Difficulty: [],
    Events: [],
    TimingPoints: [],
    Colours: [],
    HitObjects: [],
  }

  let section: Section | null = null
  for (const line of lines) {
    if (line.startsWith('[')) {
      section = line.substr(1, line.length - 2) as Section
      continue
    }

    if (!section) continue

    sectionLines[section].push(line)
  }

  const beatmapBase: BeatmapBase = {
    version: version,
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

  // Support old beatmaps where AR is not set
  if (beatmapBase.difficulty.ar < 0) {
    beatmapBase.difficulty.ar = beatmapBase.difficulty.od
  }

  return {
    mode: GAME_MODES[beatmapBase.general.mode],
    id: beatmapBase.metadata.id,
    setId: beatmapBase.metadata.setId,
    ...beatmapBase,
  }
}

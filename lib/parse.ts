import {
  General,
  Metadata,
  Stats,
  BeatmapBase,
  Beatmap,
  TimingPoint,
  SliderCurve,
  HitObject,
  ObjectCounts,
  SliderObject,
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
  return new Vec2(parseInt(x), parseInt(y))
}

const parseHitObject = (line: string): HitObject => {
  const [x, y, time, objectType, hitSound, ...objectParameters] = line.split(
    ','
  )
  const position: Vec2 = new Vec2(parseInt(x.trim()), parseInt(y.trim()))

  switch (parseInt(objectType) & OBJECT_BITS) {
    case CIRCLE_OBJECT_BIT: {
      return {
        type: 'circle',
        time: parseInt(time),
        position,
        hitSample: DEFAULT_HIT_SAMPLE,
      }
    }

    case SLIDER_OBJECT_BIT: {
      const [
        curve,
        repetitions = '1',
        length = '0.0',
        edgeSounds = '',
        edgeSets = '',
      ] = objectParameters
      const [curveType, ...curvePoints] = curve.split('|')

      const slider: SliderObject = {
        type: 'slider',
        time: parseInt(time),
        position,
        hitSample: DEFAULT_HIT_SAMPLE,
        curve: {
          type: curveType as SliderCurve['type'],
          points: curvePoints.map(parseCurvePoint),
          repetitions: parseInt(repetitions.trim()),
          length: parseFloat(length.trim()),
          edgeSounds: edgeSounds
            .trim()
            .split('|')
            .map((sound) => parseInt(sound)),
          edgeSets: edgeSets.trim().split('|'),
        },
      }

      if (isNaN(slider.curve.repetitions) || isNaN(slider.curve.length)) {
        return { type: 'invalid' }
      }

      return slider
    }

    case SPINNER_OBJECT_BIT: {
      const [endTime] = objectParameters
      return {
        type: 'spinner',
        time: parseInt(time),
        hitSample: DEFAULT_HIT_SAMPLE,
        endTime: parseInt(endTime),
      }
    }

    case HOLD_OBJECT_BIT: {
      // TODO(teemu): Implement this properly
      return { type: 'hold', time: parseInt(time), position }
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
    inherited: uninherited === '0',
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

const DIFFICULTY_KEY_MAP: SectionKeyMap<Stats> = {
  HPDrainRate: { key: 'hp', type: 'decimal', default: -1 },
  CircleSize: { key: 'cs', type: 'decimal', default: -1 },
  OverallDifficulty: { key: 'od', type: 'decimal', default: -1 },
  ApproachRate: { key: 'ar', type: 'decimal', default: -1 },
  SliderMultiplier: { key: 'sliderMultiplier', type: 'decimal', default: 1.0 },
  SliderTickRate: { key: 'sliderTickRate', type: 'decimal', default: 1.0 },
} as const

const METADATA_KEY_MAP: SectionKeyMap<Metadata> = {
  Title: { key: 'title', type: 'string' },
  TitleUnicode: { key: 'titleUnicode', type: 'string', default: '' },
  Artist: { key: 'artist', type: 'string' },
  ArtistUnicode: { key: 'artistUnicode', type: 'string', default: '' },
  Creator: { key: 'creator', type: 'string' },
  Version: { key: 'version', type: 'string' },
  Source: { key: 'source', type: 'string', default: '' },
  Tags: { key: 'tags', type: 'string', default: '' },
  BeatmapID: { key: 'id', type: 'integer', default: -1 },
  BeatmapSetID: { key: 'setId', type: 'integer', default: -1 },
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

    if (!sectionKey) {
      // TODO(teemu): This should probably throw something
      continue
    }

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

const isKeyOf = <T>(obj: T, key: string | number | symbol): key is keyof T => {
  return key in obj
}

const getObjectCounts = (hitObjects: HitObject[]): ObjectCounts =>
  hitObjects.reduce(
    (counts: ObjectCounts, hitObject: HitObject) => ({
      circles: counts.circles + +(hitObject.type === 'circle'),
      sliders: counts.sliders + +(hitObject.type === 'slider'),
      spinners: counts.spinners + +(hitObject.type === 'spinner'),
      holds: counts.holds + +(hitObject.type === 'hold'),
    }),
    {
      circles: 0,
      sliders: 0,
      spinners: 0,
      holds: 0,
    }
  )

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

  let version: number = 1
  if (lines[0].startsWith('osu file format v')) {
    const [header] = lines.splice(0, 1)
    version = parseInt(header.replace(/[^\d]+/g, ''))
  }

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

  let section: string | null = null
  for (const line of lines) {
    if (line.startsWith('[')) {
      section = line.substr(1, line.length - 2)
      continue
    }

    if (!section) continue
    if (!isKeyOf(sectionLines, section)) continue

    sectionLines[section].push(line)
  }

  const beatmapBase: BeatmapBase = {
    version,
    general: parseKeyValuePairSection(sectionLines.General, GENERAL_KEY_MAP),
    metadata: parseKeyValuePairSection(sectionLines.Metadata, METADATA_KEY_MAP),
    stats: parseKeyValuePairSection(
      sectionLines.Difficulty,
      DIFFICULTY_KEY_MAP
    ),
    timingPoints: sectionLines.TimingPoints.map((line) =>
      parseTimingPoint(line)
    ),
    hitObjects: sectionLines.HitObjects.map((line) => parseHitObject(line)),
  }

  // Support old beatmaps where AR is not set
  if (beatmapBase.stats.ar < 0) {
    beatmapBase.stats.ar = beatmapBase.stats.od
  }

  return {
    mode: GAME_MODES[beatmapBase.general.mode],
    id: beatmapBase.metadata.id,
    setId: beatmapBase.metadata.setId,
    objectCounts: getObjectCounts(beatmapBase.hitObjects),
    ...beatmapBase,
  }
}

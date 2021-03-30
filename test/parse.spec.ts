import { Beatmap, General, Metadata, Stats } from '../lib/types'
import { calculateMaximumCombo } from '../lib/calculators/standard'
import { parse } from '../lib/parse'
import * as fs from 'fs'
import * as path from 'path'

const MANUAL_TEST_FILES: string[] = [
  'xi - FREEDOM DiVE (Nakagawa-Kanon) [FOUR DIMENSIONS].osu',
]

const testMapDirectory = path.resolve(__dirname, 'data/maps')
const files = fs.readdirSync(testMapDirectory)
const testMaps = (MANUAL_TEST_FILES.length
  ? MANUAL_TEST_FILES
  : files
).filter((file) => file.endsWith('.osu'))

const GENERAL_FIELDS: (keyof General)[] = [
  'audioFilename',
  'audioLeadIn',
  'previewTime',
  'countdown',
  'sampleSet',
  'stackLeniency',
  'mode',
  'letterboxInBreaks',
  'useSkinSprites',
  'overlayPosition',
  'skinPreference',
  'epilepsyWarning',
  'countdownOffset',
  'specialStyle',
  'widescreenStoryboard',
  'samplesMatchPlaybackRate',
]

const METADATA_FIELDS: (keyof Metadata)[] = [
  'title',
  'titleUnicode',
  'artist',
  'artistUnicode',
  'creator',
  'version',
  'source',
  'tags',
  'id',
  'setId',
]

const STATS_FIELDS: (keyof Stats)[] = [
  'hp',
  'cs',
  'od',
  'ar',
  'sliderMultiplier',
  'sliderTickRate',
]

describe('parse', () => {
  it('should return all beatmap fields as defined', () => {
    for (const map of testMaps) {
      let beatmap: Beatmap
      try {
        beatmap = parse(
          fs.readFileSync(path.resolve(testMapDirectory, map)).toString('utf-8')
        )
      } catch (err) {
        throw new Error(
          `Failed with beatmap "${map}": ${err.message}\n${err.stack}`
        )
      }

      if (beatmap.mode === 'osu') {
        console.log(calculateMaximumCombo(beatmap))
      }

      if (typeof beatmap.version === 'undefined') {
        throw new Error(`undefined version on beatmap "${map}"`)
      }

      if (isNaN(beatmap.version)) {
        throw new Error(`beatmap version is NaN on "${map}"`)
      }

      for (const key of GENERAL_FIELDS) {
        const value = beatmap.general[key]

        if (typeof value === 'undefined') {
          throw new Error(`undefined key ${key} on beatmap "${map}"`)
        }

        if (typeof value === 'number' && isNaN(value)) {
          throw new Error(`NaN value at key ${key} on beatmap "${map}"`)
        }
      }

      for (const key of METADATA_FIELDS) {
        const value = beatmap.metadata[key]

        if (typeof value === 'undefined') {
          throw new Error(`undefined key ${key} on beatmap "${map}"`)
        }

        if (typeof value === 'number' && isNaN(value)) {
          throw new Error(`NaN value at key ${key} on beatmap "${map}"`)
        }
      }

      for (const key of STATS_FIELDS) {
        if (typeof beatmap.stats[key] === 'undefined') {
          throw new Error(`undefined key ${key} on beatmap "${map}"`)
        }

        if (isNaN(beatmap.stats[key])) {
          throw new Error(`NaN value at key ${key} on beatmap "${map}"`)
        }
      }
    }
  })
})

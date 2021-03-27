import { Beatmap, General, Metadata, Difficulty } from '../lib/types'
import { parse } from '../lib/parse'
import * as fs from 'fs'
import * as path from 'path'

const MANUAL_TEST_FILES: string[] = []

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

const DIFFICULTY_FIELDS: (keyof Difficulty)[] = [
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

      if (typeof beatmap.version === 'undefined') {
        throw new Error(`undefined version on beatmap "${map}"`)
      }

      for (const key of GENERAL_FIELDS) {
        if (typeof beatmap.general[key] === 'undefined') {
          throw new Error(`undefined key ${key} on beatmap "${map}"`)
        }
      }

      for (const key of METADATA_FIELDS) {
        if (typeof beatmap.metadata[key] === 'undefined') {
          throw new Error(`undefined key ${key} on beatmap "${map}"`)
        }
      }

      for (const key of DIFFICULTY_FIELDS) {
        if (typeof beatmap.difficulty[key] === 'undefined') {
          throw new Error(`undefined key ${key} on beatmap "${map}"`)
        }
      }
    }
  })
})

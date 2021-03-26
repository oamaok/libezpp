import { General, Metadata, Difficulty } from '../lib/types'
import { parse } from '../lib/parse'
import * as fs from 'fs'
import * as path from 'path'

const testMapDirectory = path.resolve(__dirname, 'data/maps')
const testMaps = fs
  .readdirSync(testMapDirectory)
  .filter((file) => file.endsWith('.osu'))
  .map((file) => ({
    file,
    content: fs.readFileSync(path.resolve(testMapDirectory, file)).toString(),
  }))

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
  it('should properly parse all valid test maps', () => {
    for (const map of testMaps) {
      const beatmap = parse(map.content)
      expect(beatmap).toBeDefined()
    }
  })

  it('should return beatmap.version as defined', () => {
    for (const map of testMaps) {
      const beatmap = parse(map.content)
      if (typeof beatmap.version === 'undefined') {
        throw new Error(`undefined version on beatmap ${map.file}`)
      }
    }
  })

  it('should return all fields of beatmap.general as defined', () => {
    for (const map of testMaps) {
      const beatmap = parse(map.content)

      for (const key of GENERAL_FIELDS) {
        if (typeof beatmap.general[key] === 'undefined') {
          throw new Error(`undefined key ${key} on beatmap ${map.file}`)
        }
      }
    }
  })

  it('should return all fields of beatmap.metadata as defined', () => {
    for (const map of testMaps) {
      const beatmap = parse(map.content)

      for (const key of METADATA_FIELDS) {
        if (typeof beatmap.metadata[key] === 'undefined') {
          throw new Error(`undefined key ${key} on beatmap ${map.file}`)
        }
      }
    }
  })

  it('should return all fields of beatmap.difficulty as defined', () => {
    for (const map of testMaps) {
      const beatmap = parse(map.content)

      for (const key of DIFFICULTY_FIELDS) {
        if (typeof beatmap.difficulty[key] === 'undefined') {
          throw new Error(`undefined key ${key} on beatmap ${map.file}`)
        }
      }
    }
  })
})

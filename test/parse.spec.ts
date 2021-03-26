import { parse } from '../lib/parse'
import * as fs from 'fs'
import * as path from 'path'

const testMapDirectory = path.resolve(__dirname, 'data/maps')
const testMaps = fs
  .readdirSync(testMapDirectory)
  .filter((item) => item.endsWith('.osu'))
  .map((item) =>
    fs.readFileSync(path.resolve(testMapDirectory, item)).toString()
  )

describe('parse', () => {
  it('should properly parse all valid test maps', () => {
    testMaps.forEach((map) => {
      parse(map)
    })
  })
})

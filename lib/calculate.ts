import { Beatmap, CalculationOptions } from './types'
import * as standard from './calculators/standard'

export const calculate = (beatmap: Beatmap, options: CalculationOptions) => {
  switch (beatmap.mode) {
    case 'osu':
      return standard.calculate(beatmap, options)

    default:
      throw new Error('unimplemented')
  }
}

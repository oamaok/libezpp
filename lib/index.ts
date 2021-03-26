type Beatmap =
  | {
      mode: 'osu'
    }
  | {
      modu: 'taiko'
    }

type CalculationOptions = {
  mods: number
  misses: number
  accuracy: number
  combo: number
}

type CalculationResult =
  | {
      mode: 'osu'
      pp: number
      difficulty: number
      approachRate: number
    }
  | {
      mode: 'taiko'
      pp: number
    }

const ezpp = {
  parse: (data: string): Beatmap => {
    return { mode: 'osu' }
  },

  calculate: (
    beatmap: Beatmap,
    options: CalculationOptions
  ): CalculationResult => {
    return {
      mode: 'osu',
      pp: 0,
      difficulty: 0,
      approachRate: 0,
    }
  },
}

export default ezpp

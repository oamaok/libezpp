import {
  OsuBeatmap,
  SliderObject,
  HitObject,
  TimingPoint,
  Stats,
  CalculationOptions,
} from '../types'

import { Vec2 } from '../vec2'

import { Modifiers } from '../modifiers'

type OsuCalculationResult = {}

type HitCounts = {
  n300: number
  n100: number
  n50: number
  misses: number
}

const calculateHitCounts = (
  accuracy: number,
  misses: number,
  objectCount: number
): HitCounts => {
  const max300 = objectCount - misses
  const maxAcc = (objectCount / (objectCount - misses)) * 100
  const accuracyPercentage = Math.max(0.0, Math.min(maxAcc, accuracy))

  const n100 = Math.round(
    -3.0 * ((accuracyPercentage * 0.01 - 1.0) * objectCount + misses) * 0.5
  )

  if (n100 > max300) {
    const n50 = Math.round(
      -6.0 * ((accuracy * 0.01 - 1.0) * objectCount + misses) * 0.5
    )

    return {
      n300: objectCount - misses - n50,
      n100: 0,
      n50,
      misses,
    }
  }

  return {
    n300: objectCount - misses - n100,
    n100,
    n50: 0,
    misses,
  }
}

const getSliderVelocityMultiplier = (
  slider: SliderObject,
  timingPoints: TimingPoint[]
) => {
  const index = timingPoints.findIndex((point) => slider.time <= point.time)
  const timingPoint = timingPoints[index + 1]

  if (!timingPoint) return 0.0
  if (timingPoint.inherited && timingPoint.beatLength < 0)
    return -100.0 / timingPoint.beatLength
  return 1.0
}

export const calculateMaximumCombo = (beatmap: OsuBeatmap) => {
  const sliderBeats = beatmap.hitObjects
    .filter(
      (hitObject): hitObject is SliderObject => hitObject.type === 'slider'
    )
    .map((slider) => {
      const baseVelocity = beatmap.stats.sliderMultiplier * 100.0
      const velocityMultiplier =
        beatmap.version >= 8
          ? getSliderVelocityMultiplier(slider, beatmap.timingPoints)
          : 0
      const pixelsPerBeat = baseVelocity * velocityMultiplier

      const beats =
        (slider.curve.length * slider.curve.repetitions) / pixelsPerBeat

      // subtract an epsilon to prevent accidental
      // ceiling of whole values such as 2.00....1 -> 3 due
      // to rounding errors
      const EPSILON = 0.01

      return (
        Math.ceil(
          ((beats - EPSILON) / slider.curve.repetitions) *
            beatmap.stats.sliderTickRate -
            1
        ) *
          slider.curve.repetitions +
        slider.curve.repetitions +
        1
      )
    })

  const sliderCombo = sliderBeats.reduce(
    (sum, beats) => sum + Math.max(beats, 0),
    0
  )

  return (
    sliderCombo + beatmap.objectCounts.circles + beatmap.objectCounts.spinners
  )
}

const calculateCircleSize = (cs: number, mods: number): number => {
  if (mods & Modifiers.hr) return Math.min(10, cs * 1.3)
  if (mods & Modifiers.ez) return cs * 0.5
  return cs
}

const OD0_MS = 80
const OD10_MS = 20
const AR0_MS = 1800.0
const AR5_MS = 1200.0
const AR10_MS = 450.0

const OD_MS_STEP = (OD0_MS - OD10_MS) / 10.0
const AR_MS_STEP1 = (AR0_MS - AR5_MS) / 5.0
const AR_MS_STEP2 = (AR5_MS - AR10_MS) / 5.0

const calculateDifficultyMultiplier = (mods: number): number => {
  if (mods & Modifiers.hr) return 1.4
  if (mods & Modifiers.ez) return 0.5
  return 1
}

const calculateSpeedMultiplier = (mods: number): number => {
  if (mods & (Modifiers.dt | Modifiers.nc)) return 1.5
  if (mods & Modifiers.ht) return 0.75
  return 1
}

const calculateApproachRate = (ar: number, mods: number): number => {
  const diffMultiplier = calculateDifficultyMultiplier(mods)
  const speedMultiplier = calculateSpeedMultiplier(mods)

  const multipliedAr = ar * diffMultiplier

  // Convert AR into the hit window in milliseconds
  let milliseconds =
    multipliedAr < 5.0
      ? AR0_MS - AR_MS_STEP1 * multipliedAr
      : AR5_MS - AR_MS_STEP2 * (multipliedAr - 5.0)

  // stats must be capped to 0-10 before HT/DT which
  // brings them to a range of -4.42->11.08 for OD and
  // -5->11 for AR
  milliseconds =
    Math.min(AR0_MS, Math.max(AR10_MS, milliseconds)) / speedMultiplier

  return milliseconds > AR5_MS
    ? (AR0_MS - milliseconds) / AR_MS_STEP1
    : 5.0 + (AR5_MS - milliseconds) / AR_MS_STEP2
}

const calculateHitPoints = (hp: number, mods: number): number => {
  return Math.min(10.0, hp * calculateDifficultyMultiplier(mods))
}

const calculateOverallDifficulty = (od: number, mods: number): number => {
  const diffMultiplier = calculateDifficultyMultiplier(mods)
  const speedMultiplier = calculateSpeedMultiplier(mods)

  const multipliedOd = od * diffMultiplier

  let milliseconds = OD0_MS - Math.ceil(OD_MS_STEP * multipliedOd)
  milliseconds = Math.min(OD0_MS, Math.max(OD10_MS, milliseconds))
  milliseconds /= speedMultiplier
  return (OD0_MS - milliseconds) / OD_MS_STEP
}

const calculateBeatmapStats = (
  sourceStats: Stats,
  mods: number
): Stats => {
  if (!(mods & Modifiers.changesMap)) {
    return sourceStats
  }

  return {
    ...sourceStats,
    ar: calculateApproachRate(sourceStats.ar, mods),
    od: calculateOverallDifficulty(sourceStats.od, mods),
    hp: calculateHitPoints(sourceStats.hp, mods),
    cs: calculateCircleSize(sourceStats.cs, mods),
  }
}

export const calculate = (
  beatmap: OsuBeatmap,
  options: CalculationOptions
): OsuCalculationResult => {
  return {}
}

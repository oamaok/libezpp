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
} from './types'
import { parse } from './parse'
import { calculate } from './calculate'

const ezpp = {
  parse,
  calculate,
} as const

export { ezpp, parse }
export default ezpp

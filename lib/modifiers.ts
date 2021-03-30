export enum Modifiers {
  nomod = 0,
  nf = 1 << 0,
  ez = 1 << 1,
  td = 1 << 2,
  hd = 1 << 3,
  hr = 1 << 4,
  dt = 1 << 6,
  ht = 1 << 8,
  nc = 1 << 9,
  fl = 1 << 10,
  so = 1 << 12,

  changesSpeed = Modifiers.dt | Modifiers.ht | Modifiers.nc,
  changesMap = Modifiers.hr | Modifiers.ez | Modifiers.changesSpeed,
}

class Vec2 {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
  
  add(vec: Vec2): Vec2 {
    return new Vec2(
      this.x + vec.x,
      this.y + vec.y,
    )
  }

  sub(vec: Vec2): Vec2 {
    return new Vec2(
      this.x - vec.x,
      this.y - vec.y,
    )
  }

  dot(vec: Vec2): number {
    return this.x * vec.x + this.y * vec.y
  }

  scale(scalar: number): Vec2 {
    return new Vec2(this.x * scalar, this.y * scalar)
  }
  
  entrywiseProduct(vec: Vec2): Vec2 {
    return new Vec2(
      this.x * vec.x,
      this.y * vec.y,
    )
  }
}

export { Vec2 }

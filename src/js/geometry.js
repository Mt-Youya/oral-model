const epsilon = 0.00000000001

export function isPointInPolygonV2(vertexes, point) {
  if (vertexes.length == 2) {
    // 矩形框：[左上角, 右下角]
    const [p1, p2] = vertexes
    const topLeft = [Math.min(p1[0], p2[0]), Math.min(p1[1], p2[1])]
    const bottomRight = [Math.max(p1[0], p2[0]), Math.max(p1[1], p2[1])]
    const isInRange = (v, min, max) => v >= min && v <= max
    return isInRange(point[0], topLeft[0], bottomRight[0]) && isInRange(point[1], topLeft[1], bottomRight[1])
  } else {
    let c = 0
    let i = 0
    const npol = vertexes.length
    let j = npol - 1
    const [x, y] = point
    for (; i < npol; i++) {
        if ((((vertexes[i][1] <= y) && (y < vertexes[j][1])) ||
            ((vertexes[j][1] <= y) && (y < vertexes[i][1]))) && 
            (x < (vertexes[j][0] - vertexes[i][0]) * (y - vertexes[i][1]) / (vertexes[j][1] - vertexes[i][1]) + vertexes[i][0])) {
            c = !c
        }
        j = i
    }
    return !!c
  }
}

/**
 * 
 * 这个实现有如下问题：
 * 当射线穿过多边形顶点时，结果不正确
 * 
 * @param {*} vertexes 多边形顶点
 * @param {*} point 检测点
 * @returns 
 */
export function isPointInPolygon(vertexes, point) {
    if (vertexes.length == 2) {
      // 矩形框：[左上角, 右下角]
      const [p1, p2] = vertexes
      const topLeft = [Math.min(p1[0], p2[0]), Math.min(p1[1], p2[1])]
      const bottomRight = [Math.max(p1[0], p2[0]), Math.max(p1[1], p2[1])]
      const isInRange = (v, min, max) => v >= min && v <= max
      return isInRange(point[0], topLeft[0], bottomRight[0]) && isInRange(point[1], topLeft[1], bottomRight[1])
    } else {
      // 点是否在任意多边形内
      const ray = new Ray(point, 0)
      let count = 0
      for (let i = 0; i < vertexes.length; i++) {
        const lineSegment = new LineSegment(vertexes[i], vertexes[i != 0 ? i - 1 : vertexes.length - 1])
        if (lineSegment.isInLine(ray.start)) {
            // 点在边上
            return false
        }
        const factor1 = ray.a*lineSegment.b - lineSegment.a*ray.b
        const factor2 = ray.c*lineSegment.b - lineSegment.c*ray.b
        if (!equalWithFloatPrecision(factor1, 0)) {
            // 仅有一个交点
            const x = -factor2 / factor1
            if (ray.isInRangeX(x) && lineSegment.isInRangeX(x)) {
                count++
            }
        }
      }
      return count & 1 == 1 // 奇数
    }
  }

  function equalWithFloatPrecision(a, b) {
    return Math.abs(a - b) < epsilon
  }

  /**
   * 
   * 过 start 点向右的射线，包含 start 端点
   * 
   */
  class Ray {
    constructor(start, slop) {
        this.a = 0
        this.b = 1
        this.c = -start[1]
        this.start = start
        this.end = undefined
    }

    isInRangeX(px) {
        return px > this.start[0] || (equalWithFloatPrecision(px, this.start[0]))
    }
  }

  /**
   * 
   * 线段包含 start 端点，不包含 end 端点
   * 
   */
  class LineSegment {
    constructor(start, end) {
        const [x1, y1] = start
        const [x2, y2] = end
        this.a = y2 - y1
        this.b = x1 - x2
        this.c = x2 * y1 - x1 * y2
        this.start = start
        this.includeStart = 
        this.end = end
    }

    isInLine(point) {
        const [x, y] = point
        return equalWithFloatPrecision(this.a * x + this.b * y + this.c, 0) && this.isInRangeX(x)
    }

    isInRangeX(px) {
        const [x1] = this.start
        const [x2] = this.end
        const xmin = Math.min(x1, x2)
        const xmax = Math.max(x1, x2)
        return (px > xmin && px < xmax) || (equalWithFloatPrecision(px, x1))
    }
  }
  
  // 计算多边形的 BBox 包围盒
  export function BBox(vertexes) {
    let xmin = null
    let xmax = null
    let ymin = null
    let ymax = null
    for (const vertex of vertexes) {
      const [x, y] = vertex
      if (xmin === null || xmin > x) {
        xmin = x
      }
      if (xmax === null || xmax < x) {
        xmax = x
      }
  
      if (ymin === null || ymin > y) {
        ymin = y
      }
      if (ymax === null || ymax < y) {
        ymax = y
      }
    }
    return [[xmin, ymin], [xmax, ymax]]
  }
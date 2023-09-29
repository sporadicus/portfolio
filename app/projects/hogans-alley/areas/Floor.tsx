'use client'
import { useRef, useEffect, useState } from 'react'
import { ClearCanvasLine, DrawCanvasLine } from '../types'
import * as cv from '../commonVals'

const groutColor = cv.twilight
const tileColor  = cv.black
const invertedGroutColor = cv.sky

// Bottom right canvas coords, based on vw: 1372 and vh: 1050
const xMax = 1202
const yMax = 75
const bottomCornerDimensions = [
  [82,4],
  [77,5],
  [71,5],
  [67,5],
  [61,5],
  [56,5],
  [51,4],
  [44,5],
  [38,5],
  [33,3],
  [28,5],
  [22,5],
  [17,4],
  [11,5],
  [6,5],
]

const groutLineDefs = [
  [9,5],   // [ line starting distance from top, line thickness ]
  [24,5],
  [43,3],
  [72,3],
]

export default function Floor ({isColorInverted}: {isColorInverted: boolean}) {
  // Make the canvas context stateful
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null)
  // Create a reference to the canvas DOM object
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Get the canvas context and save it in state
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) { return }

    canvas.width = xMax
    canvas.height = yMax

    const context = (canvas) ? canvas.getContext("2d") : null
    setCanvasContext(context)
  }, []);

  /**
   * Draw our diagonal canvas masterpiece
   */
  function draw() {
    // Ensure the canvas context exists
    if (!canvasContext) { return }

    // Draw background color of tiles
    const backgroundLine = {
      x: 0,
      y: 0,
      w: xMax,
      h: yMax,
      color: tileColor
    }
    drawCanvasLine(backgroundLine)

    // Draw the horizontal grout lines
    groutLineDefs.forEach(
      ([depth, height]) => {
        const lineSpecs = {
          x: 0,
          y: depth,
          w: xMax,
          h: height,
          color: (isColorInverted) ? invertedGroutColor : groutColor
        }
        drawCanvasLine(lineSpecs)
      }
    )

    // Clear areas to create diagonal line effect
    drawBottomDiagonals()
  }

  // Let's goooooo!
  draw()


  function drawBottomDiagonals () {
    // Tracks the number of px drawn in the y direction
    let distTraveledY = 0

    // Clear lines to create the diagonal effect
    bottomCornerDimensions.forEach(
      ([lineWidth, lineHeight]) => {

        // Set left-side clear dimensions
        const leftClearLine: ClearCanvasLine = {
          x: 0,
          y: distTraveledY,
          w: lineWidth,
          h: lineHeight,
        }

        // Adjust for right-side clear dimensions
        const rightClearLine: ClearCanvasLine = {
          ...leftClearLine,
          x: xMax - lineWidth + 2
        }

        // Clear left- and right-side lines
        clearCanvasLine(leftClearLine)
        clearCanvasLine(rightClearLine)

        // Update tracking of number of px cleared in x & y directions
        distTraveledY += lineHeight
      }
    )
  }

  function drawCanvasLine({ x, y, w, h, color }: DrawCanvasLine) {
    if (canvasContext) {
      canvasContext.fillStyle = color
      canvasContext.fillRect(x, y, w, h)
    }
  }

  function clearCanvasLine({ x, y, w, h }: ClearCanvasLine) {
    if (canvasContext) {
      canvasContext.clearRect(x, y, w, h)
    }
  }

  return (
    <canvas className="w-full h-full" ref={canvasRef}></canvas>
  )
}


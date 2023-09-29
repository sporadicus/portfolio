'use client'
import { useRef, useEffect, useState } from 'react'
import { DrawCanvasLine } from '../types'
import * as cv from '../commonVals'

const blockColor = cv.twilight
const maskColor  = cv.sky
const invertedBlockColor = cv.sky
const invertedMaskColor  = cv.pumpkin

// Bottom right canvas coords, based on reference values of vw: 1372 and vh: 1050
const xMax = 1202
const yMax = 75
const cornerBlockDimensions = [
  [6,5],
  [5,5],
  [5,4],
  [6,5],
  [5,5],
  [5,4],
  [5,5],
  [6,5],
  [7,5],
  [5,4],
  [5,5],
  [5,5],
  [6,4],
  [5,5],
  [5,5],
  [5,4],
]

export default function Ceiling ({isColorInverted}: {isColorInverted: boolean}) {
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
   *
   */
  function draw() {
    // Ensure the canvas context exists
    if (!canvasContext) { return }

    // Tracks the number of px drawn in the x & y directions
    let blockWrittenX = 0
    let blockWrittenY = 0

    // Prepare line object for drawing the initial block line
    const line = {
      x: blockWrittenX,
      y: -1,
      w: xMax,
      h: -1,
      color: ''
    }

    // Step thru block and mask draws for each horizontal height
    cornerBlockDimensions.forEach(
      ([ blockWidth, blockHeight ], idx) => {
          // Update the line object and draw the block line
          line.y = blockWrittenY
          line.h = blockHeight
          line.color = (isColorInverted) ? invertedBlockColor : blockColor
          drawCanvasLine(line)

          // Update the line object and draw the mask line
          line.x += blockWidth
          line.w -= (blockWidth * 2)
          // The last mask line has a different color
          line.color = (idx !== cornerBlockDimensions.length - 1)
            ? (isColorInverted) ? invertedMaskColor : maskColor
            : cv.black
          drawCanvasLine(line)

          // Update number of block px drawn in x & y directions
          blockWrittenX += blockWidth
          blockWrittenY += blockHeight
      }
    )
  }

  // Let's goooooo!
  draw()

  function drawCanvasLine({ x, y, w, h, color }: DrawCanvasLine) {
    if (canvasContext) {
      canvasContext.fillStyle = color
      canvasContext.fillRect(x, y, w, h)
    }
  }

  return (
    <canvas className="w-full h-full" ref={canvasRef}></canvas>
  )
}


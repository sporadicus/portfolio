'use client'
import { useRef, useEffect, useState } from 'react'
import { DrawCanvasLine, ScoreHatLineDimensions } from '../types'
import * as cv from '../commonVals'

// Bottom right canvas coords, based on reference values of vw: 1372 and vh: 1050
const xMax = 260
const yMax = 39
const lineDimensions: ScoreHatLineDimensions = [
  [[194,6]],    //  [ [line width, line height], ... ]
  [[216,6]],
  [[226,3]],
  [[236,5]],
  [[246,9]],
  [[260,10], [184,5], [194,5], [174,5]]
]

export default function ScoreHat () {
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
   * Draw our canvas masterpiece
   */
  function draw() {
    // Tracks the number of px drawn in the Y direction
    let pixelsWrittenY = 0

    // Initialize a line object
    let lineBuffer = {
      x: -1,
      y: -1,
      w: -1,
      h: -1,
      color: cv.white
    }

    lineDimensions.forEach(
      (lineDefs, idx) => {
        switch (idx) {

          // Draw only a single white line
          case 0: {
            const [[lineWidth, lineHeight]] = lineDefs
            lineBuffer = {
              ...lineBuffer,
              x: ((xMax - lineWidth) / 2),
              y: pixelsWrittenY,
              w: lineWidth,
              h: lineHeight,
            }
            // Draw the single line
            drawCanvasLine(lineBuffer)
            // Update num of Y pixels drawn
            pixelsWrittenY += lineHeight
            break;
          }

          // Draw a white line and then a gray line atop it
          case 1:
          case 2:
          case 3:
          case 4: {
            const [[lineWidth, lineHeight]] = lineDefs
            // Define the gray line
            const grayLine = {
              ...lineBuffer,
              y: pixelsWrittenY,
              h: lineHeight,
              color: cv.gray
            }

            // Define and draw the white line
            lineBuffer = {
              x: ((xMax - lineWidth) / 2),
              y: pixelsWrittenY,
              w: lineWidth,
              h: lineHeight,
              color: cv.white
            }
            drawCanvasLine(lineBuffer)

            // Draw the gray line
            drawCanvasLine(grayLine)

            // Update num of Y pixels drawn
            pixelsWrittenY += lineHeight
            break;
          }

          // Draw a white line, a gray line atop it, 2 white lines atop those
          //  and another gray line atop the latter of those
          case 5: {
            if (lineDefs.length !== 4) { break }
            const [
              [wOneWidth, wOneHeight],
              [wTwoWidth, wTwoHeight],
              [wThreeWidth, wThreeHeight],
              [gTwoWidth, gTwoHeight],
            ] = lineDefs

            // Define the first gray line
            const grayLineOne = {
              ...lineBuffer,
              y: pixelsWrittenY,
              h: wOneHeight,
              color: cv.gray
            }

            // Define and draw the first white line
            const whiteLineOne = {
              x: ((xMax - wOneWidth) / 2),
              y: pixelsWrittenY,
              w: wOneWidth,
              h: wOneHeight,
              color: cv.white
            }
            drawCanvasLine(whiteLineOne)

            // Draw the first gray line
            drawCanvasLine(grayLineOne)

            // Define and draw second white line
            const whiteLineTwo = {
              x: ((xMax - wTwoWidth) / 2),
              y: pixelsWrittenY,
              w: wTwoWidth,
              h: wTwoHeight,
              color: cv.white
            }
            drawCanvasLine(whiteLineTwo)

            // Update Y pixels drawn
            pixelsWrittenY += wTwoHeight

            // Define and draw third white line
            const whiteLineThree = {
              x: ((xMax - wThreeWidth) / 2),
              y: pixelsWrittenY,
              w: wThreeWidth,
              h: wThreeHeight,
              color: cv.white
            }
            drawCanvasLine(whiteLineThree)

            // Define and draw second gray line
            const grayLineTwo = {
              x: ((xMax - gTwoWidth) / 2),
              y: pixelsWrittenY,
              w: gTwoWidth,
              h: gTwoHeight,
              color: cv.gray
            }
            drawCanvasLine(grayLineTwo)
            break;
          }
        }
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
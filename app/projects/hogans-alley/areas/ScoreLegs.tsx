'use client'
import { useRef, useEffect, useState } from 'react'
import * as cv from '../commonVals'

// Bottom right canvas coords, based on reference values of vw: 1372 and vh: 1050
const xMax = 442
const yMax = 112

export default function ScoreLegs () {
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
  }, [])


  /**
   * Draw our canvas masterpiece
   */
  function draw () {
    /**
     * We'll start by creating the rear-more gray layer for the left leg, and
     *  then derive the other left leg layers from it
     */
    // ∆y values from bottom left to top left
    const grayStepsLeftY = [5,9,9,10,9,9,10,9,9,10,9,9,5]
    // Begin left side coordinates array with the starting point
    const grayStepsLeft = [
      [18, yMax],
    ]
    // Add points going "up the stairs", two at a time
    for (let i=0; i <= 12; i++) {
      // Destructure the previous point's coordinates
      const [prevPtX, prevPtY] = grayStepsLeft[grayStepsLeft.length - 1]

      // Move our line vertically (i.e. in the Y direction)
      grayStepsLeft.push([ prevPtX, prevPtY - grayStepsLeftY[i] ])

      // Now move our line horizontally (i.e. in the X direction)
      grayStepsLeft.push([ prevPtX + 5.25, prevPtY - grayStepsLeftY[i] ])
    }
    // Now add the "down the stairs" points by translating the up-the-stairs
    //  points shifted horizontally by 54px
    const grayStepsRight = grayStepsLeft.reduceRight(
      (accum, [leftPtX, leftPtY]) => {
        return [
          ...accum,
          [leftPtX + 54, leftPtY]
        ]
      }, [] as number[][]
    )
    // Combine the up- and down-the-stairs points into a single array
    const grayLeftRear = grayStepsLeft.concat(grayStepsRight)

    /**
     * Now derive the (left leg) black layer from the rear-more gray layer
     */
    const blackLeft = grayLeftRear.reduce(
      (accum, [refPtX, refPtY], idx) => {
        // Keep all points except those of index 23 thru 30
        accum = ((idx < 23) || (idx > 30))
          ? [...accum, [refPtX - 5.25, refPtY]]
          : accum
        return accum
      }, [] as number[][]
    )

    /**
     * Derive the (left leg) white layer from the rear-more gray layer
     */
    const whiteLeft = grayLeftRear.reduce(
      (accum, [refPtX, refPtY], idx) => {
        // Clone the reference point
        let [whitePtX, whitePtY] = [refPtX, refPtY]

        // On the way "up the stairs"...
        if (idx < 24) {
          // ...ALL new points translate toward the center: ∆x = +10.5
          whitePtX += 10.5

          // Points w/an even-numbered index...
          if (idx % 2 === 0) {
            // ...retain the Y value of the prior new point (except the starting point)...
            whitePtY = (accum.length)
              ? (accum[accum.length - 1])[1]
              : whitePtY

          }
          // ...while points w/an odd-numbered index...
          else {
            // ...translate upward either 4px or 5px
            whitePtY = ((idx - 1) % 3)    // i.e. if idx != 4, 7, 10, &c.
              ? whitePtY - 5
              : whitePtY - 4
          }

          return [...accum, [whitePtX, whitePtY]]
        }
        // On the way "down the stairs"...
        else if (idx > 25) {
          // ...all new points translate AWAY from the center: ∆x = -5.25px,
          //  but don't change in the Y axis
          return [...accum, [whitePtX - 5.25, whitePtY]]
        }

        // The 26th & 27th points are omitted, so return the accumulator unchanged
        return accum
      }, [] as number[][]
    )

    /**
     * Derive the forward-more (left leg) gray layer from the white layer
     */
    const grayLeftForwardLeft = whiteLeft.reduce(
      (accum, refPt, idx) => {
        // We only need the first 24 points from white leg
        if (idx > 23) { return accum }

        // Destructure reference point from white left leg
        const [refPtX, refPtY] = refPt

        // Our "up the stairs" points simply translate the reference point's
        //  X-value center-ward 5.25px
        return [...accum, [refPtX + 5.25, refPtY]]
      }, [] as number[][]
    )
    // Derive the down-the-steps points from the up-the-steps points
    const grayLeftForwardRight = [...grayLeftForwardLeft].reverse().map(
      ([leftTwinX, leftTwinY]) => {
        return [leftTwinX + 26.25, leftTwinY]
      }
    )
    // Concatenate to make forward-more gray layer
    const grayLeftForward = grayLeftForwardLeft.concat(grayLeftForwardRight)


    /**
     * Each layer in the right leg is the mirror opposite of those in the left
     *  leg, with the vertical center of the scoreboard as the line of symmetry.
     *  So the mirrored points will only translate in the X direction
     */
    const blackRight = mirrorStepsLayer(blackLeft)
    const grayRightRear = mirrorStepsLayer(grayLeftRear)
    const whiteRight = mirrorStepsLayer(whiteLeft)
    const grayRightForward = mirrorStepsLayer(grayLeftForward)

    // Draw black steps
    drawSteps(blackLeft, cv.black)
    drawSteps(blackRight, cv.black)

    // Draw lower gray steps
    drawSteps(grayLeftRear, cv.gray)
    drawSteps(grayRightRear, cv.gray)

    // Draw white steps
    drawSteps(whiteLeft, cv.white)
    drawSteps(whiteRight, cv.white)

    // Draw upper gray steps
    drawSteps(grayLeftForward, cv.gray)
    drawSteps(grayRightForward, cv.gray)
  }

  // Let's goooooo!
  draw()

  /**
   * Return an array of coordinates whose y-coords equal the corresponding given
   *  y-coordinates, but whose x-coords are mirrored wrt the vertical center
   *  of the scoreboard
   *
   * @param {number[][]} layerToMirror
   * @returns {number[][]}
   */
  function mirrorStepsLayer (layerToMirror: number[][]) {
    return layerToMirror.map(
      ([ptX, ptY]) => {
        return [xMax - ptX, ptY]
      }
    )
  }

  /**
   * Draw a canvas figure using the given array of coordinates, then fill the
   *  figure with the given color
   *
   * @param {number[][]} pointsSet
   * @param {string} color
   */
  function drawSteps(pointsSet: number[][], color: string) {
    if (canvasContext) {
      const [startPointX, startPointY] = pointsSet[0]

      canvasContext.fillStyle = color
      canvasContext.beginPath()
      canvasContext.moveTo(startPointX, startPointY)

      pointsSet.forEach(
        ([pointX, pointY], idx) => {
          // Skip the starting point as we've already moved there
          if (idx === 0) { return }

          // Draw the next line
          canvasContext.lineTo(pointX, pointY)
        }
      )

      // Complete the figure and fill it with the given color
      canvasContext.closePath()
      canvasContext.fill()
    }
  }

  return (
    <canvas className="w-full h-full" ref={canvasRef}></canvas>
  )
}
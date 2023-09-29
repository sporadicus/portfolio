import { MutableRefObject } from 'react'
import Image from 'next/image'
import { NumeralString } from '../types'
import { ledNumerals } from '../imageImports'
import equals from '../../../../public/hogans-alley/led/=.png'
import rSign from '../../../../public/hogans-alley/led/R.png'

export default function ScoreRoundCt ( {roundCount}: {roundCount: MutableRefObject<number>} ) {
  // Treat rounds 1-9 as the default setting
  let displayEqualsSign = true
  let tensPlace = rSign

  // Ensure the argument is an integer and convert it to a string
  const roundAsString = String(Math.trunc(roundCount.current))

  // Isolate the digit from the ones place
  const onesDigit = roundAsString.slice(-1) as NumeralString

  // If the round count is in double digits...
  if (roundCount.current > 9) {
    // ...don't display the equals sign...
    displayEqualsSign = false

    // ...and display the digit from the tens place instead of the 'R' sign
    const tensDigitString = roundAsString.slice(-2, -1) as NumeralString
    tensPlace = ledNumerals[tensDigitString]
  }

  return (
    <div className={`px-[22.9%] grid grid-cols-round-count`}>
      <Image src={tensPlace} alt="" className="col-span-1-2"></Image>
      {(displayEqualsSign) && <Image src={equals} alt="" className="col-span-2-3"></Image>}
      <span className="col-span-3-4"></span>
      <Image src={ledNumerals[onesDigit]} alt="" className="col-span-4-5"></Image>
    </div>
  )
}
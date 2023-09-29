import Image from 'next/image'
import { NumeralString } from '../types'
import { scoreCounterNumerals } from '../imageImports'

export default function ScoreOdometer ( {scoreValue}: {scoreValue: number} ) {
  // Ensure given score is an integer, then stringify it, padding it out to
  //  a length of six digits if necessary
  const scoreString = String(Math.floor(scoreValue)).padStart(6,'0')

  // Break score string into constituent place values, in reverse order
  const placeValsReversed = Array.from(scoreString).reverse()

  // Keep only the "ones" value thru the "hundred-thousands" value
  const scoreInReverse = placeValsReversed.splice(0, 6) as NumeralString[]

  return (
    <span className={`grid grid-cols-score-chars justify-between`}>
      <Image src={scoreCounterNumerals[scoreInReverse[5]]} alt="" className=""></Image>
      <Image src={scoreCounterNumerals[scoreInReverse[4]]} alt="" className=""></Image>
      <Image src={scoreCounterNumerals[scoreInReverse[3]]} alt="" className=""></Image>
      <Image src={scoreCounterNumerals[scoreInReverse[2]]} alt="" className=""></Image>
      <Image src={scoreCounterNumerals[scoreInReverse[1]]} alt="" className=""></Image>
      <Image src={scoreCounterNumerals[scoreInReverse[0]]} alt="" className=""></Image>
    </span>
  )
}
import Image from 'next/image'
import { NumeralString } from '../types'
import { missCounterNumerals } from '../imageImports'
import equals from '../../../../public/hogans-alley/missCounter/equals_miss.png'
import miss from '../../../../public/hogans-alley/missCounter/MISS_miss.png'


export default function ScoreMissTally ( {missTally}: {missTally: number} ) {
  // Ensure the argument is an integer, convert it to a string, and keep only
  //  the digit from the ones place
  const onesDigit = String(Math.trunc(missTally)).slice(-1) as NumeralString

  // The tens place holds '=' unless the player has reached 10+ misses
  const tensPlace = (missTally >= 10) ? missCounterNumerals[1] : equals

  return (
    <div className={`grid grid-cols-miss-tally`}>
      <Image src={miss} alt="Miss" className="col-span-1-2"></Image>
      <span className="col-span-2-3"></span>
      <Image src={tensPlace} alt="" className="col-span-3-4"></Image>
      <span className="col-span-4-5"></span>
      <Image src={missCounterNumerals[onesDigit]} alt="" className="col-span-5-6"></Image>
      <span className="col-span-6-7"></span>
    </div>
  )
}
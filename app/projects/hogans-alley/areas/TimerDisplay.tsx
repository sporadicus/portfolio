import Image from 'next/image'
import { NumeralString } from '../types'
import { ledNumerals } from '../imageImports'
import decimalPoint from '../../../../public/hogans-alley/led/decimalPoint.png'

export default function TimerDisplay ( {durationInMS}: {durationInMS: number} ) {
  // Treat a duration of 0 as meaning there's not currently a timer to show
  const isDisplayOn = (durationInMS !== 0)

  // Isolate the ones and tenths place values
  const [onesDigit, tenthsDigit] = String(durationInMS).slice(-4, -2).split('') as NumeralString[]

  return (
    <div className={`py-[5.5%] px-[9.3%] grid grid-cols-timer-display`}>
      { (isDisplayOn) &&
        <>
          <Image src={ledNumerals[onesDigit]} alt="" className="col-span-1-2"></Image>
          <Image src={decimalPoint} alt="" className="col-span-2-3"></Image>
          <Image src={ledNumerals[tenthsDigit]} alt="" className="col-span-3-4"></Image>
        </>
      }
    </div>
  )
}
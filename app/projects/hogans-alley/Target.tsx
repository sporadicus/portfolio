import {
  forwardRef,
  ForwardedRef,
 } from 'react'
import Image from 'next/image'
import { TargetProps } from './types'
import { targetsFrontOn } from './imageImports'
import angledWhite from '../../../public/hogans-alley/Target45white.png'
import angledGray from '../../../public/hogans-alley/Target45gray.png'
import facingAway from '../../../public/hogans-alley/TargetAway.png'
import sideOn from '../../../public/hogans-alley/TargetOnEdge.png'
import stand from '../../../public/hogans-alley/Stand.png'


const Target = forwardRef((props: TargetProps, ref: ForwardedRef<HTMLDivElement>) => {
  // Destructure the props
  const { targetHandle, targetSlot, tagTarget } = props

  // Assign a 'left' CSS value using one of the Tailwind classes:
  //  'left-slot-0', 'left-slot-1', or 'left-slot-2'
  // ¡ NB: the above comment line is required for Tailwind to load these classes !
  const leftShift = `left-slot-${targetSlot}`

  // Process statuses of this Target
  const statusNames = Object.keys(status)
  const activeStatuses = statusNames.reduce(
    (accum, statusName) => {
      // If the named status (e.g. 'isBaddie') is true...
      if (status[statusName as keyof typeof status]) {
        // ...add it to the accumulator
        accum.push(statusName)
      }
      return accum
    }, [] as string[]
  )
  .join(' ')

  /**
   * Broker function to facilitate passing the Target's slot as a parameter
   */
  function tagCallback () {
    tagTarget(targetSlot)
  }

  return (
    <div
      className={`target slot-${targetSlot} ${activeStatuses} w-[12.4vw] absolute bottom-0 ${leftShift} z-10 grid grid-cols-1 grid-rows-target-and-stand justify-items-center`}
      ref={ref}
      onClick={tagCallback}
    >
        <Image
          src={sideOn}
          alt=""
          className="sideOn opacity-100 w-[0.7vw] h-[19.1vw] row-span-1-2 col-span-1-2"
        />
        <Image
          src={angledWhite}
          alt=""
          className="angledWhite opacity-0 w-[6.3vw] h-[19.1vw] row-span-1-2 col-span-1-2"
        />
        <Image
          src={angledGray}
          alt=""
          className="angledGray opacity-0 w-[6.3vw] h-[19.1vw] row-span-1-2 col-span-1-2"
        />
        <Image
          src={facingAway}
          alt=""
          className="facingAway opacity-0 w-[11.88vw] h-[19.1vw] row-span-1-2 col-span-1-2"
        />
        <Image
          src={targetsFrontOn[targetHandle]}
          alt=""
          className="facingForward opacity-0 w-[12.4vw] h-[19.1vw] row-span-1-2 col-span-1-2"
        />
        <Image
          src={stand}
          alt=""
          className="w-[2.9vw] row-span-2-3 col-span-1-2"
        />
    </div>
  )
})
Target.displayName = 'Target';
export default Target

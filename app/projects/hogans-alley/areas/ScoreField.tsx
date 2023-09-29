import Image from 'next/image'
import currScore from '../../../../public/hogans-alley/_SCORE.png'
import topScore from '../../../../public/hogans-alley/_TOP.png'
import { PropsWithChildren } from 'react'
import { ScoreFieldProps } from '../types'

export default function ScoreField ( props: PropsWithChildren<ScoreFieldProps> ) {
  // Destructure props
  const {children, scoreType} = props

  // For reasons unclear to your author, the original game has differently-sized
  //  left and right padding around the high score display (but not the current
  //  player score display) ¯\_(ツ)_/¯
  let scoreLabelPadding
  let scoreLabel

  if (scoreType === 'current') {
    scoreLabelPadding = `pl-[5.3%] pr-[5.3%]`
    scoreLabel = currScore
  }
  else {
    scoreLabelPadding = `pl-[3.6%] pr-[7.0%]`
    scoreLabel = topScore
  }

  return (
    <div className={`bg-black grid grid-rows-score-field h-full w-full pt-[2.8%] pb-[1.8%] ${scoreLabelPadding}`}>
      <span className="row-span-1-2 h-full w-full">
        {children}
      </span>
      <span className="row-span-3-4 h-full w-full">
        <Image src={scoreLabel} alt="" className="h-full w-full"></Image>
      </span>
    </div>
  )
}
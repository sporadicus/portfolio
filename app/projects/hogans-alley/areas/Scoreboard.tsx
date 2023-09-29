'use client'
import { ScoreBoardProps } from '../types'
import ScoreLegs from './ScoreLegs'
import ScoreBlock from './ScoreBlock'
import ScoreField from './ScoreField'
import ScoreOdometer from './ScoreOdometer'
import ScoreMissTally from './ScoreMissTally'
import ScoreRoundCt from './ScoreRoundCt'

export default function Scoreboard(props: ScoreBoardProps) {
  // Destructure props
  const { highScore, currentScore, missTally, roundCount } = props

  return (
    <div className="scoreboard h-[17.81%] w-full bg-gray grid grid-cols-scoreboard grid-rows-scoreboard">
      <div className="row-span-1-2 col-span-1-2 grid grid-rows-score-block-silo">
        <div className="bg-white row-span-1-2"></div>
      </div>
      <div className="row-span-1-2 col-span-2-3 grid grid-rows-score-block-silo">
        <div className="bg-white row-span-1-2"></div>
        <ScoreBlock>
          <ScoreField scoreType="current">
            <ScoreOdometer scoreValue={currentScore}></ScoreOdometer>
          </ScoreField>
        </ScoreBlock>
      </div>
      <div className="row-span-1-2 col-span-3-4 grid grid-rows-score-block-silo">
        <div className="bg-white row-span-1-2"></div>
      </div>
      <div className="row-span-1-2 col-span-4-5 bg-black grid grid-cols-round-miss grid-rows-round-miss">
        <div className="col-span-1-3 row-span-1-2 bg-white"></div>
        <div className="col-span-1-3 row-span-2-3 bg-gray"></div>
        <div className="col-span-4-6 row-span-1-2 bg-white"></div>
        <div className="col-span-4-6 row-span-2-3 bg-gray"></div>

        <div className="col-span-3-4 row-span-1-4 pt-[3.3%] pb-[2.1%] grid grid-rows-round-miss-rows">
          <ScoreRoundCt roundCount={roundCount}></ScoreRoundCt>
          <div className=""></div>
          <ScoreMissTally missTally={missTally}></ScoreMissTally>
        </div>

        <div className="col-span-1-2 row-span-3-4 p-[7.1%] grid grid-rows-vents">
          <span className="row-span-1-2 bg-white grid grid-cols-subvents-left grid-rows-subvents-a">
            <span className="col-span-2-3 row-span-2-3 bg-gray"></span>
          </span>
          <span></span>
          <span className="row-span-3-4 bg-white grid grid-cols-subvents-left grid-rows-subvents-b">
            <span className="col-span-2-3 row-span-2-3 bg-gray"></span>
          </span>
          <span></span>
          <span className="row-span-5-6 bg-white grid grid-cols-subvents-left grid-rows-subvents-b">
            <span className="col-span-2-3 row-span-2-3 bg-gray"></span>
          </span>
          <span></span>
          <span className="row-span-7-8 bg-white grid grid-cols-subvents-left grid-rows-subvents-a">
            <span className="col-span-2-3 row-span-2-3 bg-gray"></span>
          </span>
          <span></span>
          <span className="row-span-9-10 bg-white grid grid-cols-subvents-left grid-rows-subvents-b">
            <span className="col-span-2-3 row-span-2-3 bg-gray"></span>
          </span>
        </div>
        <div className="col-span-5-6 row-span-3-4 p-[7.1%] grid grid-rows-vents">
          <span className="row-span-1-2 bg-white grid grid-cols-subvents-right grid-rows-subvents-a">
            <span className="col-span-1-2 row-span-2-3 bg-gray"></span>
          </span>
          <span></span>
          <span className="row-span-3-4 bg-white grid grid-cols-subvents-right grid-rows-subvents-b">
            <span className="col-span-1-2 row-span-2-3 bg-gray"></span>
          </span>
          <span></span>
          <span className="row-span-5-6 bg-white grid grid-cols-subvents-right grid-rows-subvents-b">
            <span className="col-span-1-2 row-span-2-3 bg-gray"></span>
          </span>
          <span></span>
          <span className="row-span-7-8 bg-white grid grid-cols-subvents-right grid-rows-subvents-a">
            <span className="col-span-1-2 row-span-2-3 bg-gray"></span>
          </span>
          <span></span>
          <span className="row-span-9-10 bg-white grid grid-cols-subvents-right grid-rows-subvents-b">
            <span className="col-span-1-2 row-span-2-3 bg-gray"></span>
          </span>
        </div>
        <div className="col-span-1-6 row-span-1-6">
          <ScoreLegs></ScoreLegs>
        </div>
      </div>
      <div className="row-span-1-2 col-span-5-6 grid grid-rows-score-block-silo">
        <div className="bg-white row-span-1-2"></div>
      </div>
      <div className="row-span-1-2 col-span-6-7 grid grid-rows-score-block-silo">
        <div className="bg-white row-span-1-2"></div>
        <ScoreBlock>
          <ScoreField scoreType="high">
            <ScoreOdometer scoreValue={highScore}></ScoreOdometer>
          </ScoreField>
        </ScoreBlock>
      </div>
      <div className="row-span-1-2 col-span-7-8 grid grid-rows-score-block-silo">
        <div className="bg-white row-span-1-2"></div>
      </div>
    </div>
  )
}
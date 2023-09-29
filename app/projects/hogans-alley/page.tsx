'use client'

import {
  useState,
  useRef,
 } from 'react'
import Room from "./Room"
import Scoreboard from "./areas/Scoreboard"


export default function Page () {
  // Stateful storage of player's game information
  const [highScore, setHighScore] = useState(12000)
  const [currentScore, setCurrentScore] = useState(0)
  const [missTally, setMissTally] = useState(0)
  const roundCounter = useRef(1)

  return (
    <div className="aspect-[98/75]">
      <Room
        setHighScore={setHighScore}
        setCurrentScore={setCurrentScore}
        setMissTally={setMissTally}
        roundCount={roundCounter}
      ></Room>
      <Scoreboard
        highScore={highScore}
        currentScore={currentScore}
        missTally={missTally}
        roundCount={roundCounter}
      ></Scoreboard>
    </div>
  )
}
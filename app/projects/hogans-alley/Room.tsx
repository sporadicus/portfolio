'use client'

import {
  useState,
  useEffect,
  useRef,
  MutableRefObject,
  } from 'react'
import Image from 'next/image'
import {
  TargetHandle,
  TargetState,
  TargetStates,
  TargetStateResets,
  SlotLocation,
  } from './types'
import * as animation from './animations'
import { targetHandles } from './commonVals'
import { RoomProps } from './types'
import Ceiling from './areas/Ceiling'
import Floor from './areas/Floor'
import ScoreHat from './areas/ScoreHat'
import TimerDisplay from './areas/TimerDisplay'
import Target from './Target'
import { nanoid } from 'nanoid'
import missSign from '../../../public/hogans-alley/missSign.png'

// Default settings for a new Target State
const newTargetStateDefaults = {
  slot: 0,
  pointValue: -1,
  isBaddie: false,
  isSpinning: false,
  hasBeenTagged: false,
  spinAnime: null,
  blinkAnime: null,
} as TargetStateResets


function getTimerDuration(round: number) {
  const uniqueTimerDurations = [2500,2000,1500,2000,1500,1200,2000,1800,1500,1800,1400,1200,2000,1600,1200,1800,1400,1000,1500,1200,900,1400,1100,800]
  const cycledTimerDurations = [1300,1000,700,1200,900,600]

  // There's no pattern for the first 24 rounds, so we use a lookup table
  if (round <= 24) {
    return uniqueTimerDurations[round - 1]
  }

  // From round 25 onward, we cycle through a set of 6 timer durations
  const cycleIndex = (round - 25) % 6
  return cycledTimerDurations[cycleIndex]
}

export default function Room (props: RoomProps) {
  // Destructure props
  const { setHighScore,
          setCurrentScore,
          setMissTally,
          roundCount, } = props

  // Stateful storage related to target taggability
  const areTargetsTaggable = useRef(false)
  const [taggedTarget, setTaggedTarget] = useState<TargetState|null>(null)

  // Track the current index into timer durations list
  const timerDurationIndex = useRef(0)
  const [timerDisplayValue, setTimerDisplayValue] = useState(0)

  // Stateful storage related to round tracking
  const roundTimeoutId = useRef<NodeJS.Timeout|null>(null)
  const isPreFirstRound = useRef(true)

  // Stateful flags for various conditions within a round
  const [isGoClicked, setIsGoClicked] = useState(false)
  const [isTimerExpired, setIsTimerExpired] = useState(false)
  const [isColorInverted, setIsColorInverted] = useState(false)
  const [isInnocentTagged, setIsInnocentTagged] = useState(false)

  // Stateful storage of enter slide & exit slide components
  const [enterComponents, setEnterComponents] = useState<JSX.Element[]|null>(null)
  const [stageComponents, setStageComponents] = useState<JSX.Element[]|null>(null)
  const [exitComponents, setExitComponents] = useState<JSX.Element[]|null>(null)
  const enterSlideRef = useRef<HTMLDivElement|null>(null)
  const stageRef = useRef<HTMLDivElement|null>(null)
  const exitSlideRef = useRef<HTMLDivElement|null>(null)

  // Stateful storage of data for each of the 3 active Targets
  const targetStates = useRef<TargetStates>({
    0: { ...getNewTargetState(useRef<HTMLDivElement|null>(null)) },
    1: { ...getNewTargetState(useRef<HTMLDivElement|null>(null)) },
    2: { ...getNewTargetState(useRef<HTMLDivElement|null>(null)) },
  })


  /**
   * Return a new Target State object comprising default Target State properties
   *  and the given DOM ref object
   *
   * @param {MutableRefObject<HTMLDivElement>} domRef
   * @return {*}
   */
  function getNewTargetState (domRef: MutableRefObject<HTMLDivElement|null>) {
    return (
      {
        ...newTargetStateDefaults,
        domRef,
      } as TargetState
    )
  }

  /**
   * Reset the constituent Target information contained in 'targetStates'
   *
   * @returns {void}
   */
  function resetTargetStates () {
    // Mutate 'targetStates' to reset all values
    Object.values(targetStates.current).forEach(
      (targetState, idx) => {
        // Ensure idx is a valid slot location
        const slot: SlotLocation = ((idx === 0) || (idx === 1) || (idx === 2)) ? idx : 2

        targetState = { ...newTargetStateDefaults, domRef: targetState.domRef }
        targetState.domRef.current = document.createElement("div")
        targetStates.current[slot] = targetState
      }
    )
  }


  /**
   * External actions to take during the preRound state
   */
  useEffect( () => {
    // The only dependencies we want to react to are these; ignore any other
    if ((exitComponents === null) && (!isGoClicked)) { return }

    // Unset the isGoClicked flag
    setIsGoClicked( false )

    // Create an array comprised of three random, unique target handles that
    //  includes exactly 1 baddie in the early rounds, and 1 or 2 in later rounds
    let nextTargetsHandles: TargetHandle[] = ['coppa', 'coppa', 'coppa']
    let invalidCombo = true
    while (invalidCombo) {
      // Clone the list of possible targets
      const targetPool = [...Object.keys(targetHandles)]
      nextTargetsHandles = Array.from(Array(3)).map(
        () => {
          // Randomly choose the index of one available target from the pool
          const randomIndex = Math.floor(Math.random() * targetPool.length)

          // Splice the corresponding target from target pool and return it
          return (targetPool.splice(randomIndex, 1)[0]) as TargetHandle
        }
      )

      // Count number of baddies in this trio of target handles
      const numOfBaddies = countBaddies(nextTargetsHandles)

      // If there's 1 baddie -OR- if it's after round 5 and there are 2 baddies,
      //  then this combination of targets is valid
      invalidCombo = (numOfBaddies === 1) || ( (roundCount.current > 5) && (numOfBaddies === 2) )
        ? false
        : true
    }

    // Reset target states for re-use
    resetTargetStates()

    // Create new incoming Target components and add them to the enter slide
    const incomingTargets = nextTargetsHandles.map(
      (handle, idx) => {
        // Ensure slotName is 0, 1, or 2
        const slotName = ((idx === 0) || (idx === 1) || (idx === 2)) ? idx : 2

        // Update this Target's state
        const pointValue = targetHandles[handle]
        targetStates.current[slotName] = {
          ...targetStates.current[slotName],
          slot: slotName,
          pointValue,
          isBaddie: (pointValue > 0),
        }

        return (
          <Target
            targetHandle={handle}
            targetSlot={slotName}
            tagTarget={tagTarget}
            key={nanoid()}
            ref={targetStates.current[slotName].domRef}
          ></Target>
        )
      }
    )
    setEnterComponents(incomingTargets)
  }, [exitComponents, isGoClicked])


  /**
   * External actions to take during the goForSceneChange state
   */
  useEffect( () => {
    // Create an async wrapper function in order to use 'await'
    async function goForSceneChange () {
      // If the value of the triggering state is currently null, do nothing
      if (enterComponents === null) { return }

      // Increment round counter unless we're just entering round 1
      if (isPreFirstRound.current === false) {
        roundCount.current += 1
      }
      // Otherwise, this is round 1, so unset the isGoClicked flag
      else {
        isPreFirstRound.current = false
      }

      // Animate the entry of incoming and exit of outgoing Targets
      const sceneChangeAnimation = animation.getSceneChange(enterSlideRef.current, exitSlideRef.current)
      sceneChangeAnimation.play()
      // The timer display is updated 1.75s after the scene change animation starts
      setTimeout(
        // When this timeout expires, update the Timer display value
        () => setTimerDisplayValue(getTimerDuration(roundCount.current)), 1750
      )
      await sceneChangeAnimation.finished

      // 'Copy' incoming Targets from enter slide to stage
      setStageComponents(enterComponents)
      // Remove incoming Targets from enter slide
      setEnterComponents(null)
      // Remove outgoing Targets from exit slide
      setExitComponents(null)
    }

    // Call the async wrapper function
    goForSceneChange()

  }, [enterComponents])


  /**
   * External actions to take at the start of the tagginTime state
   */
  useEffect( () => {
    // Create an async wrapper function in order to use 'await'
    async function tagginTime () {
      // If the value of the triggering state is currently null, do nothing
      if (stageComponents === null) { return }

      // Reset the enter & exit slides to their starting locations
      animation.getResetSlides(enterSlideRef.current, exitSlideRef.current)

      // Animate rotation of on-stage Targets to face forward
      const trioTurnsForwardAnimation = animation.getTurnTargetToFront(stageRef.current)
      await trioTurnsForwardAnimation.finished

      // Start the round timer
      roundTimeoutId.current = setTimeout(
        // When round timer expires, change stage phase
        () => setIsTimerExpired(true),
        getTimerDuration(roundCount.current)
      )

      // Enable target tagging
      areTargetsTaggable.current = true
    }

    // Call the async wrapper function
    tagginTime()

  }, [stageComponents])


  /**
   * External actions to take during the endOfRoundActivity state
   */
  useEffect( () => {
    // The useEffect() hook requires us to list stageComponents as a dependency,
    //  though it isn't one to which we want to react. Only proceed if one of
    //  the other dependencies is active
    if ((!isInnocentTagged) && (!isTimerExpired)) { return }

    // Reset isInnocentTagged flag
    setIsInnocentTagged(false)

    // Create an async wrapper function in order to use 'await'
    async function endOfRoundActivity () {
      // Disable target tagging
      areTargetsTaggable.current = false

      // If timer state shows expired, reset that state on next render
      if (isTimerExpired) { setIsTimerExpired(false) }

      //  Create Target arrays of (a) un-tagged baddies and (b) non-spinners
      const spinningBaddies: TargetState[] = []
      const untaggedBaddies: TargetState[] = []
      const nonSpinningTargets: TargetState[] = []
      // Step thru each slot location
      Array.from([0, 1, 2] as SlotLocation[]).forEach(
        (slot) => {
          // Get this particular target's state
          const targetState = targetStates.current[slot]

          // Store the Target in this slot as either spinning or not
          if (targetState.isSpinning) {
            spinningBaddies.push(targetState)
          }
          else {
            nonSpinningTargets.push(targetState)
          }

          // If the Target in this slot is a baddie that wasn't tagged, store it
          if ( (targetState.isBaddie) && (!targetState.hasBeenTagged) ) {
            untaggedBaddies.push(targetState)
          }
        }
      )

      // Turn all non-spinning targets to side
      const targetsTurnToSide = animation.getTurnTargetToSide(nonSpinningTargets)
      await targetsTurnToSide.finished

      // Deal with any baddies that were not tagged
      if (untaggedBaddies) {
        // Stop the spinning of any baddies that were tagged...
        spinningBaddies.forEach(baddie => baddie.spinAnime?.pause())
        // ...and then snap them to side
        animation.getSnapTargetToSide(spinningBaddies)

        // Invert the room colors (in the case where they aren't already)
        setIsColorInverted(true)

        // Process each missed baddie one at a time
        for (let missedBaddie of untaggedBaddies) {
          // Baddie snaps to front
          const baddieSnapFront = animation.getSnapTargetToFront([missedBaddie])
          baddieSnapFront.play()
          await baddieSnapFront.finished
          baddieSnapFront.pause()

          // Increment the player's miss counter
          setMissTally( prev => prev + 1 )

          // Baddie & stand blink 6 times; "Miss!" blinks indefinitely
          const blinkTarget = animation.getBlinkTarget(missedBaddie, 6)
          const blinkTargetMiss = animation.getBlinkTargetMiss(missedBaddie)
          blinkTargetMiss.play()
          await blinkTarget.finished

          // Baddie turns to side
          const targetTurningToSide = animation.getTurnTargetToSide([missedBaddie])
          await targetTurningToSide.finished

          // Store "Miss!" blinking animation instance for later stopping
          missedBaddie.blinkAnime = blinkTargetMiss
        }
      }

      // Snap any spinning baddies to side (i.e. if all Baddies were tagged)
      animation.getSnapTargetToSide(spinningBaddies)

      // Stop any blinking "Miss!" signs
      Array.from([0, 1, 2] as SlotLocation[]).forEach(
        (slot) => {
          const targetState = targetStates.current[slot]
          if (targetState.blinkAnime !== null) {
            targetState.blinkAnime.pause()
            targetState.blinkAnime.seek(0)
          }
        }
      )

      // Revert room colors to normal
      setIsColorInverted(false)

      // IF player has 10+ misses, game is over


      // OTHERWISE, increment the timer duration index...
      timerDurationIndex.current += 1
      // ...pause briefly...
      await new Promise((resolve) => setTimeout(resolve, 2000))
      // ...'copy' outgoing Targets from stage to exit slide...
      setExitComponents(stageComponents)
      // ...and remove outgoing Targets from stage
      setStageComponents(null)
    }

    // Call the async wrapper function
    endOfRoundActivity()

  }, [isInnocentTagged, isTimerExpired, stageComponents, setMissTally])


  /**
   * External actions to take during the targetTagged state
   */
  useEffect( () => {
    // Create an async wrapper function in order to use 'await'
    async function targetTagged () {
      // If the value of the triggering state is currently null, do nothing
      if (taggedTarget === null) { return }

      // IF this tagged target is a baddie...
      if (taggedTarget?.isBaddie) {
        // ...but has already been tagged, ignore the tag
        if (taggedTarget.hasBeenTagged) {
          // Clear the currently tagged target
          setTaggedTarget(null)
          return
        }

        // Start the baddie spinning and save the animation for later stopping
        taggedTarget.spinAnime = animation.getSpinBaddie(taggedTarget)
        // Mark the target as spinning and having been tagged
        taggedTarget.isSpinning = true
        taggedTarget.hasBeenTagged = true

        // ...increase player's score by appropriate amount
        setCurrentScore( prevScore => prevScore + taggedTarget.pointValue)

        // Return to allow more tagging if time allows
        return
      }


      // OTHERWISE an innocent was tagged, so stop the timer...
      (roundTimeoutId.current) && clearTimeout(roundTimeoutId.current)

      // ...disable tagging for all targets...
      areTargetsTaggable.current = false;

      // ...invert room colors...
      setIsColorInverted(true)

      // ...increment the player's miss counter...
      setMissTally( prev => prev + 1 )

      // ...blink innocent+stand and "Miss!" sign...
      const blinkTarget = animation.getBlinkTarget(taggedTarget, 6)
      const blinkTargetMiss = animation.getBlinkTargetMiss(taggedTarget)
      blinkTargetMiss.play()

      // ...innocent + stand stop blinking after 6 loops
      await blinkTarget.finished

      // Store blinking "Miss!" animation in state and set tagged-innocent flag
      taggedTarget.blinkAnime = blinkTargetMiss
      setIsInnocentTagged(true)   // triggers endOfRoundActivity
    }

    // Call the async wrapper function
    targetTagged()
  }, [taggedTarget, setCurrentScore, setMissTally])



  /**
   * TEMPORARY function for starting game action
   */
  function go() {

    setIsGoClicked(true)

    return
  }


  /**
   * Callback for a target that has been tagged
   *
   * @param {SlotLocation} targetInfo
   */
  const tagTarget = function (slot: SlotLocation) {
    // Ignore the tag if tagging is currently disabled
    if (areTargetsTaggable.current === false) { return }

    // Update the tagged target state
    setTaggedTarget(targetStates.current[slot])
  }


  /**
   *
   *
   * @param {TargetHandle[]} targetSet
   * @return {number}
   */
  function countBaddies (targetSet: TargetHandle[]) {
    return targetSet.reduce<number>(
      (accum: number, targetHandle: TargetHandle) => {
        return (targetHandles[targetHandle] > 0)
          ? accum += 1
          : accum
      }, 0)
  }


  return (
      <div className={`room h-[82.19%] w-full bg-black grid grid-rows-full-room grid-cols-1`}>
          <div className={`${(isColorInverted)?'bg-pumpkin':'bg-sky'} w-full`}></div>
          <div className={`grid grid-cols-room-middle grid-rows-1 w-full ${(isColorInverted)?'bg-sky':'bg-twilight'}`}>
              <span className={`${(isColorInverted)?'bg-maroon':'bg-daiquiri'} z-30`}></span>
              <div className={`grid grid-rows-roof-walls-floor grid-cols-r2-c2`}>
                  <span className={`row-span-1-8 col-span-1-2 grid grid-rows-left-wall z-30`}>
                      <div className={`row-span-wall-mid col-span-wall grid grid-cols-left-wall gap-walls bg-black border-b-2 border-black`}>
                          <span className={`${(isColorInverted)?'bg-pumpkin':'bg-sky'}`}></span>
                          <span className={`${(isColorInverted)?'bg-pumpkin':'bg-sky'}`}></span>
                          <span className={`${(isColorInverted)?'bg-pumpkin':'bg-sky'}`}></span>
                          <span className={`${(isColorInverted)?'bg-pumpkin':'bg-sky'}`}></span>
                      </div>
                  </span>
                  <div className={`col-span-1-4 row-span-1-2 z-40`}>
                      <Ceiling isColorInverted={isColorInverted}></Ceiling>
                  </div>
                  <div className={`col-span-2-3 row-span-1-2 grid grid-cols-far-roof`}>
                      <span className={`${(isColorInverted)?'bg-pumpkin':'bg-sky'}`}></span>
                      <span className={`col-span-2-3 ${(isColorInverted)?'bg-pumpkin':'bg-sky'} border-b-2 ${(isColorInverted)?'border-maroon':'border-daiquiri'} z-40 grid grid-rows-timer-top`}>
                          <button className={`row-span-1-2 bg-go-button bg-no-repeat bg-center bg-[size:70%]`} onClick={go}></button>
                          <div className={`row-span-2-3 bg-black`}></div>
                      </span>
                      <span className={`bg-sky`}></span>
                  </div>
                  <div className={`col-span-2-3 row-span-2-3 grid grid-cols-stage-top grid-rows-stage-top`}>
                      <span className={`col-span-1-2 row-span-1-2 grid grid-rows-proscenium ${(isColorInverted)?'bg-maroon':'bg-daiquiri'}`}>
                          <div className={`row-span-2-3 bg-black`}></div>
                          <div className={`row-span-4-5 bg-black`}></div>
                      </span>
                      <span className={`grid grid-cols-timer-left ${(isColorInverted)?'bg-maroon':'bg-daiquiri'}`}>
                          <span className={`col-span-1-2 bg-black`}></span>
                          <span className={`col-span-3-4 bg-black`}></span>
                      </span>
                      <span id='timer' className={`bg-black`}>
                        <TimerDisplay durationInMS={timerDisplayValue}></TimerDisplay>
                      </span>
                      <span className={`grid grid-cols-timer-right ${(isColorInverted)?'bg-maroon':'bg-daiquiri'}`}>
                          <span className={`col-span-2-3 bg-black`}></span>
                          <span className={`col-span-4-5 bg-black`}></span>
                      </span>
                      <span className={`col-span-5-6 row-span-1-2 grid grid-rows-proscenium ${(isColorInverted)?'bg-maroon':'bg-daiquiri'}`}>
                          <div className={`row-span-2-3 bg-black`}></div>
                          <div className={`row-span-4-5 bg-black`}></div>
                      </span>
                      <span></span>
                      <span className={`col-span-2-3 ${(isColorInverted)?'bg-maroon':'bg-daiquiri'} grid grid-rows-timer-b-corner relative bottom-[0.1px]`}>
                          <div className={`row-span-1-2 col-span-1-2`}></div>
                          <div className={`row-span-2-3 col-span-1-2 ${(isColorInverted)?'bg-sky':'bg-twilight'} w-[15.9%] border-t border-b ${(isColorInverted)?'border-sky':'border-twilight'}`}></div>
                          <div className={`row-span-3-4 col-span-1-2 ${(isColorInverted)?'bg-sky':'bg-twilight'} w-[27.3%] border-t border-b ${(isColorInverted)?'border-sky':'border-twilight'}`}></div>
                          <div className={`row-span-4-5 col-span-1-2 ${(isColorInverted)?'bg-sky':'bg-twilight'} w-[38.7%] border-t border-b ${(isColorInverted)?'border-sky':'border-twilight'}`}></div>
                          <div className={`row-span-5-6 col-span-1-2 ${(isColorInverted)?'bg-sky':'bg-twilight'} w-[50.1%] border-t border-b ${(isColorInverted)?'border-sky':'border-twilight'}`}></div>
                          <div className={`row-span-6-7 col-span-1-2 ${(isColorInverted)?'bg-sky':'bg-twilight'} w-[72.8%] border-t border-b ${(isColorInverted)?'border-sky':'border-twilight'}`}></div>
                          <span className={`row-span-1-7 col-span-1-2 grid grid-rows-timer-b-corner-jog`}>
                              <span className={`w-[22.7%] justify-self-end bg-black`}></span>
                              <span className={`w-[11.3%] justify-self-end bg-black`}></span>
                          </span>
                      </span>
                      <span className={`col-span-3-4 ${(isColorInverted)?'bg-maroon':'bg-daiquiri'} grid grid-rows-timer-b-corner relative bottom-[0.1px]`}>
                          <span className={`row-span-1-7 col-span-1-2 w-full grid grid-rows-timer-b-corner-jog`}>
                              <span className={`row-span-2-3 bg-black`}></span>
                          </span>
                      </span>
                      <span className={`col-span-4-5 ${(isColorInverted)?'bg-maroon':'bg-daiquiri'} grid grid-rows-timer-b-corner relative bottom-[0.1px] justify-items-end`}>
                          <div className={`row-span-1-2 col-span-1-2`}></div>
                          <div className={`row-span-2-3 col-span-1-2 ${(isColorInverted)?'bg-sky':'bg-twilight'} w-[15.9%] border-t border-b ${(isColorInverted)?'border-sky':'border-twilight'}`}></div>
                          <div className={`row-span-3-4 col-span-1-2 ${(isColorInverted)?'bg-sky':'bg-twilight'} w-[27.3%] border-t border-b ${(isColorInverted)?'border-sky':'border-twilight'}`}></div>
                          <div className={`row-span-4-5 col-span-1-2 ${(isColorInverted)?'bg-sky':'bg-twilight'} w-[38.7%] border-t border-b ${(isColorInverted)?'border-sky':'border-twilight'}`}></div>
                          <div className={`row-span-5-6 col-span-1-2 ${(isColorInverted)?'bg-sky':'bg-twilight'} w-[50.1%] border-t border-b ${(isColorInverted)?'border-sky':'border-twilight'}`}></div>
                          <div className={`row-span-6-7 col-span-1-2 ${(isColorInverted)?'bg-sky':'bg-twilight'} w-[72.8%] border-t border-b ${(isColorInverted)?'border-sky':'border-twilight'}`}></div>
                          <span className={`row-span-1-7 col-span-1-2 w-full grid grid-rows-timer-b-corner-jog`}>
                              <span className={`w-[22.7%] bg-black`}></span>
                              <span className={`w-[11.3%] bg-black`}></span>
                          </span>
                      </span>
                  </div>
                  <div className={`col-span-2-3 row-span-3-4 relative`}>
                      <div
                        ref={enterSlideRef}
                        className={`w-[75.1vw] h-full absolute right-[100%]`}
                      >{enterComponents}</div>
                      <div
                        ref={stageRef}
                        className={`w-[75.1vw] h-full absolute`}
                      >{stageComponents}</div>
                      <div
                        ref={exitSlideRef}
                        className={`w-[75.1vw] h-full absolute left-0`}
                      >{exitComponents}</div>
                  </div>
                  <span className={`col-span-2-3 row-span-4-5 grid grid-rows-stage-front ${(isColorInverted)?'bg-maroon':'bg-daiquiri'}`}>
                      <div className={`row-span-2-3 bg-black`}></div>
                      <div className={`row-span-4-5 bg-black`}></div>
                  </span>
                  <span className={`col-span-2-3 row-span-5-6 ${(isColorInverted)?'bg-maroon':'bg-daiquiri'} grid grid-cols-shot-outcome-3`}>
                      <span className={`grid grid-cols-shot-outcome grid-rows-shot-outcome ${(isColorInverted)?'bg-maroon':'bg-daiquiri'}`}>
                          <span className={`col-span-2-3 row-span-2-3 border-x-4 border-y-3 border-black grid`}>
                              <span className={`w-[94%] h-[84%] mx-auto my-auto bg-black grid justify-items-center`}>
                              <Image
                                  src={missSign}
                                  alt="Miss!"
                                  className="miss-sign-0 w-[9.3vw] row-span-2-3 col-span-1-2 opacity-0"
                                ></Image>
                              </span>
                          </span>
                      </span>
                      <span className={`grid grid-cols-shot-outcome grid-rows-shot-outcome ${(isColorInverted)?'bg-maroon':'bg-daiquiri'}`}>
                          <span className={`col-span-2-3 row-span-2-3 border-x-4 border-y-3 border-black grid`}>
                              <span className={`w-[94%] h-[84%] mx-auto my-auto bg-black grid justify-items-center`}>
                              <Image
                                  src={missSign}
                                  alt="Miss!"
                                  className="miss-sign-1 w-[9.3vw] row-span-2-3 col-span-1-2 opacity-0"
                                ></Image>
                              </span>
                          </span>
                      </span>
                      <span className={`grid grid-cols-shot-outcome grid-rows-shot-outcome ${(isColorInverted)?'bg-maroon':'bg-daiquiri'}`}>
                          <span className={`col-span-2-3 row-span-2-3 border-x-4 border-y-3 border-black grid`}>
                              <span className={`w-[94%] h-[84%] mx-auto my-auto bg-black grid justify-items-center`}>
                                <Image
                                  src={missSign}
                                  alt="Miss!"
                                  className="miss-sign-2 w-[9.3vw] row-span-2-3 col-span-1-2 opacity-0"
                                ></Image>
                              </span>
                          </span>
                      </span>
                  </span>
                  <div className={`col-span-1-4 row-span-6-7 z-40 grid grid-cols-far-floor`}>
                      <div className={`col-span-1-7 row-span-1-2`}>
                          <Floor isColorInverted={isColorInverted}></Floor>
                      </div>
                      <span className={`col-span-2-3 row-span-1-2 grid grid-cols-5 grid-rows-far-floor-grout gap-x-[0.8px] z-50`}>
                          <span className={`col-span-1-2 row-span-5-6 ${(isColorInverted)?'bg-sky':'bg-twilight'}`}></span>
                          <span className={`col-span-2-3 row-span-4-5 ${(isColorInverted)?'bg-sky':'bg-twilight'}`}></span>
                          <span className={`col-span-3-4 row-span-3-4 ${(isColorInverted)?'bg-sky':'bg-twilight'}`}></span>
                          <span className={`col-span-4-5 row-span-2-3 ${(isColorInverted)?'bg-sky':'bg-twilight'}`}></span>
                          <span className={`col-span-5-6 row-span-1-2 ${(isColorInverted)?'bg-sky':'bg-twilight'}`}></span>
                      </span>
                      <div className={`col-span-3-4 row-span-1-2 border-r-2 ${(isColorInverted)?'border-sky':'border-twilight'} z-50`}></div>
                      <div className={`col-span-4-5 row-span-1-2 border-l-2 ${(isColorInverted)?'border-sky':'border-twilight'} z-50`}></div>
                      <span className={`col-span-5-6 row-span-1-2 grid grid-cols-5 grid-rows-far-floor-grout gap-x-[0.8px] z-50`}>
                          <span className={`col-span-1-2 row-span-1-2 ${(isColorInverted)?'bg-sky':'bg-twilight'}`}></span>
                          <span className={`col-span-2-3 row-span-2-3 ${(isColorInverted)?'bg-sky':'bg-twilight'}`}></span>
                          <span className={`col-span-3-4 row-span-3-4 ${(isColorInverted)?'bg-sky':'bg-twilight'}`}></span>
                          <span className={`col-span-4-5 row-span-4-5 ${(isColorInverted)?'bg-sky':'bg-twilight'}`}></span>
                          <span className={`col-span-5-6 row-span-5-6 ${(isColorInverted)?'bg-sky':'bg-twilight'}`}></span>
                      </span>
                  </div>
                  <span className={`row-span-1-8 col-span-3-4 grid grid-rows-right-wall z-30`}>
                      <div className={`row-span-wall-mid col-span-wall grid grid-cols-right-wall gap-walls bg-black border-b-2 border-black`}>
                          <span className={`${(isColorInverted)?'bg-pumpkin':'bg-sky'}`}></span>
                          <span className={`${(isColorInverted)?'bg-pumpkin':'bg-sky'}`}></span>
                          <span className={`${(isColorInverted)?'bg-pumpkin':'bg-sky'}`}></span>
                          <span className={`${(isColorInverted)?'bg-pumpkin':'bg-sky'}`}></span>
                      </div>
                  </span>
              </div>
              <span className={`${(isColorInverted)?'bg-maroon':'bg-daiquiri'} z-30`}></span>
          </div>
          <div className={`bg-black w-full grid grid-cols-near-floor`}>
              <span className={`col-span-2-3 row-span-1-2 grid grid-cols-near-floor-grout grid-rows-near-floor-grout z-50`}>
                  <span className={`col-span-1-2 row-span-3-4 ${(isColorInverted)?'bg-sky':'bg-twilight'}`}></span>
                  <span className={`col-span-2-3 row-span-2-3 ${(isColorInverted)?'bg-sky':'bg-twilight'}`}></span>
                  <span className={`col-span-3-4 row-span-1-2 ${(isColorInverted)?'bg-sky':'bg-twilight'}`}></span>
              </span>
              <span className={`col-span-4-5 row-span-1-2 bg-black`}>
                <ScoreHat></ScoreHat>
              </span>
              <span className={`col-span-6-7 row-span-1-2 grid grid-cols-near-floor-grout grid-rows-near-floor-grout z-50`}>
                  <span className={`col-span-1-2 row-span-1-2 ${(isColorInverted)?'bg-sky':'bg-twilight'}`}></span>
                  <span className={`col-span-2-3 row-span-2-3 ${(isColorInverted)?'bg-sky':'bg-twilight'}`}></span>
                  <span className={`col-span-3-4 row-span-3-4 ${(isColorInverted)?'bg-sky':'bg-twilight'}`}></span>
              </span>
          </div>
      </div>
  )
}
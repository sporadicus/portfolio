import anime from 'animejs'
import { TargetState } from './types'


/**
 *
 *
 * @export
 * @param {(HTMLDivElement|null)} stageDomRef
 * @return {*}
 */
export function getTurnTargetToFront (stageDomRef: HTMLDivElement|null) {
  const trioTurnsForward = anime.timeline({
    autoplay: true,
    easing: 'linear',
  })
  // Step one: angledWhite: ON  /  sideOn: OFF
  trioTurnsForward.add({
    targets: [stageDomRef?.getElementsByClassName("angledWhite")],
    duration: 1,
    opacity: 100,
  }, 1)
  trioTurnsForward.add({
    targets: [stageDomRef?.getElementsByClassName("sideOn")],
    duration: 1,
    opacity: 0,
  }, 1)
  // Step two: facingForward: ON  /  angledWhite: OFF
  trioTurnsForward.add({
    targets: [stageDomRef?.getElementsByClassName("facingForward")],
    duration: 1,
    opacity: 100,
  }, '+=100')
  trioTurnsForward.add({
    targets: [stageDomRef?.getElementsByClassName("angledWhite")],
    duration: 1,
    opacity: 0,
  })

  return trioTurnsForward
}

/**
 *
 *
 * @export
 * @param {TargetState[]} targets
 * @return {*}
 */
export function getTurnTargetToSide (targets: TargetState[]) {
  // Get the DOM refs for the given
  const targetsToTurn = targets.map( target => target.domRef.current )

  const animation = anime.timeline({
    autoplay: true,
    easing: 'linear',
  })

  // Step one: angledWhite: ON  /  facingForward: OFF
  animation.add({
    targets: targetsToTurn.map(el => el?.getElementsByClassName("angledWhite")),
    duration: 1,
    opacity: 100,
  }, 500)
  animation.add({
    targets: targetsToTurn.map(el => el?.getElementsByClassName("facingForward")),
    duration: 1,
    opacity: 0,
  })

  // Step two: sideOn: ON  /  angledWhite: OFF
  animation.add({
    targets: targetsToTurn.map(el => el?.getElementsByClassName("sideOn")),
    duration: 1,
    opacity: 100,
  }, '+=100')
  animation.add({
    targets: targetsToTurn.map(el => el?.getElementsByClassName("angledWhite")),
    duration: 1,
    opacity: 0,
    endDelay: 800,
  })

  return animation
}

export function getSnapTargetToSide (targets: TargetState[]) {
  // Get the DOM refs for the given target(s)
  const targetsToTurn = targets.map( target => target.domRef.current )

  const animation = anime.timeline({
    autoplay: true,
    easing: 'linear',
  })
  // Hide all Target images except...
  animation.add({
    targets: targetsToTurn.map(el => el?.getElementsByClassName("facingForward")),
    duration: 1,
    opacity: 0,
  }, 1)
  animation.add({
    targets: targetsToTurn.map(el => el?.getElementsByClassName("angledGray")),
    duration: 1,
    opacity: 0,
  }, 1)
  animation.add({
    targets: targetsToTurn.map(el => el?.getElementsByClassName("facingAway")),
    duration: 1,
    opacity: 0,
  }, 1)
  animation.add({
    targets: targetsToTurn.map(el => el?.getElementsByClassName("angledWhite")),
    duration: 1,
    opacity: 0,
  }, 1)
  // ...make sideOn image visible
  animation.add({
    targets: targetsToTurn.map(el => el?.getElementsByClassName("sideOn")),
    duration: 1,
    opacity: 100,
  }, 1)

  return animation
}

export function getSnapTargetToFront (targets: TargetState[]) {
  // Get the DOM refs for the given target(s)
  const targetsToTurn = targets.map( target => target.domRef.current )

  const animation = anime.timeline({
    autoplay: false,
    easing: 'linear',
  })
  // Hide all Target images except...
  animation.add({
    targets: targetsToTurn.map(el => el?.getElementsByClassName("sideOn")),
    duration: 1,
    opacity: 0,
  }, 1)
  animation.add({
    targets: targetsToTurn.map(el => el?.getElementsByClassName("angledGray")),
    duration: 1,
    opacity: 0,
  }, 1)
  animation.add({
    targets: targetsToTurn.map(el => el?.getElementsByClassName("facingAway")),
    duration: 1,
    opacity: 0,
  }, 1)
  animation.add({
    targets: targetsToTurn.map(el => el?.getElementsByClassName("angledWhite")),
    duration: 1,
    opacity: 0,
  }, 1)
  // ...make sideOn image visible
  animation.add({
    targets: targetsToTurn.map(el => el?.getElementsByClassName("facingForward")),
    duration: 1,
    opacity: 100,
  }, 1)

  return animation
}



/**
 *
 *
 * @export
 * @param {HTMLDivElement} enterSlideDomRef
 * @param {HTMLDivElement} exitSlideDomRef
 * @return {anime.AnimeInstance}
 */
export function getSceneChange (enterSlideDomRef: HTMLDivElement|null,
                                exitSlideDomRef: HTMLDivElement|null, ) {
  const SceneChange = anime.timeline({
    autoplay: false,
    easing: 'linear',
    duration: 3500,
  })
  // Bring incoming Targets onstage
  SceneChange.add({
    targets: [enterSlideDomRef],
    right: '0%',
  }, 1)
  // Push outgoing Targets offstage
  SceneChange.add({
    targets: [exitSlideDomRef],
    left: '100%',
  }, 1)

  return SceneChange
}

export function getResetSlides (enterSlideRef: HTMLDivElement|null,
                                exitSlideRef: HTMLDivElement|null, ) {
  const resetSlides = anime.timeline({
    autoplay: true,
    easing: 'linear',
    duration: 1,
  });
  // Reset enter slide's relative positioning
  resetSlides.add({
    targets: [enterSlideRef],
    right: '100%',
  }, 1)
  // Reset exit slide's relative positioning
  resetSlides.add({
    targets: [exitSlideRef],
    left: '0%',
  }, 1)

  return resetSlides
}


export function getBlinkTarget (target: TargetState, numLoops: number = -1) {
  // Get the DOM ref for the given target
  const targetElem = target.domRef.current

  const blinkTarget = anime.timeline({
    targets: [targetElem],
    autoplay: true,
    loop: (numLoops < 0) ? true : numLoops,
    easing: 'linear',
  })
  // Target + stand NOT visible for 133ms
  blinkTarget.add({
    opacity: 0,
    duration: 1,
    endDelay: 132,
  })
  // Target + stand ARE visible for 267ms
  blinkTarget.add({
    opacity: 1,
    duration: 1,
    endDelay: 266,
  })

  return blinkTarget
}

export function getBlinkTargetMiss (target: TargetState, numLoops: number = -1) {
  // Get the DOM ref for the given target
  const targetElem = document.getElementsByClassName(`miss-sign-${target.slot}`)

  const blinkTarget = anime.timeline({
    targets: [targetElem],
    autoplay: false,
    loop: (numLoops < 0) ? true : numLoops,
    easing: 'linear',
  })
  // Miss! sign NOT visible for 133ms
  blinkTarget.add({
    opacity: 0,
    duration: 1,
    endDelay: 132,
  })
  // Miss! sign IS visible for 267ms
  blinkTarget.add({
    opacity: 1,
    duration: 1,
    endDelay: 266,
  })

  return blinkTarget
}


export function getSpinBaddie (baddie: TargetState) {
  // Get the DOM ref for the given target
  const baddieSpinDomElem = baddie.domRef.current

  // Get the relevant DOM elements to target
  const facingForwardElem = baddieSpinDomElem?.getElementsByClassName("facingForward")
  const angledWhiteElem = baddieSpinDomElem?.getElementsByClassName("angledWhite")
  const sideOnElem = baddieSpinDomElem?.getElementsByClassName("sideOn")
  const angledGrayElem = baddieSpinDomElem?.getElementsByClassName("angledGray")
  const facingAwayElem = baddieSpinDomElem?.getElementsByClassName("facingAway")

  // Pre-spin animation
  anime({
    targets: [facingForwardElem],
    duration: 1,
    opacity: 0,
  })

  // Spin loop
  const stepDurationInMs = 25
  const baddieHitSpin = anime.timeline({
    easing: 'linear',
    loop: true,
  })

  // Spin step 1
  baddieHitSpin.add({
    targets: [facingAwayElem],
    duration: 1,
    opacity: 0,
  })
  baddieHitSpin.add({
    targets: [angledWhiteElem],
    duration: 1,
    opacity: 100,
    endDelay: stepDurationInMs
  })

  // Spin step 2
  baddieHitSpin.add({
    targets: [angledWhiteElem],
    duration: 1,
    opacity: 0,
  })
  baddieHitSpin.add({
    targets: [sideOnElem],
    duration: 1,
    opacity: 100,
    endDelay: stepDurationInMs
  })

  // Spin step 3
  baddieHitSpin.add({
    targets: [sideOnElem],
    duration: 1,
    opacity: 0,
  })
  baddieHitSpin.add({
    targets: [angledGrayElem],
    duration: 1,
    opacity: 100,
    endDelay: stepDurationInMs
  })

  // Spin step 4
  baddieHitSpin.add({
    targets: [angledGrayElem],
    duration: 1,
    opacity: 0,
  })
  baddieHitSpin.add({
    targets: [facingAwayElem],
    duration: 1,
    opacity: 100,
    endDelay: stepDurationInMs
  })

  return baddieHitSpin
}
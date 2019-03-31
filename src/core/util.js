'use strict'

/** @private */
export function eachEntry(obj, cb) {
  Object.entries(obj).forEach(cb)
}

function* idCounter() {
  let i = 0
  while (true) yield i++
}

const lfidCounter = idCounter()

/** @private */
export function makeLFID() {
  const v = lfidCounter.next().value
  return `_F_${v}`
}

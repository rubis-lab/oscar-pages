// Works like async / await.
// It is very similar to babel's async / await transpiler.
// I like to think this is faster because it doesn't do any useless try / catch.
'use strict'

module.exports = function sequence (gen) {
  return function () {
    let it = gen.apply(this, arguments)

    return new Promise((resolve, reject) => {
      const genNext = function (value) {
        next(it.next(value))
      }

      const genThrow = function (error) {
        next(it.throw(error))
      }

      const next = function (result) {
        let value = result.value
        if (result.done) resolve(value)
        // This calls Promise.resolve(value) because value might
        // or might not be a promise, or even not a valid "thenable".
        // Unless we get a native isPromise, this extra potentially
        // useless call needs to be here.
        else Promise.resolve(value).then(genNext, genThrow).catch(reject)
        // Since errors are now caught by the new promise created
        // with Promise.resolve(), we need to manually reject the
        // original promise on error by doing a .catch().
      }

      genNext() // This is caught because it's inside new Promise
    })
  }
}

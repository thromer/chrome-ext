// Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const lib = {};

/**
 * List of functions that need to be invoked during library initialization.
 *
 * Each element in the initCallbacks_ array is itself a two-element array.
 * Element 0 is a short string describing the owner of the init routine, useful
 * for debugging.  Element 1 is the callback function.
 */
lib.initCallbacks_ = [];

/**
 * Register an initialization function.
 *
 * The initialization functions are invoked in registration order when
 * lib.init() is invoked.  Each function will receive a single parameter, which
 * is a function to be invoked when it completes its part of the initialization.
 *
 * @param {string} name A short descriptive name of the init routine useful for
 *     debugging.
 * @param {function()} callback The initialization function to register.
 */
lib.registerInit = function(name, callback) {
  lib.initCallbacks_.push([name, callback]);
};

/**
 * Initialize the library.
 *
 * This will ensure that all registered runtime dependencies are met, and
 * invoke any registered initialization functions.
 *
 * Initialization is asynchronous.  The library is not ready for use until
 * the returned promise resolves.
 *
 * @param {function(*)=} logFunction An optional function to send initialization
 *     related log messages to.
 * @return {!Promise<void>} Promise that resolves once all inits finish.
 */
lib.init = async function(logFunction = undefined) {
  const ary = lib.initCallbacks_;
  while (ary.length) {
    const [name, init] = ary.shift();
    if (logFunction) {
      logFunction(`init: ${name}`);
    }
    const ret = init();
    if (ret && typeof ret.then === 'function') {
      await ret;
    }
  }
};

/**
 * Verify |condition| is truthy else throw Error.
 *
 * This function is primarily for satisfying the JS compiler and should be
 * used only when you are certain that your condition is true.  The function is
 * designed to have a version that throws Errors in tests if condition fails,
 * and a nop version for production code.  It configures itself the first time
 * it runs.
 *
 * @param {boolean} condition A condition to check.
 * @closurePrimitive {asserts.truthy}
 */
lib.assert = function(condition) {
  if (window.chai) {
    lib.assert = window.chai.assert;
  } else {
    lib.assert = function(condition) {};
  }
  lib.assert(condition);
};

/**
 * Verify |value| is not null and return |value| if so, else throw Error.
 * See lib.assert.
 *
 * @template T
 * @param {T} value A value to check for null.
 * @return {T} A non-null |value|.
 * @closurePrimitive {asserts.truthy}
 */
lib.notNull = function(value) {
  lib.assert(value !== null);
  return value;
};

/**
 * Verify |value| is not undefined and return |value| if so, else throw Error.
 * See lib.assert.
 *
 * @template T
 * @param {T} value A value to check for null.
 * @return {T} A non-undefined |value|.
 * @closurePrimitive {asserts.truthy}
 */
lib.notUndefined = function(value) {
  lib.assert(value !== undefined);
  return value;
};
console.log('lib loaded')

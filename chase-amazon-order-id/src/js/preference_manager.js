'use strict';

console.log('prefs anyone home????')

// Let's try using hterm_preference_manager_js for inspiration

// TODO typescript but that probably means types for libapps

// import * as lib_prefs from './libdot/lib_preference_manager'
// import * as lib_storage from './libdot/lib_storage_chrome'

const tiller_amazon_ext = {}

/**
 * PreferenceManager subclass managing extension preferences.
 *
 * @extends {lib_prefs.PreferenceManager}
 * @constructor
 */
tiller_amazon_ext.PreferenceManager = function() {
  const storage = new lib.Storage.Chrome(chrome.storage.sync);
  // grumble grumble now *this* doesn't work? in lib_preference_manager
  // this.onStorageChange_ is undefined ???
  lib.PreferenceManager.call(this, storage)  // Parent constructor
  this.definePreference('example_key', 'example_key_default_value')
  // Object.entries(hterm.PreferenceManager.defaultPreferences).forEach(
  //     ([key, entry]) => {
  //       this.definePreference(key, entry['default']);
  //     });
}

// inheritance/protoyping magix I don't understand
tiller_amazon_ext.PreferenceManager.prototype =
    Object.create(lib.PreferenceManager.prototype);
/** @override */
tiller_amazon_ext.PreferenceManager.constructor = tiller_amazon_ext.PreferenceManager;


console.log('prefs bye anyone home????')

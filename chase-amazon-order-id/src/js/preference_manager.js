'use strict';

// TODO continue using hterm_preference_manager_js for inspiration

// TODO typescript but that probably means types for libapps

const tiller_amazon_ext = {}

/**
 * PreferenceManager subclass managing extension preferences.
 *
 * @extends {lib_prefs.PreferenceManager}
 * @constructor
 */
tiller_amazon_ext.PreferenceManager = function() {
  const storage = new lib.Storage.Chrome(chrome.storage.sync);
  lib.PreferenceManager.call(this, storage)  // Parent constructor
  // Object.entries(hterm.PreferenceManager.defaultPreferences).forEach(
  //     ([key, entry]) => {
  //       this.definePreference(key, entry['default']);
  //     });
}

// inheritance/protoyping magix I don't understand<
tiller_amazon_ext.PreferenceManager.prototype =
    Object.create(lib.PreferenceManager.prototype);
/** @override */
tiller_amazon_ext.PreferenceManager.constructor = tiller_amazon_ext.PreferenceManager;


console.log('preference_manager.js loaded')

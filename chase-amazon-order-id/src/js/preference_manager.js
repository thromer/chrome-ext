'use strict';

// TODO continue using hterm_preference_manager_js for inspiration or really it is nassh_preferences_editor and friends.
// basically the magic seems to mainly be in nassh_preferences_editor.js
/* how do those work?
 on save at the bottom nassh.PreferencesEditor save gets called somehow
 and tells the preference manager (which came from hterm)
 
 up one level looks like onInputChange calls save then sync (sync mostly sets the html element i think so usually a no-op)

 sort of up one level createInput does *lots* of magic incl
 * actually add the option to the DOM
 * set some event listeners on it

 up another level
 * addInputRow (still nassh_preferences_editor)
 */

// Advice for making color different if input doesn't match validation rule: have different css classes for valid & invalid
// https://stackoverflow.com/questions/10253645/checking-form-input-for-text-and-changing-its-color



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

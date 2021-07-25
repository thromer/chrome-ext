document.addEventListener('load', function() {
  console.log('listener')
  // this doesn't run?
})

window.onload = function() {
  console.log('window.onload')
  // this runs at some point at least
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('domcontentloaded')
  initialize()
  restore_options()
})

document.getElementById('save')!.addEventListener('click', save_options);

console.log('options -- anyone home???')
// TODO maybe better if we wait till we're sure all included scripts have been loaded and run before we do anything interesting?

// Based on https://developer.chrome.com/docs/extensions/mv3/options/

/* 
   TODO
   * validate on the fly
   * autosave
   * https://chromium.googlesource.com/apps/libapps/+/HEAD/libdot/js/lib_preference_manager.js
   */

// https://stackoverflow.com/a/56430612/8042530
// declare let lib: any
// declare let lib.Storage.Chrome: any;

// will it work? typescript doesn't like this.
// is it ok todo at the top level?
// will it run at a reasonable time?

// import * as lib_prefs from './libdot/lib_preference_manager'
/*
  import * as lib_storage from './libdot/lib_storage_chrome'
  console.log('lib_storage?') 
  console.log(lib_storage) 
  console.log(JSON.stringify(lib_storage))
  if (lib_storage && lib_storage.Storage) {
  const storage = new lib_storage.Storage.Chrome(chrome.storage.sync);
  console.log('storage?')
  console.log(storage)
  console.log(JSON.stringify(storage))
  }
*/
// import * as lib from './libdot/lib'
declare const lib: any  // maybe?
declare const tiller_amazon_ext: any  // maybe?

let prefs: any

function initialize() {
  console.log('lib: ' + JSON.stringify(lib))
  console.log('lib.Storage?')
  console.log(lib.Storage)
  console.log('17')
  console.log(JSON.stringify(lib.Storage))
  const storage = new lib.Storage.Chrome(chrome.storage.sync);
  console.log('storage?')
  console.log(storage)
  console.log(JSON.stringify(storage))

  // import * as prefs_lib from './preference_manager.js'

  // declare const tiller_amazon_ext: any  // TODO const
  console.log('tiller_amazon_ext?') 
  console.log(tiller_amazon_ext) 
  console.log(JSON.stringify(tiller_amazon_ext))
  // if (tiller_amazon_ext && tiller_amazon_ext.Preference_Manager) {
  prefs = new tiller_amazon_ext.PreferenceManager()
  console.log('prefs?') 
  console.log(prefs) 
  console.log(JSON.stringify(prefs))
  // } else {
  //   console.log('wtf no tiller_amazon_ext.PreferenceManager')
  // }

}

function save_options() {
  // TODO autosave instead that's the whole reason I embarked
  // on the libapps/lib_preference_manager yak shaving adventure
  console.log("save here i am")
  console.log("save example_key is " + prefs.getString("example_key"))
  var chase_account = (document.getElementById('chase_account') as HTMLInputElement)!.value
  var tiller_url = (document.getElementById('tiller_url') as HTMLInputElement)!.value
  chrome.storage.sync.set({
    chase_account: chase_account,
    tiller_url: tiller_url
  }, function() {
    var status = document.getElementById('status')
    status!.textContent = 'Options saved.'
    setTimeout(function() {
      status!.textContent = ''
    }, 750)
  })
}

function restore_options() {
  console.log("restore here i am")
  console.log("restore example_key is " + prefs.getString("example_key"))
  chrome.storage.sync.get({
    chase_account: '',
    tiller_url: ''
  }, function(items) {
    (document.getElementById('chase_account') as HTMLInputElement)!.value = items.chase_account;
    (document.getElementById('tiller_url') as HTMLInputElement)!.value = items.tiller_url;
  });
}

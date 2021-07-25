window.onload = function() {
  console.log('window.onload')
  // TODO would running initialize here (later IIUC ) be any better than
  // DOMContentLoaded?
}

// initialize()  // TOOD could we run at top level?

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded')
  initialize()
  restore_options()
})

document.getElementById('save')!.addEventListener('click', save_options);

// Based on https://developer.chrome.com/docs/extensions/mv3/options/

/* 
   TODO
   * validate on the fly
   * autosave
   */

declare const lib: any
declare const tiller_amazon_ext: any
let prefs: any

function initialize() {
  prefs = new tiller_amazon_ext.PreferenceManager()
}

function save_options() {
  // TODO autosave instead that's the whole reason I embarked
  // on the libapps/lib_preference_manager yak shaving adventure
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
  chrome.storage.sync.get({
    chase_account: '',
    tiller_url: ''
  }, function(items) {
    (document.getElementById('chase_account') as HTMLInputElement)!.value = items.chase_account;
    (document.getElementById('tiller_url') as HTMLInputElement)!.value = items.tiller_url;
  });
}

console.log('options loaded')

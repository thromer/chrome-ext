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

// document.getElementById('save')!.addEventListener('click', save_options);

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
  prefs = new tiller_amazon_ext.PreferenceManager() // TODO maybe not needed so much
  const tiller_url_element = (document.getElementById('tiller_url') as HTMLInputElement)
  // let's not save url too fast
  tiller_url_element.oninput = null
  tiller_url_element.onchange = function(event) {
    const tiller_url = tiller_url_element.value
    chrome.storage.sync.set({
      tiller_url: tiller_url
    }, function() {
      var status = document.getElementById('status')
      status!.textContent = 'Tiller Sheet URL saved.'
      setTimeout(function() {
	status!.textContent = ''
      }, 750)
    })
  }
  // let's save last 4 once valid
  const chase_account_element = (document.getElementById('chase_account') as HTMLInputElement)
  chase_account_element.onchange = null
  chase_account_element.oninput = function(event) {
    const chase_account = chase_account_element.value
    if (chase_account.match(/^[0-9]{4}$/)) {
      chrome.storage.sync.set({
	chase_account: chase_account
      }, function() {
	var status = document.getElementById('status')
	status!.textContent = 'Last 4 of Chase account number saved.'
	setTimeout(function() {
	  status!.textContent = ''
	}, 750)
      })
    }
  }
}

// TOOD remove
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

// Based on https://developer.chrome.com/docs/extensions/mv3/options/

/* 
   TODO
   * validate on the fly
   * autosave
     * https://chromium.googlesource.com/apps/libapps/+/HEAD/libdot/js/lib_preference_manager.js
*/

// https://stackoverflow.com/a/56430612/8042530
declare let lib: any
// declare let lib.Storage.Chrome: any;

// will it work? typescript doesn't like this.
// is it ok todo at the top level?
// will it run at a reasonable time?
const storage = new lib.Storage.Chrome(chrome.storage.sync);


function save_options() {
  console.log("save here i am")
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
  chrome.storage.sync.get({
    chase_account: '',
    tiller_url: ''
  }, function(items) {
    (document.getElementById('chase_account') as HTMLInputElement)!.value = items.chase_account;
    (document.getElementById('tiller_url') as HTMLInputElement)!.value = items.tiller_url;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save')!.addEventListener('click',
    save_options);

// Local Variables:
// compile-command: "npx tsc && (cd ../.. && npx webpack)"
// End:

// TODO
// * only fetch if either [this seems too complicated!]
//   (a) we ask service worker and it tells us to (e.g. because our tab
//       is one it opened or switched to recently)
//   (b) we're configured to fetch eagerly
//   (c) user said to
// * send service worker a message asking if we need to fetch anything
// * send service worker the results of our work
// * send service work info about our status for display inte the icon/popup
//   * including whether we're hoping the user will login
// * timeout on wait for element
// * would be nice to be able to know what upper bound on date is. let's assume "now in UTC" (just because I see a place where they have a timestamp in UTC)
//   * can try experimentally tho
// * use the host from the url instead of hardcoded host
// * very optional -- different way of deciding whether we're logged in?
// * merge 'sale' and 'adjustment' into single field
// ** or simpler get amount and anything else we can from the list view
//    not the pop-up
// * search last (30) days
// * apps script to populate order id for me
// * provide option of not proactively scraping chase
// * ORDER HANDLING!
// * DONE actually scrape everything
// * DONE download to csv
// * DONE encapsulate intermediate steps
// * casts are scary (' as ')
// * not-null checks are scary (!)
// * catch at end of promises
// * maybe wait for one of 'You've reached the end of your account activity.'
// * do it when requested not eagerly!
// * do it in hiding (doubtful!)
// * progress details e.g. checkmarks
//   * waiting for login
//   * grabbing progress (incl errors, retry)
//   * sheet update progress
//   * error details
//   * what happened: N added, N not found (here)


import { v4 as uuidv4 } from 'uuid'

interface IProgressBar {
  setProgress: (progress: number) => void
}

// basically https://github.com/philipmulcahy/azad/blob/master/src/js/progress_bar.ts Copyright(c) 2020 Philip Mulcahy.

function makeProgressBar() : IProgressBar {
  const border_width = 2
  const inner_width = 250
  const outer_width = 2*border_width + inner_width
  const a = document.createElement('div')
  a.setAttribute('class', 'chase_tiller_progress_bar')
  a.setAttribute('style', 'width:' + outer_width + 'px')
  document.body.prepend(a)

  const b = document.createElement('div')
  b.setAttribute('class', 'chase_tiller_progress_bar_level')
  b.setAttribute('style', 'width:0px')
  a.insertBefore(b, a.firstChild)

  const set_progress = function(progress: number) {
    const width = Math.trunc(inner_width * progress)
    const percent_string = '' + Math.trunc(progress * 100 + 0.005) + '%'
    b.setAttribute('style', 'width:' + width + 'px')
    b.innerText = percent_string
  }
  
  return {setProgress: set_progress}
}

main()

function main() {
  myLog('main()')
  main20210710().then(
    function(x: [any]) {
      myLog('main result=' + JSON.stringify(x))
      const llll = x.map(z => 'y')
      const l = x.map(function(d) { return {
	'last4CardNumber': d.last4CardNumber || null,
	'transactionPostDate': d.transactionPostDate || null,
	'transactionPostTime': d.transactionPostTime || null,
        'transactionAmount': d.transactionAmount || null,
	'merchantDbaName': d.merchantDbaName || null,
	'merchantOrderId': d.additionalDetails.merchantOrderId || null
      }})
      const request = {
	command: 'detailedTransactions',
	body: l
      }
      myLog('sending ' + JSON.stringify(request))
      chrome.runtime.sendMessage(request, resp => {
	myLog('resp is ' + JSON.stringify(resp))
      })
    })
}

function funButton() {
  // https://stackoverflow.com/a/17984701/8042530
  // this shows up after i set zIndex
  document.documentElement.style.height = '100%';
  document.body.style.height = '100%';
  document.documentElement.style.width = '100%';
  document.body.style.width = '100%';
  var div = document.createElement( 'div' );
  var btnForm = document.createElement( 'form' );
  var btn = document.createElement( 'input' );

  //append all elements
  document.body.prepend( div );
  div.appendChild( btnForm );
  btnForm.appendChild( btn );
  //set attributes for div
  div.id = 'myDivId';
  div.style.zIndex = '9999'
  div.style.position = 'fixed';
  div.style.top = '50%';
  div.style.left = '50%';
  div.style.width = '100%';   
  div.style.height = '100%';
  div.style.backgroundColor = 'red';

  //set attributes for btnForm
  btnForm.action = '';

  //set attributes for btn
  //"btn.removeAttribute( 'style' );
  btn.type = 'button';
  btn.value = 'hello';
  btn.style.position = 'absolute';
  btn.style.top = '50%';
  btn.style.left = '50%';

  var div2=document.createElement("div"); 
  document.body.prepend(div2); 
  div2.innerText="test123";  
  div2.style.zIndex = '9999'
  var div3=document.createElement("div"); 
  document.body.appendChild(div3); 
  div3.innerText="test1234";  
  div3.style.zIndex = '9999'
}

async function main20210710() {
  myLog('main20210710()')
  await waitUntilLoggedIn()
  const tabUrl = await getTabUrl()
  myLog('tabUrl=' + tabUrl)
  // const tiller_chase_progress = makeProgressBar()
  funButton()
  myLog('made indicator is it there?')
  // tiller_chase_progress.setProgress(.1)  // TODO

  // Find out what we need from Tiller, if anything
  const tillerNeeds = await whatShouldWeDo()
  myLog('tillerNeeds='+JSON.stringify(tillerNeeds))
  
  const accountAndProfile = await getAccountAndProfile()
  myLog('accountAndProfile=' + JSON.stringify(accountAndProfile))
  const activities = await listActivities(accountAndProfile, tillerNeeds)
  // myLog('activities=' + JSON.stringify(activities))
  let i = 0
  for (const activity of activities) {
    activity['additionalDetails'] = await getAdditionalTransactionDetails(activity)
    // tiller_chase_progress.setProgress(++i / activities.length)
    myLog('updated indicator is it there?')
  }
  return activities
}

async function waitUntilLoggedIn() {
  await waitForElement('.transaction-footer')   // this doesn't always exist
  // await waitForElement('.sign-out-menu')   this exists on the sign on page (!)
}

async function getAdditionalTransactionDetails(someDetails: any) {
  const url = 'https://secure07c.chase.com/svc/rr/accounts/secure/card/activity/ods/v2/detail/list'
  const bodySpec = [
    ['accountId', 'digitalAccountIdentifier'],
    ['transactionId', 'derivedUniqueTransactionIdentifier'],
    ['postDate', 'transactionPostDate'],
    ['cardReferenceNumber', 'cardReferenceNumber'],
    ['relatedAccountId', 'digitalAccountIdentifier'],
    ['merchantName', 'merchantDbaName']
  ]
  for (const field of bodySpec.map(s => s[1])) {
    if (!someDetails[field]) {
      return null
    }
  }
  const body = bodySpec.map(s => s[0] + '=' + encodeURIComponent(someDetails[s[1]])).join('&')
  myLog('body='+body)
  const response = await fetch(url, {
    'method': 'POST',
    'credentials': 'same-origin',
    'headers': {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-jpmc-channel': 'id=C30',
      'x-jpmc-client-request-id': uuidv4(),
      'x-jpmc-csrf-token': 'NONE',
    },
    'body': body
  })
  const responseJson = await response.json()
  return responseJson
}

async function getAccountAndProfile() : Promise<[string, string]> {
  const url = 'https://secure07c.chase.com/svc/rl/accounts/l4/v1/app/data/list'
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: new Headers({
      'x-jpmc-channel': 'id=C30',
      'x-jpmc-client-request-id': uuidv4(),
      'x-jpmc-csrf-token': 'NONE',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    })
  })
  const responseJson = await response.json()
  // Might be useful in the future: cache[n].response.accountTiles[n].accountId
  let account = undefined
  for (const cache of responseJson.cache) {
    if (cache.response.defaultAccountId) {
      account = cache.response.defaultAccountId
      break
    }
  }
  return [account, responseJson.profileId]
}

async function listActivities(accountProfile: [string, string], tillerNeeds: any) {
  // TODO actually construct a URL based on dates
  // TODO pagination
  const account = accountProfile[0]
  const profile = accountProfile[1]
  // const url = `https://secure07c.chase.com/svc/rr/accounts/secure/v4/activity/card/credit-card/transactions/inquiry-maintenance/etu-digital-card-activity/v1/profiles/${profile}/accounts/${account}/account-activities?record-count=50&provide-available-statement-indicator=true&sort-order-code=D&sort-key-code=T`

  // TODO add some buffer; take into account other interesting info in request
  const start = tillerNeeds.oldest.replace(/-/g,'')
  const end = tillerNeeds.newest.replace(/-/g,'')
  myLog('start='+start)
  myLog('end='+end)

  const url = `https://secure07c.chase.com/svc/rr/accounts/secure/v4/activity/card/credit-card/transactions/inquiry-maintenance/etu-digital-card-activity/v1/profiles/${profile}/accounts/${account}/account-activities?record-count=50&account-activity-end-date=${end}&account-activity-start-date=${start}&request-type-code=T&sort-order-code=D&sort-key-code=T`
  
  const response = await fetch(url, {
    method: 'GET',
    credentials: 'same-origin',
    headers: new Headers({
      'x-jpmc-channel': 'id=C30',
      'x-jpmc-client-request-id': uuidv4(),
      'x-jpmc-csrf-token': 'NONE',
    })
  })
  const responseJson = await response.json()
  return responseJson.activities
}

async function getTabUrl() {
  // https://stackoverflow.com/a/45600887
  return await mySendMessage({ text: "what is my tab url?" })
}

async function whatShouldWeDo() {
  const fullResponse = await mySendMessage({ text: 'whatToDoForChaseRequest' })
  // TODO throw if command != whatToDoForChaseResponse but you'd hope the protocol
  // takes care of that!
  myLog('full='+JSON.stringify(fullResponse))
  myLog('body='+JSON.stringify(fullResponse.body))
  return fullResponse.body
}

function mySendMessage(message: any) : Promise<any> {
  return new Promise((resolve, reject) => {
    myLog('calling sendMessage ' + JSON.stringify(message))
    chrome.runtime.sendMessage(message, response => {
      myLog('got response ' + JSON.stringify(response))
      resolve(response)
    })
  })
}

// From
// https://gist.github.com/jwilson8767/db379026efcbd932f64382db4b02853e
// Similar:
// https://www.darklaunch.com/javascript-wait-for-an-element-to-exist.html
function waitForElement(selector: string) : Promise<HTMLElement> {
  myLog('in waitForElement ' + selector)
  return new Promise((resolve, reject) => {
    myLog('looking for ' + selector)
    let el = document.querySelector(selector) as HTMLElement
    if (el) {
      myLog('done quickly ' + selector)
      resolve(el)
    }
    new MutationObserver((mutationRecords, observer) => {
      // Query for elements matching the specified selector
      Array.from(document.querySelectorAll(selector)).forEach((element) => {
	myLog('done observing ' + selector)
        resolve(element as HTMLElement)
        //Once we have resolved we don't need the observer anymore.
        observer.disconnect()
      })
    })
      .observe(document.documentElement, {
        childList: true,
        subtree: true
      })
  })
}

function myLog(s: string) {
  console.log('THROMER ' + s)
}

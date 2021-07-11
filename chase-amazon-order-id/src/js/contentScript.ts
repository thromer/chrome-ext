// TODO
// * send service worker a message asking if we need to fetch anything
// * send service worker the results of our work
// * send service work info about our status for display inte the icon/popup
//   * including whether we're hoping the user will login
// * timeout on wait for element
// * would be nice to be able to know what upper bound on date is
//   * can try experimentally tho
// * use the host from the url instead of hardcoded host
// * very optional -- different way of deciding whether we're logged in?
// * merge 'sale' and 'adjustment' into single field
// ** or simpler get amount and anything else we can from the list view
//    not the pop-up
// * search last (30) days
// * apps script to populate order id for me
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

import { v4 as uuidv4 } from 'uuid';

main()

function main() {
  myLog('main()')
  main20210710().then(
    x => myLog('main result=' + JSON.stringify(x))
  )
}

async function main20210710() {
  myLog('main20210710()')
  await waitUntilLoggedIn()
  const tabUrl = await getTabUrl()
  myLog('tabUrl=' + tabUrl)
  const accountAndProfile = await getAccountAndProfile()
  myLog('accountAndProfile=' + JSON.stringify(accountAndProfile))
  const activities = await listActivities(accountAndProfile)
  // myLog('activities=' + JSON.stringify(activities))
  for (const activity of activities) {
    activity['additionalDetails'] = await getAdditionalTransactionDetails(activity)
  }
  return activities
}

async function waitUntilLoggedIn() {
  await waitForElement('.transaction-footer')  
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

async function listActivities(accountProfile: [string, string]) {
  // TODO actually construct a URL based on dates
  // TODO pagination
  const account = accountProfile[0]
  const profile = accountProfile[1]
  // const url = `https://secure07c.chase.com/svc/rr/accounts/secure/v4/activity/card/credit-card/transactions/inquiry-maintenance/etu-digital-card-activity/v1/profiles/${profile}/accounts/${account}/account-activities?record-count=50&provide-available-statement-indicator=true&sort-order-code=D&sort-key-code=T`


  const url = `https://secure07c.chase.com/svc/rr/accounts/secure/v4/activity/card/credit-card/transactions/inquiry-maintenance/etu-digital-card-activity/v1/profiles/${profile}/accounts/${account}/account-activities?record-count=50&account-activity-end-date=20210711&account-activity-start-date=20210708&request-type-code=T&sort-order-code=D&sort-key-code=T`
  
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

function getTabUrl() {
  return new Promise((resolve, reject) => {
    // https://stackoverflow.com/a/45600887
    myLog('calling sendMessage')
    chrome.runtime.sendMessage({ text: "what is my tab url?" }, tabUrl => {
      myLog('My tabUrl is' + tabUrl);
      resolve(tabUrl)
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

// TODO
//
// * DONT use javascript library not raw html. REST requests aren't
//   that hard to contruct.
//
// * consider tiller transactions based on
//   * Institution = Chase
//   * Amazon Order Number = ''
//   * Within last 30 days (but configurable; default & one shot)
//
// * tell contentScript about each transaction we hope to fill in
//   * Full Description [this should be sufficient to identify uniquely]
//   * Date (we hope)
//   * Amount (should match)
//   * Account # (last 4 should match)
//
// * handle message back from contentscript with list of
//   * Full Description
//   * (Date)
//   * (Post Date)
//   * Amount
//   * last 4
//   * order number (can be null, must be present)
//
// Happily
// * race conditions aren't awful since the worst we will do is fill
//   in order number in the wrong row. I think.

/* Examples
POST https://content-sheets.googleapis.com/v4/spreadsheets/SHEET_ID_GOES_HERE/values:batchUpdate?alt=json
content-type: application/json

GET https://content-sheets.googleapis.com/v4/spreadsheets/SHEET_ID_GOES_HERE/values/Transactions!1%3A1
*/

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension")
    console.log('request='+JSON.stringify(request))
    if (request.text === "what is my tab url?") {
      sendResponse(sender.tab ? sender.tab.url : undefined)
      return true
    }
    if (request.command === "detailedTransactions") {
      processDetailedTransactions(request.body).then(
	function(processResult) {
	  console.log('sending result ' + processResult)
	  sendResponse({
	    command: 'detailedTransactionsResult',
	    body: processResult
	  })
	})
    }
    return true
  })

async function processDetailedTransactions(detailedTransactions: [any]) {
  console.log(JSON.stringify(detailedTransactions))
  for (const detailedTransaction of detailedTransactions) {
    const partial = await processDetailedTransaction(detailedTransaction)
    console.log('partial='+partial)
  }
  return 7
}

function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({interactive: true}, function(token) {
      console.log('resolved! token='+token)
      resolve(token)
    })
  })
}

async function processDetailedTransaction(detailedTransaction: any) {
  const token = await getAuthToken()
  const init = {
    method: 'GET',
    async: true,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    'contentType': 'json'
  }
  const response = await fetch(
    'https://content-sheets.googleapis.com/v4/spreadsheets/1UQQgW3kBfxNBB50q1pg4Hn2c6DvwoKVUF_9GelZ1k1Q',
    init)
  const json = await response.json()
  return json['properties']['title'] 
}

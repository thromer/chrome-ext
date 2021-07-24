// TODO
//
// * consider tiller transactions based on
//   * Institution = Chase
//   * Amazon Order Number = ''
//   * Within last 30 days (but configurable; default & one shot)
//   * Last 4
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
// * include last 4 in filtering criteria
// * write 'undefined' when there just isn't going to be an order number
// * deal with Full Description vs merchantDbaName
//     'AMZN Mktp US*XXXXX7711'
//     'AMZN Mktp US*211FX2790' 'AMZN Mktp US*211F82790'
//     'AMZN Mktp US*XX8678BM2' 'AMZN Mktp US*218678BM2
//     'Amazon.com*2RX1458L2'   'Amazon.com*2R31458L2'
// * deal with the occasional 'Amazon.com' (refunds, generally) (match on date+amount)
//
// * Cache the results of fetching 'Full Description' column (cut requests in half)
// * Rate limiting & caching for Chase
// * Rate limiting & backoff for Google
/*
headersJson={"error":{"code":429,"message":"Quota exceeded for quota metric 'Read requests' and limit 'Read requests per minute per user' of service 'sheets.googleapis.com' for consumer 'project_number:721888169423'.","status":"RESOURCE_EXHAUSTED","details":[{"@type":"type.googleapis.com/google.rpc.ErrorInfo","reason":"RATE_LIMIT_EXCEEDED","domain":"googleapis.com","metadata":{"service":"sheets.googleapis.com","quota_limit":"ReadRequestsPerMinutePerUser","quota_metric":"sheets.googleapis.com/read_requests","consumer":"projects/721888169423"}}]}}

https://developers.google.com/sheets/api/reference/limits says 500 requests per 100 seconds per project and 100 requests per 100 seconds per user.

How did I even make close to that many requests?
*/
//
// * Rate limiting & backoff for Chase
//     
// * any TODOs below
//
// Happily
// * race conditions aren't awful since the worst we will do is fill
//   in order number in the wrong row. I think.

// hyperlinks -- I think this works ok
// * https://www.amazon.com/gp/your-account/order-details?ie=UTF8&orderID=112-5620867-7612244

/* Examples
POST https://content-sheets.googleapis.com/v4/spreadsheets/SHEET_ID_GOES_HERE/values:batchUpdate?alt=json
content-type: application/json

GET https://content-sheets.googleapis.com/v4/spreadsheets/SHEET_ID_GOES_HERE/values/Transactions!1%3A1
*/

/*
setBadgeState()

chrome.alarms.create({periodInMinutes: .05})  // TODO something sensible

chrome.alarms.onAlarm.addListener(
  alarm => setBadgeState()
)

async function setBadgeState() {
  // Gross, TypeScript could do a little better at type inference
  await chrome.action.setBadgeBackgroundColor({color: ([0,0,0,0].map(_ => Math.floor(256*Math.random())) as [number, number, number, number])})
  await chrome.action.setBadgeText(
    {text: [0,0,0,0].map(_ => String.fromCharCode(32+Math.floor(95*Math.random()))).join('')})
  console.log('hi')
}
*/

refreshFromTiller()
chrome.alarms.create("refreshFromTiller", {periodInMinutes: 60})  // TODO configurable
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name == "refreshFromTiller") {
    refreshFromTiller()
  } else {
    console.log("Ignoring alarm '" + alarm.name + "' " + JSON.stringify(alarm))
  }
})

async function refreshFromTiller() {
  console.log("TODO implement refreshFromTiller")
  // TODO grab some state in tiller that we can use to drive the chase contentScript
  //      filter on 'Date' is in last N days
  //      filter on 'Account'
  //      filter on 'Institution'
  //      filter on last 4 of 'Account #'
  //      don't filter on full description [refunds are pretty mysterious].
  //        future could keep track of what appears before the
  //        asterisk and filter on 'contains asterisk or has one of
  //        those prefixes'
  //      persist it
  //      update the popup to match somehow
  // What we want to persist (at least for Chase)
  //   timestamp
  //   list of xactions that need order numbers
  //     'Full Description' [we'll leave it to lib code to do deal with 'X']
  //     'Date' [assume this is post date]
  //     'Amount'
  //     last 4 (for some sort of validation)
}


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
    if (request.text === 'whatToDoForChaseRequest') {
      // TODO refresh state from tiller unless it is *extremely* fresh
      // TODO actually be dynamic
      // TODO enough information so contentScript can show more precise status (i.e.
      // filter on just transactions we're trying to match)
      const newest = new Date().toISOString().substr(0,10)
      const oldest = new Date(Date.now()-7*24*3600*1000).toISOString().substr(0,10)
      const resp = {
	command: 'whatToDoForChaseResponse',
	body: {oldest: oldest, newest: newest}
      }
      console.log('responding with ' + JSON.stringify(resp))
      sendResponse(resp)
      return true
    }

    if (request.command === "detailedTransactions") {
      const sheetState = SheetState.create('1UQQgW3kBfxNBB50q1pg4Hn2c6DvwoKVUF_9GelZ1k1Q')
	.then(function(sheetState: SheetState) {
	  console.log('created sheetState')
	  return processDetailedTransactions(sheetState, request.body)
	})
	.then(function(processResult) {
	  console.log('sending result ' + JSON.stringify(processResult))
	  sendResponse({
	    command: 'detailedTransactionsResult',
	    body: processResult
	  })
	})
    }
    return true
  })

class SheetState {
  sheetId: string;
  headerColumns!: Map<string, number>;
  fullDescriptionValues!: string[];
  fullDescriptionRegexes!: [RegExp, number][];
  
  private constructor(sheetId: string) {
    this.sheetId = sheetId
  }
  private async initialize() {
    return this.updateState()  // is this right?
  }
  async getColumnNumber(s: string) : Promise<number> {
    // throw if not found
    if (!this.headerColumns.has(s)) {
      return -1 // TODO throw
    }
    return this.headerColumns.get(s) as number
  }
/*  
  async lookupRowNumber(header: string, value: string) {
    // throw if not exactly one
    const c = await this.getColumnNumber(header)
    const letter = SheetState.columnToLetter(c)
    const range = letter + '1:' + letter
    const columnValues = (await this.getRange('Transactions!' + range)).values
    let count = 0
    let result = -1  // TODO leave undefined
    for (let i = 0; i < columnValues.length; i++) {
      if (columnValues[i][0] == value) {
	result = i + 1
	count++
      }
    }
    if (count > 1 ) {
      result = 0
    }
    return result
  }
*/
  async lookupFullDescriptionRowNumber(header: string, value: string) : Promise<[number, RegExp | null]> {
    if (!this.fullDescriptionValues) {
      const c = await this.getColumnNumber('Full Description')
      const letter = SheetState.columnToLetter(c)
      const range = letter + '1:' + letter
      this.fullDescriptionValues = []
      this.fullDescriptionRegexes = []
      const columnValues = (await this.getRange('Transactions!' + range)).values
      for (let i = 0; i < columnValues.length; i++) {
	let cv = columnValues[i][0]
	this.fullDescriptionValues.push(cv)
	if (cv && cv.indexOf('X') >= 0 && cv.match(/^am/i)) {
	  // TODO only for (case-insensitive) values that match /^am/ 
	  let reg = new RegExp('^' + cv
			       .replaceAll('.','\\.')
			       .replaceAll('*','\\*')
			       .replaceAll('X','.') + '$')
	  this.fullDescriptionRegexes.push([reg, i])
	  console.log('made regex ' + reg)
	}
      }
    }
    let count = 0
    let result = -1
    let reg = null
    for (let i = 0; i < this.fullDescriptionValues.length; i++) {
      if (this.fullDescriptionValues[i] == value) {
	console.log(`${value}==${this.fullDescriptionValues[i]}`)
	result = i + 1
	count++
      }
    }
    if (!count) {
      for (let pair of this.fullDescriptionRegexes) {
	if (value.match(pair[0])) {
	  console.log(`${value} matched ${pair[0]}`)
	  reg = pair[0]
	  result = pair[1] + 1
	  count++
	}
      }
    }
    if (count > 1) {
      result = 0
    }
    return [result, reg]
  }
  static async create(sheetId: string) {
    // https://stackoverflow.com/a/47558991
    const o = new SheetState(sheetId)
    await o.initialize()
    return o
  }
  async updateState() {
    const headersJson = await this.getRange('Transactions!1:1')
    console.log('headersJson='+JSON.stringify(headersJson))
    const headers = headersJson.values[0]
    this.headerColumns = new Map<string, number>()
    for (let i = 0; i < headers.length; i++) {
      if (headers[i]) {
      // TODO throw if there are non-blank duplicates
	this.headerColumns.set(headers[i], i + 1)
      }
    }
  }
  async getRange(rangeString: string) {
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
    const getResponse = await fetch(
      `https://content-sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values/` +
	encodeURIComponent(rangeString) + '?valueRenderOption=UNFORMATTED_VALUE',
      init)
    return getResponse.json()
  }
  async setCell(sheet: string, row: number, column: number, value: string) {
    const token = await getAuthToken()
    const range = sheet + '!' + SheetState.columnToLetter(column) + row
    const body = {
      "valueInputOption": "USER_ENTERED",
      "data": [{
	"range": range,
	"values": [[ value ]]
      }]
    }
    const init = {
      method: 'POST',
      async: true,
      headers: {
	Authorization: 'Bearer ' + token,
	'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      'contentType': 'json'
    }
    const postResponse = await fetch(
      `https://content-sheets.googleapis.com/v4/spreadsheets/${this.sheetId}/values:batchUpdate?alt=json`,
      init)
    return postResponse.json()
    /*
    const message = `Didn't actually set ${range}=${value}`
    console.log(message)
    return message
    */
  }
  private static getAuthToken() {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({interactive: true}, function(token) {
	console.log('resolved! token='+token)
	resolve(token)
      })
    })
  }

  private static columnToLetter(column: number) : string {
    // https://stackoverflow.com/a/21231012
    var temp, letter = '';
    while (column > 0)
    {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = (column - temp - 1) / 26;
    }
    return letter;
  }
}

async function processDetailedTransactions(sheetState: SheetState, detailedTransactions: [any]) {
  console.log('processsDetailedTransactions: ' + JSON.stringify(detailedTransactions))
  const answer = []
  for (const detailedTransaction of detailedTransactions) {
    const partial = await processDetailedTransaction(sheetState, detailedTransaction)
    console.log('partial='+JSON.stringify(partial))
    answer.push(partial)
  }
  return answer
}

function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({interactive: true}, function(token) {
      console.log('resolved! token='+token)
      resolve(token)
    })
  })
}

async function processDetailedTransaction(sheetState: SheetState, d: any) {
  // First see if the transaction has the fields we need.
  const EXPECTED_FIELDS = [
    'transactionPostDate',
    'transactionPostTime',
    'transactionAmount',
    'merchantDbaName',
    'merchantOrderId',
  ]
  const errors: string[] = []
  for (const f of EXPECTED_FIELDS) {
    if (!d[f]) {
      errors.push('Missing field ' + f)
    }
  }
  if (errors.length > 0) {
    return {'errors': errors} // TODO Better to throw
  }

  // Update the cell figure out which cell to put the order number in.
  // TODO these should throw if they fail, we (or caller) should catch
  // TODO don't update the order number is already filled in; complain if it is different
  const oc = await sheetState.getColumnNumber('Amazon Order Number')
  const ac = await sheetState.getColumnNumber('Amount')
  const fdc = await sheetState.getColumnNumber('Full Description')
  const or_reg = await sheetState.lookupFullDescriptionRowNumber('Full Description', d.merchantDbaName)
  const or = or_reg[0]
  const reg = or_reg[1]
  if (or < 0) {
    return {'errors': [`No row with Full Description='${d.merchantDbaName}'`]}
  }
  if (or == 0) {
    return {'errors': [`Multiple rows with Full Description='${d.merchantDbaName}'`]}
  }
  const rowBefore: [any] = (await sheetState.getRange(`Transactions!${or}:${or}`)).values[0]
  console.log('rowBefore='+JSON.stringify(rowBefore))
  if (rowBefore[oc-1]) {
    if (rowBefore[oc-1] == d.merchantOrderId)
      return {'infos': [`${d.merchantDbaName}: order number already set correctly`]}
    return {'errors': [`${d.merchantDbaName}: order number already set to ${rowBefore[oc-1]}, but new value is ${d.merchantOrderId}`]}  // TODO throw?
  }

  if (rowBefore[ac-1] != -1 * d.transactionAmount) {
    errors.push(`${d.merchantDbaName}: Unexpected Amount=${rowBefore[ac-1]} in sheet, expected ${-1 * d.transactionAmount}`)
  }
  // TODO this is too strict when we end up matching regex
  if (rowBefore[fdc-1] != d.merchantDbaName) {
    if (!reg || !rowBefore[fdc-1].match(reg)) {
      errors.push(`${d.merchantDbaName}: Unexpected Full Description=${rowBefore[fdc-1]} in sheet, expected ${d.merchantDbaName} or at least match ${reg}`)
    }
  }
  if (errors.length > 0) {
    return {'errors': errors}  // TODO throw
  }
  const url = `https://www.amazon.com/gp/your-account/order-details?ie=UTF8&orderID=${d.merchantOrderId}`
  const cell = `=HYPERLINK("${url}", "${d.merchantOrderId}")`
  await sheetState.setCell('Transactions', or, oc, cell)
  const expectedRowAfter = rowBefore.map(x => x)
  expectedRowAfter[oc-1] = cell
  console.log('expectedRowAfter='+JSON.stringify(expectedRowAfter))
  const actualRowAfter = (await sheetState.getRange(`Transactions!${or}:${or}`)).values[0]
  console.log('actualRowAfter='+JSON.stringify(actualRowAfter))
  // TODO do something helpful if they don't match up
  return {'response': d.merchantOrderId}
}

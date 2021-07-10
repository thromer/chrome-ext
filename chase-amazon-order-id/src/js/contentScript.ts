// import stringify from 'csv-stringify/lib/sync'
// const csv = require('csv-stringify/lib/sync')
// import stringify from 'csv-stringify/lib/sync'

// TODO
// * merge 'sale' and 'adjustment' into single field
// ** or simpler get amount and anything else we can from the list view
//    not the pop-up
// * search last (30) days
// * apps script to populate order id for me
// * DONE actually scrape everything
// * DONE download to csv
// * DONE encapsulate intermediate steps
// * casts are scary (' as ')
// * not-null checks are scary (!)
// * catch at end of promises
// * maybe wait for one of 'You've reached the end of your account activity.'
// * do it when requested not eagerly!
// * do it in hiding (doubtful!)

import * as save_file from './save_file';

function myLog(s: string) {
  console.log('THROMER ' + s)
}

function stringifyMap(m: Map<string, string>) {
  return Array.from(m.entries()).map(e => e[0] + ' => ' + e[1]).join(", ")
  // return JSON.stringify(Object.fromEntries(m.entries()))
}

const KEYS = ['sale', 'transaction date', 'posted date', 'merchant info', 'description', 'also known as', 'method', 'card number', 'category', 'amazon order number']

function toCsv(answer: Map<string, string>[]) {
  const table = [KEYS].concat(
    answer.map(m => KEYS.map(k => m.get(k) || '')))
  // return csv.stringify(table)
  return table.map(row => row.map(e => '"' + e + '"').join(',')).join('\n')
}

async function analyzeElement(elementString: string): Promise<Map<string, string>> {
  const element: HTMLElement = await waitForElement(elementString)
  element.click()
  await waitForTransactionDetails(elementString)
  const answer = transactionDetails(elementString + ' again')
  const closeElement: HTMLElement = await waitForElement('#flyoutClose')
  closeElement.click()
  // myLog('not fully returned answer ' + stringifyMap(answer))
  return answer
}

async function analyzeElementElement(element: HTMLElement, label: string): Promise<Map<string, string>> {
  element.click()
  await waitForTransactionDetails(label)
  const answer = transactionDetails(label + ' again')
  const closeElement: HTMLElement = await waitForElement('#flyoutClose')
  closeElement.click()
  // myLog('not fully returned answer ' + stringifyMap(answer))
  return answer
}

function main() {
  const csv = {'ha':'ho'}
  chrome.runtime.sendMessage({greeting: "hello", body: csv}, function(response) {
    console.log(response.farewell);
  })
  return
  // mainWithDynamicArray()
}

async function transactionList() {
  const table = await waitForElement('#activityTablesingleOVDAccountActivity')
  const clickableTransactions = table.querySelectorAll('.etd-action-icon')
}

function mainWithDynamicArray() {

  mainWithDynamicArrayPartial()
    .then(function(x) {
      const csv = toCsv(x)
      myLog(csv)
      myLog(x.map(e => stringifyMap(e)).join("; "))
      save_file.save(csv, 'chase_order_numbers.csv')
    })
  
}

async function mainWithDynamicArrayPartial() {
  // TODO will this run too soon?
  const footer = await waitForElement('.transaction-footer')
  myLog('footer text ' + footer.textContent)
  const table = await waitForElement('#activityTablesingleOVDAccountActivity')
  const clickableTransactions = table.querySelectorAll('.etd-action-icon')
  let answer: Map<string, string>[] = [];
  let i = 0 
  for (const e of clickableTransactions) {
    answer.push(await analyzeElementElement(e as HTMLElement, (i+1).toString()))
    i++
  }
  return answer
}

async function mainWithHardcodedArrayPartial() : Promise<Map<string, string>[]> {
  const elementStrings = ['#transactionDetailIcon0', '#transactionDetailIcon1', '#transactionDetailIcon2']
  var answer: Map<string, string>[] = [];
  for (const e of elementStrings) {
    answer.push(await analyzeElement(e))
  }
  return answer
}

function mainHardcodedArray() {

  mainWithHardcodedArrayPartial()
    .then(function(x) {
      const csv = toCsv(x)
      // myLog(csv)
      // myLog(x.map(e => stringifyMap(e)).join("; "))
      // save_file.save(csv, 'chase_order_numbers.csv')
      chrome.runtime.sendMessage({greeting: "hello", body: csv}, function(response) {
	console.log(response.farewell);
      })
    })
}

function waitForTransactionDetails(transactionId: string) {
  myLog('waitForTransactionDetails ' + transactionId)
  return predicateSatisfied(
    document.documentElement,
    {
      childList: true,
      subtree: true
    },
    () => {
      const m = transactionDetails('polling ' + transactionId)
      const dts = Array.from(document.querySelectorAll('dt')).map(
	e => e.textContent!.toLowerCase().trim())  // TypeScript
      const dds = Array.from(document.querySelectorAll('dd')).map(
	e => e.textContent || (e.querySelector('mds-link')! as HTMLElement).getAttribute('text'))
      const satisfiedOne = dts.includes('total amazon rewards points') &&
	dds.length >= dts.length && m.has('total amazon rewards points')
      const satisfiedTwo = dts.includes('merchant info') && m.get('merchant info') == 'REDEMPTION CREDIT'
      return satisfiedOne || satisfiedTwo
    },
      
      // },
    10000,
    //    'waiting for amazon order number'
    'waiting for total amazon rewards points'
  ).then(() => transactionId)
  // TODO are we supposed to catch too
}

function transactionDetails(transactionId: string) : Map<string, string> {
  myLog('transactionDetails for ' + transactionId)
  const dts = Array.from(document.querySelectorAll('dt')).map(
    e => e.textContent)
  myLog('dts.length= ' + dts.length)
  const dds = Array.from(document.querySelectorAll('dd')).map(
    e => e.textContent || (e.querySelector('mds-link') as HTMLElement).getAttribute('text'))
  myLog('dds.length= ' + dts.length)
  const m = new Map<string, string>()
  for (let i = 0; i < dts.length; i++) {
    m.set(dts[i]!.trim().toLowerCase(), dds[i]!.trim())
  }

  // My way works in browser but not in extension?  This is from
  // https://github.com/djedi/chase-amazon/blob/master/ext/src/inject/inject.js#L6
  const mdslink = document.querySelector("mds-link[id$=OrderNumber]");
  if (mdslink) {
    myLog('found magic ' + mdslink)
    const number = mdslink.shadowRoot!.querySelector('a')!.text
    myLog('found order ' + number)
    m.set('amazon order number', mdslink.shadowRoot!.querySelector('a')!.text)
  }
  myLog('in transaction details answer came out to ' + stringifyMap(m))
  return m
}

function predicateSatisfied(
  mutationTarget: HTMLElement,
  mutatationObserverOptions: MutationObserverInit,
  predicate: () => boolean,
  timeout: number,
  description: string) {
  return new Promise((resolve, reject) => {
    myLog('awaiting ' + description)
    if (predicate()) {
      myLog('that was quick ' + description)
      resolve(undefined)
    } else {
      new MutationObserver((mutationRecords, observer) => {
	let allDone = false
	mutationRecords.forEach(record => {
	  record.addedNodes.forEach(node => {
	    if (allDone || predicate()) {
	      allDone = true
	      myLog('satisfied ' + description)
	      resolve(undefined)
              observer.disconnect()
	    }
	  })
	})
      })
	.observe(mutationTarget, mutatationObserverOptions)
    }
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

main()

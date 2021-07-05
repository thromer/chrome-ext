// TODO
// * search last (30) days
// * actually scrape everything
//   * sequentially!
// * put it somewhere useful
// * encapsulate intermediate steps
// * casts are scary (' as ')
// * not-null checks are scary (!)
// * catch at end of promises

function myLog(s: string) {
  console.log('THROMER ' + s)
}

function stringifyMap(m: Map<string, string>) {
  return Array.from(m.entries()).map(e => e[0] + ' => ' + e[1]).join(", ")
  // return JSON.stringify(Object.fromEntries(m.entries()))
}

async function analyzeElement(elementString: string): Promise<Map<string, string>> {
  const element: HTMLElement = await waitForElement(elementString)
  element.click()
  await waitForTransactionDetails(elementString)
  const answer = transactionDetails(elementString + ' again')
  const closeElement: HTMLElement = await waitForElement('#flyoutClose')
  closeElement.click()
  myLog('not fully returned answer ' + stringifyMap(answer))
  return answer
}

function main() {
  mainHardcodedArray()
}

async function mainWithHardcodedArrayPartial() : Promise<Map<string, string>[]>{
  const elementStrings = ['#transactionDetailIcon0', '#transactionDetailIcon1', '#transactionDetailIcon2']
  var answer: Map<string, string>[] = [];
  for (const e of elementStrings) {
    answer.push(await analyzeElement(e))
  }
  return answer
}

function mainHardcodedArray() {
  mainWithHardcodedArrayPartial()
    .then(function(x) {myLog(x.map(e => stringifyMap(e)).join("; "))})
}

function mainHardcoded() {
  mainHardcodedPartial()
    .then(x => x)
}

async function mainHardcodedPartial() {
  const x = await analyzeElement('#transactionDetailIcon0')
  myLog('it worked! ' + stringifyMap(x))
  const y = await analyzeElement('#transactionDetailIcon1')
  myLog('it worked! ' + stringifyMap(y))
}
	   
	   


  // * probably all this guarantees is that they happen in order.
  // * but at least it works.
  // * i *think* it was very important for the argument then to be a lazily evaluated
  //   function that return a promise, not a direct invocation of waitForElement.
  //   but I don't really know

/*  

  // happily *this* behaves well.
  waitForElement('#transactionDetailIcon0')
    .then(() => waitForElement('#transactionDetailIcon0-iconanchor-wrapper'))
    .then(() => waitForElement('#posted-transactions-display'))
    .then(() => waitForElement('#waitForever'))
    .catch(function() {
      myLog('that exploded')
      return undefined
    });
  myLog("main")

  const transactionId = 'something or other'
  waitForElement('#transactionDetailIcon0')
    .then(() => waitForTransactionDetails(transactionId)
    .then(function() {
      myLog('clicking it');
      (document.querySelector("#transactionDetailIcon0")! as HTMLElement).click();
    })
    .then(transactionId => transactionDetails('REALLY ' + transactionId))
  //     .then(waitForPopup(transactionId))  // this does not wait very effectively!
    .then(function() {  // confuses me if i had to prefix with () =>  as i thought we're nested pretty deep as it is!
      myLog("I am returning a f''ing promise here so don't just merrily proceed to the next thing")
      return waitForElement('#flyoutClose')
    })
    .then(() => closePopup('who knows any more'))  // maybe my mistake was not () =>
    .then(() => waitForMainPage('really we lost track'))
  // TODO catch!


  return
  
    // TODO I suspect Promise.all will be bad since we actually need to execute
    // them in strict sequence ... my mental model is that when a promise starts
    // executing it will yield whenever it can, which will be unpleasant
    // () => Promise.all(grabSomeTransactions().map(
    //  transaction => grabTransactionDetailsAndReturn(transaction)))

  
  // flow is
  // first create a promise that for indication we can scrape
  // THEN create a bunch of promises for the things we see that we can script
  //   ...
  // so maybe
  // TODO maybe there's something better to wait for e.g. this might fire before all the transactions are on the page, who knows
  waitForElement('#transactionDetailIcon0')
    .then(() => grabTransactionDetailsAndReturn('Xhoho'))
    // now we should have a nice pile of transaction details? what do we do with them?
    .then(transactionDetailss => myLog(transactionDetailss)
    // what are we supposed to return if we're all done?
    // maybe it's ok since no one is calling us?
  ).catch(
    // e => myLog(e)  // TODO
  )
}

*/

/*

function grabSomeTransactions() {
  // just scrape all the transactions we see
  // for now we pretend
  myLog('grabSomeTransactions')
  return ['Xa'] // , 'Xb', 'Xc', 'Xd']  // doesn't work for more than one (if that)
}

// TODO how do i pass the order number back from the middle of the world here?
// TODO this should return a promise
function grabTransactionDetailsAndReturn(transactionId) {
  myLog('grabTransactionDetailsAndReturn ' + transactionId)
  // open the popup, grab the order number, and close the popup
  // needs to return a promise
  document.querySelector("#transactionDetailIcon0").click()
  myLog('grabTransactionDetailsAndReturn clicked')
    
  // TODO hmm

  // waitForElement('#transactionFlyoutContainer > div.footer.flyout-section > div > div').then(addToAnswer)
  // TODO I think we need to wait until we see a dt with 'Amazon order number'
  // mds-link isn't specific enough
  // waitForElement("#transactionFlyoutContainer > div:nth-child(6) > div > dl > div:nth-child(7) > dt").then(addToAnswer)
  return waitForTransactionDetails(transactionId)
    .then(transactionId => transactionDetails('REALLY ' + transactionId))
  //     .then(waitForPopup(transactionId))  // this does not wait very effectively!
    .then(() => function(transactionId) {  // confuses me if i had to prefix with () =>  as i thought we're nested pretty deep as it is!
      myLog("I am returning a f''ing promise here so don't just merrily proceed to the next thing")
      return waitForElement('#flyoutClose')
    })
    .then(closePopup('who knows any more'))
    .then(waitForMainPage('really we lost track'))
  // TODO catch!
}
*/

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
      // myLog(transactionId + ' in predicate ' + stringifyMap(m))
      // myLog(transactionId + ' hrm? ' + JSON.stringify(dts) + ' ' + JSON.stringify(dds))
      return dts.includes('amazon order number') &&
	dds.length >= dts.length && m.has('amazon order number')
    },
    10000,
    'waiting for amazon order number'
  ).then(() => transactionId)
  // TODO are we supposed to catch too
  // TODO will that even do what I want?
  // will this function all get executed in the right sequence?
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
    m.set(dts[i]!.trim().toLowerCase(), dds[i]!)
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

/*

function waitForPopup(arg) {
  return waitForElement('#flyoutClose ' + arg)
    .then(() => arg)
  // catch ?
}

function closePopup(arg) {
  myLog('clicking flyoutClose ' + arg)
  document.querySelector("#flyoutClose").click()
  return arg
}

function waitForMainPage(arg) {
  myLog('waitForMain ' + arg)
  waitForElement('#transactionDetailIcon0').then(  // TODO maybe there's something better to wait for e.g. this might fire before all the transactions are on the page, who knows
    () => arg)
  // TODO catch
}

// TODO global!
var ANSWER = []

// TODO implement timeout
// inspiration https://gist.github.com/jwilson8767/db379026efcbd932f64382db4b02853e
// Another example .https://blog.frankmtaylor.com/2017/06/16/promising-a-mutation-using-mutationobserver-and-promises-together/
*/

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
	      // myLog('[in observer]' + stringifyMap(transactionDetails('xyz')))
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

/*
function addToAnswer() {
  ANSWER.push(transactionDetails())
  document.querySelector("#flyoutClose")

  // TODO I don't understand how to use promises really
  // TODO should probably wait for the element to be available again ...
  myLog('ANSWER ' + JSON.stringify(ANSWER))

  // TODO I want to look at more than just the one
  // TODO I want to serialize the looking at them.
}
*/

/*
function analyze() {
  myLog('analyzing')
  
  // const paragraphCount = document.querySelectorAll('p').length
  // myLog('This document contains ' + paragraphCount + ' paragraph elements' )

  {
    // TODO well how about searching last 30 days *and* how about
    // trying them all?
    document.querySelector("#transactionDetailIcon0").click()
    
    // TODO hmm
    // waitForElement('dt').then(addToAnswer)
    // waitForElement('#transactionFlyoutContainer > div.footer.flyout-section > div > div').then(addToAnswer)
    // TODO I think we need to wait until we see a dt with 'Amazon order number'
    // mds-link isn't specific enough
    // waitForElement("#transactionFlyoutContainer > div:nth-child(6) > div > dl > div:nth-child(7) > dt").then(addToAnswer)
    predicateSatisfied(
      document.documentElement,
      {
        childList: true,
        subtree: true
      },
      () => {
	const m = transactionDetails()
	const dts = Array.from(document.querySelectorAll('dt')).map(
	  e => e.textContent.toLowerCase().trim())
	const dds = Array.from(document.querySelectorAll('dd')).map(
	  e => e.textContent || e.querySelector('mds-link')['text'])
	myLog('in predicate ' + stringifyMap(m))
	myLog('hrm? ' + JSON.stringify(dts) + ' ' +
		    JSON.stringify(dds))
	return dts.includes('amazon order number') &&
	  dds.length >= dts.length && m['amazon order number']
      },
      10000,
      transaction + ' waiting for amazon order number').then(addToAnswer)
  }
}
*/

/*
// TODO wait for search instead but how exactly?
// TODO and actually run a search

function oldMain() {
  waitForElement('#transactionDetailIcon0').then(analyze)
}
// waitForElement('#activityContainersingleOVDAccountActivity').then(analyze)
*/

main()

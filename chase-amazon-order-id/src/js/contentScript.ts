// TODO
// * search last (30) days
// * actually scrape everything
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
  // myLog('not fully returned answer ' + stringifyMap(answer))
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
      return dts.includes('amazon order number') &&
	dds.length >= dts.length && m.has('amazon order number')
    },
    10000,
    'waiting for amazon order number'
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

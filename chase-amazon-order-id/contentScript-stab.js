// TODO global!
var ANSWER = []

// TODO implement timeout
function predicateSatisfied(
  mutationTarget,
  mutatationObserverOptions,
  predicate,
  timeout,
  description) {
  return new Promise((resolve, reject) => {
    console.log('THROMER awaiting ' + description)
    if (predicate()) {
      console.log('THROMER that was quick ' + description)
      resolve()
    } else {
      new MutationObserver((mutationRecords, observer) => {
	mutationRecords.forEach(record => {
	  record.addedNodes.forEach(node => {
	    if (predicate()) {
	      console.log('THROMER [in observer ]' + JSON.stringify(transactionDetails()))
	      console.log('THROMER satisfied ' + description)
	      resolve()
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
function elementReady(selector) {
  return new Promise((resolve, reject) => {
    console.log('THROMER looking for ' + selector)
    let el = document.querySelector(selector)
    if (el) {
      console.log('THROMER done quickly ' + selector)
      resolve(el)
    }
    new MutationObserver((mutationRecords, observer) => {
      // Query for elements matching the specified selector
      Array.from(document.querySelectorAll(selector)).forEach((element) => {
	console.log('THROMER done observing ' + selector)
        resolve(element)
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

function transactionDetails() {
  const dts = Array.from(document.querySelectorAll('dt')).map(
    e => e.textContent)
  console.log('THROMER dts.length= ' + dts.length)
  const dds = Array.from(document.querySelectorAll('dd')).map(
    e => e.textContent || e.querySelector('mds-link')['text'])
  console.log('THROMER dds.length= ' + dts.length)
  const m = {}
  for (let i = 0; i < dts.length; i++) {
    m[dts[i].trim().toLowerCase()] = dds[i]
  }

  // My way works in browser but not in extension?  This is from
  // https://github.com/djedi/chase-amazon/blob/master/ext/src/inject/inject.js#L6
  const mdslink = document.querySelector("mds-link[id$=OrderNumber]");
  if (mdslink) {
    console.log('THROMER found magic ' + mdslink)
    const number = mdslink.shadowRoot.querySelector("a").text
    console.log('THROMER found order ' + number)
    m['amazon order number'] = mdslink.shadowRoot.querySelector("a").text
  }
  return m
}

function addToAnswer() {
  ANSWER.push(transactionDetails())
  document.querySelector("#flyoutClose")

  // TODO I don't understand how to use promises really
  // TODO should probably wait for the element to be available again ...
  console.log('THROMER ANSWER ' + JSON.stringify(ANSWER))

  // TODO I want to look at more than just the one
  // TODO I want to serialize the looking at them.
}

function analyze() {
  console.log('THROMER analyzing')
  
  // const paragraphCount = document.querySelectorAll('p').length
  // console.log( 'THROMER This document contains ' + paragraphCount + ' paragraph elements' )

  {
    // TODO well how about searching last 30 days *and* how about
    // trying them all?
    document.querySelector("#transactionDetailIcon0").click()
    
    // TODO hmm
    // elementReady('dt').then(addToAnswer)
    // elementReady('#transactionFlyoutContainer > div.footer.flyout-section > div > div').then(addToAnswer)
    // TODO I think we need to wait until we see a dt with 'Amazon order number'
    // mds-link isn't specific enough
    // elementReady("#transactionFlyoutContainer > div:nth-child(6) > div > dl > div:nth-child(7) > dt").then(addToAnswer)
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
	console.log('THROMER in predicate ' + JSON.stringify(m))
	console.log('THROMER hrm? ' + JSON.stringify(dts) + ' ' +
		    JSON.stringify(dds))
	return dts.includes('amazon order number') &&
	  dds.length >= dts.length && m['amazon order number']
      },
      10000,
      'waiting for amazon order number').then(addToAnswer)
  }
}

// TODO wait for search instead but how exactly?
// TODO and actually run a search

elementReady('#transactionDetailIcon0').then(analyze)
// elementReady('#activityContainersingleOVDAccountActivity').then(analyze)


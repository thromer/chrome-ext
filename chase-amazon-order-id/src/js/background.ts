/*
  chrome.runtime.onInstalled.addListener(() => {
  console.log('onInstalled')
  })
*/
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension")
    console.log(request.body)
    // alert(request.body)  alert is not defined

    // TODO is this async stuff ok here?

    chrome.identity.getAuthToken({interactive: true}, function(token) {
      let init = {
        method: 'GET',
        async: true,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        'contentType': 'json'
      }
      fetch(
	'https://content-sheets.googleapis.com/v4/spreadsheets/1UQQgW3kBfxNBB50q1pg4Hn2c6DvwoKVUF_9GelZ1k1Q',
	init)
	.then((response) => response.json())
	.then(function(data) {
	  console.log(JSON.stringify(data))  // goes into a black hole :(
	  // alert(JSON.stringify(data))  // alert is not defined
	  if (request.greeting === "hello") {
	    sendResponse({farewell: "ok goodbye"})
	  }
	})
	.catch(function(e) {
	  console.log(e)  // goes into a black hole :(
	  // alert(e)  // alert is not defined
	  if (request.greeting === "hello") {
	    sendResponse({farewell: "not ok goodbye"})
	  }
	})
      
    })
    return true
  })



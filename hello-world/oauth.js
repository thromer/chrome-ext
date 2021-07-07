window.onload = function() {
  document.querySelector('button').addEventListener('click', function() {
    chrome.identity.getAuthToken({interactive: true}, function(token) {
      let init = {
        method: 'GET',
        async: true,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        'contentType': 'json'
      };
      fetch(
	'https://ontent-sheets.googleapis.com/v4/spreadsheets/1UQQgW3kBfxNBB50q1pg4Hn2c6DvwoKVUF_9GelZ1k1Q?key=AIzaSyDAK21zJnikmqXn5GXurH5O2neIb2GCerg',
          init)
          .then((response) => response.json())
          .then(function(data) {
	    alert(JSON.stringify(data))
            console.log(JSON.stringify(data))  // goes into a black hole :(
          })
	.catch(function(e) {
	  console.log(e)  // goes into a black hole :(
	  alert(e)
	})
    });
  });
};


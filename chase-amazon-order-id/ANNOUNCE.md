Tiller Amazon Chrome Extension

I've written a Chrome Extension that mostly automates populating rows
in Tiller for Amazon line items, along with filling in an Amazon order
number column for Chase credit card transactions wherever possible.

Functionality:

* It adds a row for each line item in each Amazon order.

* For each Amazon order with discounts, coupons, rewards points,
  etc. it adds a pair of rows so that the totals of credit card
  transaction(s) and the order match.

* For Chase credit card transactions, it grabs the order number from
  the transaction details on chase.com (once you are logged in).

* It is all largely automated.

This first version is focused on my setup. That said, I'm open to
requests to generalize it, especially if they come in the form of
tested pull requests.

One time setup:

* Add an 'Amazon order' column to your Tiller transactions sheet.

* Install the extension from the Chrome Web Store or from source
  (DEVELOP.md).

* Review and accept the requested permissions.

* When installing from source you'll have to go through a extra step to say that you trust the extension.

* When prompted or via the 'options' menu on the extension, provide the URL of your Tiller spreadsheet.

Usage:

* Click the extension icon and select one or more of 'Add order number to Chase purchases on Amazon' and 'Split Amazon transactions' and click 'Go'. The icon will change from grey to yellow ('human help needed') or green ('running').

* If you clicked 'Add order number to Chase purchases' you'll be taken to the chase.com login page. Once logged in the 

* Once the updates complete, the icon will go back to grey.

* Visit your spreadsheet to see the results.

Known current limitations

* Only supports one Chase credit card at a time.

* Assumes you are already logged into Amazon.

* Hardcoded to update only up to the most 30 days of recent transactions.

I am *not* an experienced web or Chrome extension developer, so I
welcome please suggestions for improvements to the design or
implementation. Please be gentle!

I recommend grabbing the source, examining it, building, and using
development mode in chrome://extensions to load the extension. See
DEVELOP.md.

If you insist, though, you can also install from the Chrome Web Store
here. You can still examine the source, though some of it is a bit
mysterious since it is transpiled from TypeScript and packed by
Webpack.
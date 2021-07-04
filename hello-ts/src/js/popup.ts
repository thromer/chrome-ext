// Initialize button with user's preferred color
let changeColor = document.getElementById("changeColor")!;  // Assume we didn't forget to have such an element

chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color
});

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id! },   // TypeScript tab.id could be undefined but I don't care.
    function: setPageBackgroundColor,
  });
});

// The body of this function will be executed as a content script inside the
// current page
function setPageBackgroundColor() {
  chrome.storage.sync.get("color", ({ color }) => {
    document.body.style.backgroundColor = color;
  });
}

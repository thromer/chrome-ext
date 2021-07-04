let page = document.getElementById("buttonDiv")!;  // TypeScript assume we did manage to include buttonDiv
let selectedClassName = "current";
const presetButtonColors = ["#3aa757", "#e8453c", "#f9bb2d", "#4688f1"];

// Reacts to a button click by marking the selected button and saving
// the selection
function handleButtonClick(event: MouseEvent) {  // TypeScript // declare type
  let target = event.target as HTMLButtonElement  // TypeScript rely on having added it to a button below.
  // Remove styling from the previously selected color
  let current = target.parentElement!.querySelector(  // TypeScript I think it is a safe bet the element has a parentElement
    `.${selectedClassName}`
  );
  if (current && current !== target) {
    current.classList.remove(selectedClassName);
  }

  // Mark the button as selected
  let color = target.dataset.color;
  target.classList.add(selectedClassName);
  chrome.storage.sync.set({ color });
}

// Add a button to the page for each supplied color
function constructOptions(buttonColors: string[]) {  // TypeScript declare type
  chrome.storage.sync.get("color", (data) => {
    let currentColor = data.color;
    // For each color we were provided…
    for (let buttonColor of buttonColors) {
      // …create a button with that color…
      let button = document.createElement("button");  // TypeScript inferred HTMLButtonElement
      button.dataset.color = buttonColor;
      button.style.backgroundColor = buttonColor;

      // …mark the currently selected color…
      if (buttonColor === currentColor) {
        button.classList.add(selectedClassName);
      }

      // …and register a listener for when that button is clicked
      button.addEventListener("click", handleButtonClick);
      page.appendChild(button);  // TypeScript ok because of ! earlier
    }
  });
}

// Initialize the page by constructing the color options
constructOptions(presetButtonColors);

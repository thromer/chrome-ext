function handleChange(this: HTMLElement) {
  let statusDiv = document.getElementById("statusDiv");
  if (statusDiv === null) {
    alert("Extension broken: statusDiv missing from popup.html");
    return;
  }

  const files_elt = this as HTMLInputElement | null;  // type coercion needed?
  let message;
  if (files_elt === null) {
    message = 'files_elt is null?!';  // HERE
  } else {
    let files = files_elt.files;
    if (files === null) {
      message = 'files is null?!';
    } else if (files.length === 0) {
      message = 'files is zero length?!';
    } else {
      message = files![0].name;
    }
  }
  console.log(message);
  let result = document.createElement("p");
  result.textContent = message;
  statusDiv!.appendChild(result);
}

let main = function() {
  let statusDiv = document.getElementById("statusDiv");
  if (statusDiv === null) {
    alert("Extension broken: statusDiv missing from popup.html");
    return;
  }
  let filePickerDiv = document.getElementById("filePickerDiv");
  if (filePickerDiv === null) {
    let message = document.createElement("p");
    message.textContent = "Extension broken: filePickerDiv missing from popup.html";
    console.log(message.textContent);
    statusDiv.append(message);
    return;
  }
  let input = document.createElement("input");
  input.type = "file";
  input.accept = ".zip";
  input.addEventListener("change", handleChange, false);
  filePickerDiv.append(input);
}
main()
// Local Variables:
// compile-command: "(cd .. && npx webpack)"
// End:

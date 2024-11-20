const translateTextButton = document.getElementById("translate-button");
const inputField = document.getElementById("user-input-field");
const outputField = document.getElementById("user-output-text");
const inputInfoButton = document.getElementById("show-frequency-info-list");
const outputInfoButton = document.getElementById(
  "show-frequency-info-list-out"
);
const dialog = document.getElementById("dialog-window");
const overlay = document.getElementById("dialog-cover");
const dialogTextBox = document.getElementById("words-info-list");
const dialogExitButton = document.getElementById("dialog-exit-button");
const saveTxtFileButton = document.getElementById("save-txt-file");

translateTextButton.addEventListener("click", (e) => handleTranslationEvent());
inputInfoButton.addEventListener("click", (e) => handleTextInfo(false));
dialogExitButton.addEventListener("click", () => closeDialog());
outputInfoButton.addEventListener("click", (e) => handleTextInfo(true));
saveTxtFileButton.addEventListener("click", (e) => saveResultsToTxt());

function closeDialog() {
  dialog.style.display = "none";
  overlay.style.display = "none";
  dialogTextBox.innerHTML = "";
}

async function handleTextInfo(isOutput) {
  let target = isOutput ? outputField.textContent : inputField.value;
  const dataRsponce = await fetch(
    "/data_list?text=" + target + "&english=" + !isOutput
  );
  const textInfo = await dataRsponce.json();
  dialog.style.display = "flex";
  overlay.style.display = "flex";
  for (let item of textInfo) {
    console.log(item);
    let currentItem = document.createElement("li");
    currentItem.classList.add("text-data-list-item");
    let propertiesList = Object.entries(item);
    let currentSubItem = document.createElement("ol");
    currentSubItem.classList.add("text-data-sublist");
    for (property of propertiesList) {
      let propertyItem = document.createElement("li");
      propertyItem.classList.add("property-item");
      propertiesContent = Object.values(property);
      propertyItem.textContent =
        propertiesContent[0] + " : " + propertiesContent.slice(1);
      currentSubItem.appendChild(propertyItem);
    }
    currentItem.appendChild(currentSubItem);
    dialogTextBox.appendChild(currentItem);
  }
}

async function handleTranslationEvent() {
  try {
    console.log(inputField.value);
    translatedResponce = await fetch("/translation?text=" + inputField.value);
    translatedText = await translatedResponce.json();
    outputField.textContent = translatedText.result;
  } catch (error) {
    alert("Error: ", error);
  }
}

async function saveResultsToTxt() {
  const dataRsponce = await fetch(
    "/data_list?text=" + outputField.textContent + "&english=" + false
  );
  const textInfo = await dataRsponce.json();
  let dictString = "";
  for (let entry of textInfo) {
    dictString +=
      JSON.stringify(entry).replaceAll("{", "").replace("}", "") + "\n";
  }
  const text =
    "     Результат перевода\n Исходный текст:\n" +
    inputField.value +
    "\n Перевод:\n" +
    outputField.textContent +
    "\n Словарь с интаксической информацией: \n" +
    dictString;
  const anchor = document.createElement("a");
  const blob = new Blob([text], { type: "text/plain" });
  anchor.href = URL.createObjectURL(blob); // Create an object URL for the Blob
  anchor.download = "result.txt"; // Set the desired file name

  // Trigger the download
  anchor.click();

  // Clean up the object URL
  URL.revokeObjectURL(anchor.href);
}

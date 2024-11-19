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

translateTextButton.addEventListener("click", (e) => handleTranslationEvent());
inputInfoButton.addEventListener("click", (e) => handleTextInfo(false));
dialogExitButton.addEventListener("click", () => closeDialog());
outputInfoButton.addEventListener("click", (e) => handleTextInfo(true));

function closeDialog() {
  dialog.style.display = "none";
  overlay.style.display = "none";
  dialogTextBox.innerHTML = "";
}

async function handleTextInfo(isOutput) {
  target = isOutput ? outputField.textContent : inputField.value;
  dataRsponce = await fetch(
    "/data_list?text=" + target + "&english=" + !isOutput
  );
  textInfo = await dataRsponce.json();
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
    console.log(translatedText);
    outputField.textContent = translatedText.result;
  } catch (error) {
    alert("Error: ", error);
  }
}

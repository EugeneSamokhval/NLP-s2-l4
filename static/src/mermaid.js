import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@9/dist/mermaid.esm.min.mjs";

mermaid.initialize({ startOnLoad: true });
// Data structure
var treeData;
var currentIndex = 0;
const treeDialogCover = document.getElementById("dialog-cover-tree");
const treeDialog = document.getElementById("dialog-window-tree");
const treeCloseDialogButton = document.getElementById(
  "dialog-exit-button-tree"
);
const treeView = document.getElementById("mermaid");
const showTreeButton = document.getElementById("show-synt-tree");
const buttonBack = document.getElementById("previous-tree");
const buttonForward = document.getElementById("next-tree");

async function getTreeData() {
  const treeResponce = await fetch(
    "/synt_tree?text=" + outputField.textContent
  );
  treeData = await treeResponce.json();
  const graphDefinition = convertToMermaid(treeData[0]);
  mermaid.render("graphDiv", graphDefinition, (svgCode) => {
    treeView.innerHTML = svgCode;
  });
  treeDialog.style.display = "flex";
  treeDialogCover.style.display = "block";
}

async function swapTree(isForward) {
  console.log(treeData[currentIndex]);
  if (treeData.length > currentIndex + 1 && isForward) {
    const graphDefinition = convertToMermaid(treeData[currentIndex + 1]);
    mermaid.render("graphDiv", graphDefinition, (svgCode) => {
      treeView.innerHTML = svgCode;
    });
    currentIndex++;
  } else if (currentIndex - 1 > 0 && !isForward) {
    const graphDefinition = convertToMermaid(treeData[currentIndex - 1]);
    mermaid.render("graphDiv", graphDefinition, (svgCode) => {
      treeView.innerHTML = svgCode;
    });
    currentIndex--;
  }
}
buttonBack.addEventListener("click", () => swapTree(false));
buttonForward.addEventListener("click", () => swapTree(true));
treeCloseDialogButton.addEventListener("click", () => closeTreeDialog());
showTreeButton.addEventListener("click", () => {
  getTreeData();
});

function closeTreeDialog() {
  treeDialog.style.display = "none";
  treeDialogCover.style.display = "none";
  treeView.innerHTML = "";
}

// Function to convert data to Mermaid syntax
function convertToMermaid(data) {
  let mermaidSyntax = "graph TD\n";
  let count = 1;
  function processNode(node, parent) {
    if (Array.isArray(node[0])) {
      node.forEach((child) => {
        const childNodeId = `node${count++}`;
        mermaidSyntax += `${parent} --> ${childNodeId}["${child[0][0]} (${child[0][1]})"]\n`;
        processNode(child, childNodeId);
      });
    } else {
      const childNodeId = `node${count++}`;
      mermaidSyntax += `${parent} --> ${childNodeId}["${node[0]} (${node[1]})"]\n`;
    }
  }
  const rootId = `node${count++}`;
  mermaidSyntax += `${rootId}["Root"]\n`;
  data.forEach((node) => processNode(node, rootId));
  return mermaidSyntax;
}

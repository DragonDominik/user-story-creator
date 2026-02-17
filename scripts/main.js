import { addTable } from "./tableHandler.js";
import { exportTables, importTables } from "./fileHandler.js";
import { resizeTextArea } from "./utils.js";

let tableNumber = 0;
window.resizeTextArea = resizeTextArea;

const newTableButton = document.querySelector("#newTableButton");
newTableButton.addEventListener("click", startAddingTables);

function startAddingTables() {
  const container = document.querySelector("#tableContainer");
  const message = container.querySelector("#addTableMessage");
 
  if(message){
    message.remove();
  }

  addTable(incrementTableNumber());
}

const exportButton = document.querySelector("#exportButton");
exportButton.addEventListener("click", exportTables);

const importButton = document.querySelector("#importButton");
importButton.addEventListener("click", () =>
  importTables(
    () => tableNumber,
    (num) => {
      tableNumber = num;
    },
  ),
);

function incrementTableNumber() {
  return tableNumber++;
}
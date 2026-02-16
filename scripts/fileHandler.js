import { addTable } from "./tableHandler.js";

// export tables to json
export function exportTables() {
  const container = document.querySelector("#tableContainer");
  const tables = [];

  // go through each table
  container.querySelectorAll("[data-table-id]").forEach((tableBox) => {
    const table = tableBox.querySelector("table");
    const tableId = tableBox.dataset.tableId;
    const rows = [];

    const tbody = table.querySelector("tbody");
    const allTrs = tbody.querySelectorAll("tr");

    for (let i = 0; i < allTrs.length; i += 3) {
      const asTextCell = allTrs[i].querySelector("td[rowspan='3'] textarea");
      const givenCell = allTrs[i].querySelectorAll("td")[2].querySelector("textarea");
      const whenCell = allTrs[i + 1].querySelectorAll("td")[1].querySelector("textarea");
      const thenCell = allTrs[i + 2].querySelectorAll("td")[1].querySelector("textarea");

      rows.push({
        asText: asTextCell.value,
        given: givenCell.value,
        when: whenCell.value,
        then: thenCell.value,
      });
    }

    tables.push({
      id: tableId,
      rowNumber: parseInt(table.dataset.rowNumber),
      rows: rows,
    });
  });

  // create json and download
  const jsonData = JSON.stringify({ tables }, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `user-cases-${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// import from json
export function importTables(getTableNumber, setTableNumber) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        loadTablesFromData(data, getTableNumber, setTableNumber);
      } catch (error) {
        alert("Hiba történt a fájl betöltése során. Ellenőrizd a fájl formátumát.");
        console.error("Import error:", error);
      }
    };
    reader.readAsText(file);
  });

  input.click();
} // load helper
function loadTablesFromData(data, getTableNumber, setTableNumber) {
  const container = document.querySelector("#tableContainer");

  // get current table id
  let currentTableNumber = getTableNumber();

  const message = container.querySelector("#addTableMessage");

  if (message) {
    message.remove();
  }

  data.tables.forEach((tableData) => {
    // add table
    addTable(currentTableNumber);

    const tableBox = container.querySelector(`[data-table-id="${currentTableNumber}"]`);
    const table = tableBox.querySelector("table");
    const tbody = table.querySelector("tbody");

    // reset tbody
    tbody.innerHTML = "";

    table.dataset.rowNumber = tableData.rowNumber;

    tableData.rows.forEach((rowData, index) => {
      const rowColor = index % 2 === 0 ? "#B0D4FF" : "#D6E9FF";

      const steps = ["GIVEN", "WHEN", "THEN"];
      const values = [rowData.given, rowData.when, rowData.then];

      steps.forEach((step, stepIndex) => {
        const tr = document.createElement("tr");
        tr.style.backgroundColor = rowColor;

        if (stepIndex === 0) {
          const tdMain = document.createElement("td");
          tdMain.className = "border border-black w-[25%]";
          tdMain.rowSpan = 3;

          const textarea = document.createElement("textarea");
          textarea.oninput = () => resizeTextArea(textarea);
          textarea.className =
            "w-full max-w-full min-h-[3em] max-h-[1000em] resize-none bg-transparent box-border p-1";
          textarea.value = rowData.asText;

          tdMain.appendChild(textarea);
          tr.appendChild(tdMain);
        }

        const tdStep = document.createElement("td");
        tdStep.className = "border border-black text-center w-[10%] font-bold";
        tdStep.innerText = step;
        tr.appendChild(tdStep);

        const tdDesc = document.createElement("td");
        tdDesc.className = "border border-black w-[65%]";

        const textareaDesc = document.createElement("textarea");
        textareaDesc.oninput = () => resizeTextArea(textareaDesc);
        textareaDesc.className =
          "w-full max-w-full min-h-[1em] max-h-[1000em] resize-none bg-transparent box-border p-1";
        textareaDesc.value = values[stepIndex];

        tdDesc.appendChild(textareaDesc);
        tr.appendChild(tdDesc);

        tbody.appendChild(tr);
      });
    });

    // resize all textareas
    tableBox.querySelectorAll("textarea").forEach((textarea) => {
      window.resizeTextArea(textarea);
    });

    currentTableNumber++;
  });

  setTableNumber(currentTableNumber);
}

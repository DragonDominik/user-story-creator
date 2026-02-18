export function addTable(tableNumber) {
  const container = document.querySelector("#tableContainer");

  //table
  const table = document.createElement("table");
  table.className = "w-[800px] table-auto border-collapse border border-black text-left mb-2";
  table.dataset.rowNumber = 0;

  table.innerHTML = `
      <thead>
        <tr style="background-color: #4A90E2; font-weight: normal">
          <th class="border border-black px-1 py-2 w-[25%] font-normal">Eset</th>
          <th class="border border-black px-1 py-2 w-[10%] font-normal"></th>
          <th class="border border-black px-1 py-2 w-[65%] font-normal">Leírás</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    `;

  //div to contain table and buttons
  const tableBox = document.createElement("div");
  tableBox.className = "flex flex-col gap-2 w-full items-center justify-center h-fit";
  tableBox.dataset.tableId = tableNumber;
  tableBox.appendChild(table);

  const buttonRow = document.createElement("div");
  buttonRow.className = "flex flex-row gap-4 w-full items-center justify-center";

  //buttons
  const addRowButton = createButton("Sor hozzáadása");
  addRowButton.addEventListener("click", () => addRows(table));

  const delRowButton = createButton("Sor törlése");
  delRowButton.addEventListener("click", () => delRows(table));

  const delTableButton = createButton("Tábla törlése");
  delTableButton.addEventListener("click", () => delTable(container, tableBox));

  const screenshotButton = createButton("Word-be másol");
  screenshotButton.addEventListener("click", () => screenshotComponent(table));

  buttonRow.append(addRowButton, delRowButton, delTableButton, screenshotButton);
  tableBox.append(buttonRow);

  //initial rows
  addRows(table);

  container.appendChild(tableBox);
}

function createButton(text) {
  const button = document.createElement("button");
  button.className =
    "bg-blue-500 px-4 py-2 rounded-lg hover:scale-[1.05] hover:bg-blue-600 transition-all duration-300 active:scale-[0.95] active:bg-gray-700 text-lg font-bold";
  button.innerText = text;
  return button;
}

//adds rows to table
function addRows(table) {
  const tbody = table.querySelector("tbody");
  const rowColor = table.dataset.rowNumber % 2 === 0 ? "#B0D4FF" : "#D6E9FF";
  table.dataset.rowNumber++;

  const steps = ["GIVEN", "WHEN", "THEN"];
  const rowHeight = [3, 1, 1]; //rowspan

  steps.forEach((step, index) => {
    const tr = document.createElement("tr");
    tr.style.backgroundColor = rowColor;

    if (index === 0) {
      const tdMain = document.createElement("td");
      tdMain.className = "border border-black w-[25%]";
      tdMain.rowSpan = 3;
      const textarea = document.createElement("textarea");
      textarea.oninput = () => resizeTextArea(textarea);
      textarea.className =
        "w-full max-w-full min-h-0 max-h-[1000em] resize-none bg-transparent box-border p-1";
      textarea.rows = 1;
      textarea.value = "text";
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
      "w-full max-w-full min-h-0 max-h-[1000em] resize-none bg-transparent box-border p-1";
    textareaDesc.rows = 1;
    textareaDesc.value = "text";
    tdDesc.appendChild(textareaDesc);
    tr.appendChild(tdDesc);

    tbody.appendChild(tr);
  });
}

function delRows(table) {
  const tbody = table.querySelector("tbody");

  if (table.dataset.rowNumber == 1) return;

  for (let i = 0; i < 3; i++) {
    tbody.removeChild(tbody.lastElementChild);
  }

  table.dataset.rowNumber--;
}

function delTable(container, tableBox) {
  tableBox.remove();

  if (container.children.length === 0 && !container.querySelector("#addTableMessage")) {
    const message = document.createElement("div");
    message.id = "addTableMessage";
    message.innerText = "Adj hozzá egy táblát a kezdéshez!";
    container.appendChild(message);
  }
}

async function screenshotComponent(table) {
  if (!navigator.clipboard || !window.ClipboardItem) {
    alert("A bőngésződ nem támogatja a clipboard API-t. Használj inkább Chrome/Firefox-ot.");
    return;
  }

  try {
    const tableClone = table.cloneNode(true);
    tableClone.style.width = "100%";
    tableClone.style.borderCollapse = "collapse";

    const rows = tableClone.querySelectorAll("tr");
    if (rows.length > 0) {
      const firstRowCells = rows[0].querySelectorAll("th, td");
      if (firstRowCells.length >= 3) {
        // first 2 col width
        firstRowCells[0].style.width = "25%";
        firstRowCells[1].style.width = "15%";
      }
    }

    tableClone.querySelectorAll("td, th").forEach((cell) => {
      const s = getComputedStyle(cell);
      cell.style.padding = s.padding;
      cell.style.border = s.border || "1px solid black";
      cell.style.textAlign = s.textAlign;
      cell.style.verticalAlign = s.verticalAlign;
    });

    //replace textareas
    tableClone.querySelectorAll("input, textarea").forEach((input) => {
      const span = document.createElement("span");
      span.textContent = input.value;
      span.style.font = getComputedStyle(input).font;
      input.replaceWith(span);
    });

    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([tableClone.outerHTML], { type: "text/html" }),
        "text/plain": new Blob([tableClone.innerText], { type: "text/plain" }),
      }),
    ]);

    alert("Tábla kimásolva MS WORD formátumra!");
  } catch (err) {
    console.error(err);
    alert("Hiba történt! Próbáld újra!");
  }
}
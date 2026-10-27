
const $ = (id) => document.getElementById(id);

const algorithms = {
  bubble: {
    title: "Bubble Sort",
    type: "SORTING",
    description: "Compare neighboring values and swap them when out of order.",
    complexity: "O(n²)",
    code: `for i = 0 to n - 1
  for j = 0 to n - i - 2
    if A[j] > A[j + 1]
      swap(A[j], A[j + 1])

// Largest values bubble right`
  },

  selection: {
    title: "Selection Sort",
    type: "SORTING",
    description: "Find the smallest remaining value and put it in the next position.",
    complexity: "O(n²)",
    code: `for i = 0 to n - 1
  min = i
  for j = i + 1 to n - 1
    if A[j] < A[min]
      min = j
  swap(A[i], A[min])

// Grow the sorted prefix`
  },

  merge: {
    title: "Merge Sort",
    type: "SORTING",
    description: "Divide the array into smaller parts, sort them, and merge them.",
    complexity: "O(n log n)",
    code: `function mergeSort(A):
  if length(A) <= 1:
    return A

  mid = floor(n / 2)
  left = mergeSort(left half)
  right = mergeSort(right half)

  return merge(left, right)

// Divide, sort, combine`
  },

  linear: {
    title: "Linear Search",
    type: "SEARCHING",
    description: "Check each element until the target is found.",
    complexity: "O(n)",
    code: `for i = 0 to n - 1
  if A[i] == target
    return i

return -1

// Works on unsorted arrays`
  },

  binary: {
    title: "Binary Search",
    type: "SEARCHING",
    description: "Repeatedly halve a sorted array to locate the target.",
    complexity: "O(log n)",
    code: `low = 0
high = n - 1

while low <= high
  mid = floor((low + high) / 2)

  if A[mid] == target
    return mid

  if A[mid] < target
    low = mid + 1
  else
    high = mid - 1

// Requires sorted input`
  }
};

let algorithm = "bubble";
let array = [];
let originalArray = [];
let steps = [];
let stepIndex = 0;

let comparisons = 0;
let moves = 0;
let traceEvents = [];

let running = false;
let timer = null;
let elapsedTimer = null;
let startedAt = 0;
let accumulatedTime = 0;

// -----------------------------
// Utility functions
// -----------------------------

function randomArray(size) {
  return Array.from(
    { length: size },
    () => Math.floor(Math.random() * 89) + 10
  );
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function stopSimulation() {
  if (timer !== null) {
    clearTimeout(timer);
  }

  if (elapsedTimer !== null) {
    clearInterval(elapsedTimer);
  }

  timer = null;
  elapsedTimer = null;
  running = false;

  const runButton = $("runBtn");

  if (runButton) {
    runButton.textContent = "▶ Run simulation";
  }
}

function resetCounters() {
  comparisons = 0;
  moves = 0;
  accumulatedTime = 0;

  updateMetrics();
}

function updateMetrics() {
  $("comparisons").textContent = comparisons.toLocaleString();
  $("swaps").textContent = moves.toLocaleString();
  $("length").textContent = array.length;

  let elapsed = accumulatedTime;

  if (running) {
    elapsed += (Date.now() - startedAt) / 1000;
  }

  $("elapsed").innerHTML =
    elapsed.toFixed(2) +
    '<span style="font-size:12px">s</span>';
}

function addTrace(message) {
  traceEvents.unshift(message);
  traceEvents = traceEvents.slice(0, 30);

  $("trace").innerHTML = traceEvents.map((message, index) => `
    <div class="trace-item">
      <b>${String(traceEvents.length - index).padStart(2, "0")}</b>
      ${escapeHTML(message)}
    </div>
  `).join("");

  $("traceCount").textContent = traceEvents.length + " EVENTS";
}

// -----------------------------
// Algorithm step builder
// -----------------------------

function addStep(
  values,
  kind,
  indices,
  message,
  comparisonCount = 0,
  moveCount = 0,
  sortedIndices = [],
  activeRange = []
) {
  steps.push({
    values: values.slice(),
    kind,
    indices: indices.slice(),
    message,
    comparisonCount,
    moveCount,
    sortedIndices: sortedIndices.slice(),
    activeRange: activeRange.slice()
  });
}

function buildSortingSteps() {
  const values = originalArray.slice();
  const n = values.length;

  if (algorithm === "bubble") {
    const sorted = [];

    for (let i = 0; i < n - 1; i++) {
      let changed = false;

      for (let j = 0; j < n - i - 1; j++) {
        addStep(
          values,
          "compare",
          [j, j + 1],
          `Compare ${values[j]} and ${values[j + 1]}.`,
          1,
          0,
          sorted
        );

        if (values[j] > values[j + 1]) {
          const first = values[j];
          values[j] = values[j + 1];
          values[j + 1] = first;

          changed = true;

          addStep(
            values,
            "swap",
            [j, j + 1],
            `Swap ${values[j]} and ${values[j + 1]}.`,
            0,
            1,
            sorted
          );
        }
      }

      sorted.push(n - i - 1);

      addStep(
        values,
        "sorted",
        [n - i - 1],
        `Pass ${i + 1} complete. Position ${n - i} is sorted.`,
        0,
        0,
        sorted
      );

      if (!changed) {
        for (let k = 0; k < n - i - 1; k++) {
          sorted.push(k);
        }

        break;
      }
    }

    addStep(
      values,
      "done",
      [],
      "Bubble sort complete. The array is sorted.",
      0,
      0,
      Array.from({ length: n }, (_, i) => i)
    );
  }

  if (algorithm === "selection") {
    const sorted = [];

    for (let i = 0; i < n - 1; i++) {
      let minimum = i;

      for (let j = i + 1; j < n; j++) {
        addStep(
          values,
          "compare",
          [minimum, j],
          `Compare current minimum ${values[minimum]} with ${values[j]}.`,
          1,
          0,
          sorted
        );

        if (values[j] < values[minimum]) {
          minimum = j;

          addStep(
            values,
            "minimum",
            [minimum],
            `${values[minimum]} is the new minimum.`,
            0,
            0,
            sorted
          );
        }
      }

      if (minimum !== i) {
        [values[i], values[minimum]] =
          [values[minimum], values[i]];

        addStep(
          values,
          "swap",
          [i, minimum],
          `Place ${values[i]} into sorted position ${i + 1}.`,
          0,
          1,
          sorted
        );
      }

      sorted.push(i);

      addStep(
        values,
        "sorted",
        [i],
        `Position ${i + 1} is sorted.`,
        0,
        0,
        sorted
      );
    }

    addStep(
      values,
      "done",
      [],
      "Selection sort complete.",
      0,
      0,
      Array.from({ length: n }, (_, i) => i)
    );
  }

  if (algorithm === "merge") {
    function mergeSort(left, right) {
      if (right - left <= 1) {
        return;
      }

      const middle = Math.floor((left + right) / 2);

      addStep(
        values,
        "split",
        Array.from(
          { length: right - left },
          (_, index) => left + index
        ),
        `Divide the segment into ${left + 1}–${middle} and ${middle + 1}–${right}.`
      );

      mergeSort(left, middle);
      mergeSort(middle, right);

      const leftValues = values.slice(left, middle);
      const rightValues = values.slice(middle, right);

      let i = 0;
      let j = 0;
      let k = left;

      while (i < leftValues.length && j < rightValues.length) {
        addStep(
          values,
          "compare",
          [left + i, middle + j],
          `Compare ${leftValues[i]} and ${rightValues[j]}.`,
          1
        );

        if (leftValues[i] <= rightValues[j]) {
          values[k] = leftValues[i];
          i++;
        } else {
          values[k] = rightValues[j];
          j++;
        }

        addStep(
          values,
          "move",
          [k],
          `Write ${values[k]} into position ${k + 1}.`,
          0,
          1
        );

        k++;
      }

      while (i < leftValues.length) {
        values[k] = leftValues[i];

        addStep(
          values,
          "move",
          [k],
          `Copy remaining value ${values[k]}.`,
          0,
          1
        );

        i++;
        k++;
      }

      while (j < rightValues.length) {
        values[k] = rightValues[j];

        addStep(
          values,
          "move",
          [k],
          `Copy remaining value ${values[k]}.`,
          0,
          1
        );

        j++;
        k++;
      }

      addStep(
        values,
        "merged",
        Array.from(
          { length: right - left },
          (_, index) => left + index
        ),
        `Merged ${right - left} values into sorted order.`
      );
    }

    mergeSort(0, n);

    addStep(
      values,
      "done",
      [],
      "Merge sort complete.",
      0,
      0,
      Array.from({ length: n }, (_, i) => i)
    );
  }
}

function buildSearchSteps() {
  let values = originalArray.slice();

  if (algorithm === "binary") {
    values.sort((a, b) => a - b);
  }

  array = values.slice();

  const target = Number($("target").value);

  let foundIndex = -1;

  if (algorithm === "linear") {
    for (let i = 0; i < values.length; i++) {
      addStep(
        values,
        "compare",
        [i],
        `Check index ${i}, value ${values[i]}, against target ${target}.`,
        1
      );

      if (values[i] === target) {
        foundIndex = i;

        addStep(
          values,
          "found",
          [i],
          `Target ${target} found at index ${i}, position ${i + 1}.`,
          0,
          0,
          [i]
        );

        break;
      }
    }
  }

  if (algorithm === "binary") {
    let low = 0;
    let high = values.length - 1;

    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const value = values[middle];

      addStep(
        values,
        "compare",
        [middle],
        `Check middle index ${middle}: value ${value}, target ${target}.`,
        1,
        0,
        [],
        Array.from(
          { length: high - low + 1 },
          (_, index) => low + index
        )
      );

      if (value === target) {
        foundIndex = middle;

        addStep(
          values,
          "found",
          [middle],
          `Target ${target} found at index ${middle}, position ${middle + 1}.`,
          0,
          0,
          [middle]
        );

        break;
      }

      if (value < target) {
        low = middle + 1;

        addStep(
          values,
          "range",
          [],
          `${value} is too small. Continue in the right half.`,
          0,
          0,
          [],
          Array.from(
            { length: Math.max(0, high - low + 1) },
            (_, index) => low + index
          )
        );
      } else {
        high = middle - 1;

        addStep(
          values,
          "range",
          [],
          `${value} is too large. Continue in the left half.`,
          0,
          0,
          [],
          Array.from(
            { length: Math.max(0, high - low + 1) },
            (_, index) => low + index
          )
        );
      }
    }
  }

  if (foundIndex === -1) {
    addStep(
      values,
      "done",
      [],
      `Target ${target} was not found in the array.`
    );
  } else {
    addStep(
      values,
      "done",
      [foundIndex],
      `Search finished. Target found at index ${foundIndex}.`,
      0,
      0,
      [foundIndex]
    );
  }
}

function buildSteps() {
  steps = [];
  stepIndex = 0;

  if (algorithm === "bubble" ||
      algorithm === "selection" ||
      algorithm === "merge") {
    buildSortingSteps();
  } else {
    buildSearchSteps();
  }
}

// -----------------------------
// Visualization
// -----------------------------

function render(state = null) {
  const values = state ? state.values : array;

  if (!values.length) {
    $("viz").innerHTML = "";
    return;
  }

  const maximum = Math.max(...values, 1);

  const active = state ? state.indices : [];
  const sorted = state ? state.sortedIndices : [];
  const range = state ? state.activeRange : [];

  $("viz").innerHTML = "";

  values.forEach((value, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "bar-wrap";

    const bar = document.createElement("div");
    bar.className = "bar";

    bar.style.height =
      Math.max(4, (value / maximum) * 88) + "%";

    const label = document.createElement("span");
    label.textContent = value;

    bar.appendChild(label);

    if (sorted.includes(index)) {
      bar.classList.add("sorted");
    }

    if (active.includes(index)) {
      if (state.kind === "swap") {
        bar.classList.add("swap");
      } else if (
        state.kind === "found" ||
        state.kind === "done"
      ) {
        bar.classList.add("found");
      } else {
        bar.classList.add("compare");
      }
    }

    if (
      state &&
      state.kind === "range" &&
      !range.includes(index)
    ) {
      bar.style.opacity = "0.25";
    }

    wrapper.appendChild(bar);
    $("viz").appendChild(wrapper);
  });
}

// -----------------------------
// Simulation controls
// -----------------------------

function executeStep() {
  if (stepIndex >= steps.length) {
    stopSimulation();

    $("state").textContent = "Complete";
    $("progress").textContent = "Simulation complete";

    return false;
  }

  const step = steps[stepIndex];

  array = step.values.slice();

  comparisons += step.comparisonCount;
  moves += step.moveCount;

  render(step);
  updateMetrics();

  stepIndex++;

  $("progress").textContent =
    `Step ${stepIndex} / ${steps.length}`;

  $("state").textContent =
    step.kind === "done" ? "Complete" : "Running";

  addTrace(step.message);

  if (step.kind === "found") {
    $("searchResult").textContent = "✓ " + step.message;
  }

  if (
    step.kind === "done" &&
    (algorithm === "linear" || algorithm === "binary")
  ) {
    $("searchResult").textContent = step.message;
  }

  if (stepIndex >= steps.length) {
    stopSimulation();

    $("state").textContent = "Complete";
    $("progress").textContent = "Simulation complete";
  }

  return true;
}

function runSimulation() {
  if (running) {
    accumulatedTime += (Date.now() - startedAt) / 1000;
    stopSimulation();
    updateMetrics();

    $("state").textContent = "Paused";
    return;
  }

  if (!steps.length || stepIndex >= steps.length) {
    resetCounters();
    buildSteps();

    if (algorithm === "linear" || algorithm === "binary") {
      render({ values: array, kind: "none", indices: [], sortedIndices: [] });
    }
  }

  if (!steps.length) {
    return;
  }

  running = true;
  startedAt = Date.now();

  $("runBtn").textContent = "Ⅱ Pause";
  $("state").textContent = "Running";

  elapsedTimer = setInterval(updateMetrics, 100);

  function tick() {
    if (!running) {
      return;
    }

    if (!executeStep()) {
      return;
    }

    if (running) {
      timer = setTimeout(
        tick,
        Number($("speed").value) || 300
      );
    }
  }

  tick();
}

function resetSimulation() {
  stopSimulation();

  array = originalArray.slice();
  steps = [];
  stepIndex = 0;
  traceEvents = [];

  resetCounters();
  render();

  $("trace").innerHTML =
    '<div class="trace-item">Simulation reset. Ready for a new run.</div>';

  $("traceCount").textContent = "0 EVENTS";
  $("progress").textContent = "Ready to initialize";
  $("state").textContent = "Ready";

  $("searchResult").textContent =
    algorithm === "linear" || algorithm === "binary"
      ? "Set your target, then run the search."
      : "Select Linear Search or Binary Search to activate search mode.";
}

function initialize() {
  stopSimulation();

  const requestedSize = parseInt($("size").value, 10) || 18;
  const size = Math.max(5, Math.min(36, requestedSize));

  $("size").value = size;

  originalArray = randomArray(size);
  array = originalArray.slice();

  steps = [];
  stepIndex = 0;
  traceEvents = [];

  resetCounters();
  render();

  $("trace").innerHTML =
    '<div class="trace-item">System initialized. Choose an algorithm and run the simulation.</div>';

  $("traceCount").textContent = "0 EVENTS";
  $("progress").textContent = "Ready to initialize";
  $("state").textContent = "Ready";

  $("searchResult").textContent =
    algorithm === "linear" || algorithm === "binary"
      ? "Set your target, then run the search."
      : "Select Linear Search or Binary Search to activate search mode.";
}

// -----------------------------
// Algorithm selection
// -----------------------------

function selectAlgorithm(name) {
  if (!algorithms[name]) {
    return;
  }

  stopSimulation();

  algorithm = name;

  document.querySelectorAll(".algo-btn").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.algo === algorithm
    );
  });

  const info = algorithms[algorithm];

  $("algoTitle").innerHTML =
    `${info.title} <span class="tag">${info.type}</span>`;

  $("algoDesc").textContent = info.description;
  $("complexity").textContent = info.complexity;

  $("code").textContent = info.code;

  const isSearch = algorithm === "linear" || algorithm === "binary";

  $("searchBtn").disabled = !isSearch;
  $("target").disabled = !isSearch;
  $("setTarget").disabled = !isSearch;

  if (algorithm === "binary") {
    originalArray.sort((a, b) => a - b);
    array = originalArray.slice();

    $("searchResult").textContent =
      "Binary search uses a sorted array. The values are sorted automatically.";
  } else if (algorithm === "linear") {
    $("searchResult").textContent =
      "Linear search checks each value in the current array order.";
  } else {
    $("searchResult").textContent =
      "Select Linear Search or Binary Search to activate search mode.";
  }

  initialize();
}

// -----------------------------
// Search helpers
// -----------------------------

function chooseTargetFromArray() {
  if (!originalArray.length) {
    return;
  }

  const index = Math.floor(Math.random() * originalArray.length);

  $("target").value = originalArray[index];

  $("searchResult").textContent =
    `Target selected: ${originalArray[index]}. Click Find target to begin.`;
}

function beginSearch() {
  if (algorithm !== "linear" && algorithm !== "binary") {
    $("searchResult").textContent =
      "Please select Linear Search or Binary Search first.";
    return;
  }

  stopSimulation();

  steps = [];
  stepIndex = 0;
  traceEvents = [];

  resetCounters();
  buildSearchSteps();

  $("trace").innerHTML = "";
  $("traceCount").textContent = "0 EVENTS";

  $("progress").textContent = "Search initialized";
  $("searchResult").textContent = "Searching...";

  runSimulation();
}

// -----------------------------
// Event listeners
// -----------------------------

$("randomBtn").addEventListener("click", initialize);

$("applySize").addEventListener("click", initialize);

$("runBtn").addEventListener("click", runSimulation);

$("stepBtn").addEventListener("click", () => {
  stopSimulation();

  if (!steps.length || stepIndex >= steps.length) {
    resetCounters();
    buildSteps();
  }

  executeStep();
});

$("resetBtn").addEventListener("click", resetSimulation);

$("searchBtn").addEventListener("click", beginSearch);

$("setTarget").addEventListener("click", chooseTargetFromArray);

$("target").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    beginSearch();
  }
});

$("size").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    initialize();
  }
});

document.querySelectorAll(".algo-btn").forEach((button) => {
  button.addEventListener("click", () => {
    selectAlgorithm(button.dataset.algo);
  });
});

// -----------------------------
// Start application
// -----------------------------

function startApplication() {
  $("code").textContent = algorithms[algorithm].code;

  $("searchBtn").disabled = true;
  $("target").disabled = true;
  $("setTarget").disabled = true;

  initialize();
}

startApplication();

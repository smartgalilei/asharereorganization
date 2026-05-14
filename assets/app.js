
const searchInput = document.getElementById("companySearch");
const statusFilter = document.getElementById("statusFilter");
const sortBy = document.getElementById("sortBy");
const hasCompletionOnly = document.getElementById("hasCompletionOnly");
const tableMeta = document.getElementById("tableMeta");
const table = document.getElementById("companyTable");

function parseNumber(value, fallback = Number.NEGATIVE_INFINITY) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function sortRows(rows) {
  const mode = sortBy?.value || "status";
  const collator = new Intl.Collator("zh-CN", { numeric: true, sensitivity: "base" });

  rows.sort((a, b) => {
    switch (mode) {
      case "latestDesc":
        return parseNumber(b.dataset.latestClose) - parseNumber(a.dataset.latestClose);
      case "latestAsc":
        return parseNumber(a.dataset.latestClose, Number.POSITIVE_INFINITY) - parseNumber(b.dataset.latestClose, Number.POSITIVE_INFINITY);
      case "firstDesc":
        return parseNumber(b.dataset.firstClose) - parseNumber(a.dataset.firstClose);
      case "completionDesc":
        return parseNumber(b.dataset.completionChange) - parseNumber(a.dataset.completionChange);
      case "completionAsc":
        return parseNumber(a.dataset.completionChange, Number.POSITIVE_INFINITY) - parseNumber(b.dataset.completionChange, Number.POSITIVE_INFINITY);
      case "codeAsc":
        return collator.compare(a.dataset.code || "", b.dataset.code || "");
      case "nameAsc":
        return collator.compare(a.dataset.company || "", b.dataset.company || "");
      case "status":
      default: {
        const statusDelta = parseNumber(a.dataset.statusRank, 99) - parseNumber(b.dataset.statusRank, 99);
        if (statusDelta !== 0) return statusDelta;
        return collator.compare(a.dataset.code || "", b.dataset.code || "");
      }
    }
  });
}

function applyFilters() {
  if (!table) return;
  const query = (searchInput?.value || "").trim().toLowerCase();
  const status = statusFilter?.value || "全部";
  const completionOnly = Boolean(hasCompletionOnly?.checked);
  const rows = Array.from(table.tBodies[0].rows);
  sortRows(rows);
  rows.forEach((row) => table.tBodies[0].appendChild(row));

  let visible = 0;
  for (const row of rows) {
    const text = row.cells[0].innerText.toLowerCase();
    const rowStatus = row.dataset.status || row.cells[1].innerText.trim();
    const hasCompletion = rowStatus === "重整完成";
    const matchQuery = !query || text.includes(query);
    const matchStatus = status === "全部" || rowStatus.includes(status);
    const matchCompletionOnly = !completionOnly || hasCompletion;
    const matched = matchQuery && matchStatus && matchCompletionOnly;
    row.style.display = matched ? "" : "none";
    if (matched) visible += 1;
  }

  if (tableMeta) {
    tableMeta.textContent = "当前显示 " + visible + " / " + rows.length + " 家公司";
  }
}

searchInput?.addEventListener("input", applyFilters);
statusFilter?.addEventListener("change", applyFilters);
sortBy?.addEventListener("change", applyFilters);
hasCompletionOnly?.addEventListener("change", applyFilters);
applyFilters();

const tooltip = document.getElementById("chartTooltip");
const points = document.querySelectorAll(".chart-point");

function moveTooltip(event) {
  if (!tooltip || !tooltip.classList.contains("is-visible")) return;
  tooltip.style.left = event.clientX + 14 + "px";
  tooltip.style.top = event.clientY + 14 + "px";
}

for (const point of points) {
  point.addEventListener("mouseenter", (event) => {
    if (!tooltip) return;
    tooltip.textContent = point.dataset.tooltip || "";
    tooltip.classList.add("is-visible");
    moveTooltip(event);
  });
  point.addEventListener("mousemove", moveTooltip);
  point.addEventListener("mouseleave", () => {
    tooltip?.classList.remove("is-visible");
  });
}

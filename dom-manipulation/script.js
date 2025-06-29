// Load quotes from localStorage or fallback to default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Injustice anywhere is a threat to justice everywhere.", category: "Justice" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate category dropdown
function populateCategories() {
  const categorySet = new Set(quotes.map(q => q.category));
  const select = document.getElementById("categoryFilter");

  const saved = localStorage.getItem("selectedCategory") || "all";
  select.innerHTML = `<option value="all">All Categories</option>`;

  categorySet.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  select.value = saved;
}

// Filter quotes by selected category
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  const filtered = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes found in this category.</em>";
    return;
  }

  filtered.forEach(q => {
    const p = document.createElement("p");
    p.innerHTML = `"${q.text}" - ${q.category}`;
    quoteDisplay.appendChild(p);
  });
}

// Show one random quote
function showRandomQuote() {
  const selected = document.getElementById("categoryFilter").value;
  const available = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (available.length === 0) {
    alert("No quotes in this category.");
    return;
  }

  const quote = available[Math.floor(Math.random() * available.length)];
  document.getElementById("quoteDisplay").innerHTML = `"${quote.text}" - ${quote.category}`;
  sessionStorage.setItem("lastQuote", quote.text);
}

// Add new quote and sync to server
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  // Sync to server with POST
  sendQuoteToServer(newQuote);

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added!");
}

// Send new quote to mock server
function sendQuoteToServer(quote) {
  fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(quote)
  })
    .then(response => response.json())
    .then(data => {
      console.log("Synced with server:", data);
    })
    .catch(error => {
      console.error("Sync failed:", error);
    });
}

// Export quotes to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported!");
    } catch (err) {
      alert("Import failed. Invalid JSON format.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Simulate sync with server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const data = await response.json();

    const serverQuotes = data.map(item => ({
      text: item.title,
      category: "Server"
    }));

    let updated = false;
    serverQuotes.forEach(sq => {
      const exists = quotes.some(lq => lq.text === sq.text && lq.category === sq.category);
      if (!exists) {
        quotes.push(sq);
        updated = true;
      }
    });

    if (updated) {
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("New quotes synced from server.");
    }
  } catch (err) {
    console.error("Server fetch failed:", err);
  }
}

// Build the form and filter controls dynamically
function createAddQuoteForm() {
  const form = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.id = "addQuoteBtn";
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  const exportBtn = document.createElement("button");
  exportBtn.id = "exportBtn";
  exportBtn.textContent = "Export Quotes";
  exportBtn.addEventListener("click", exportToJsonFile);

  const importInput = document.createElement("input");
  importInput.id = "importFile";
  importInput.type = "file";
  importInput.accept = ".json";
  importInput.addEventListener("change", importFromJsonFile);

  const syncBtn = document.createElement("button");
  syncBtn.id = "syncBtn";
  syncBtn.textContent = "Sync Quotes";
  syncBtn.addEventListener("click", fetchQuotesFromServer);

  const categoryFilter = document.createElement("select");
  categoryFilter.id = "categoryFilter";
  categoryFilter.addEventListener("change", filterQuotes);

  form.appendChild(quoteInput);
  form.appendChild(categoryInput);
  form.appendChild(addBtn);
  form.appendChild(document.createElement("br"));
  form.appendChild(exportBtn);
  form.appendChild(importInput);
  form.appendChild(document.createElement("br"));
  form.appendChild(categoryFilter);
  form.appendChild(syncBtn);

  document.body.appendChild(form);
}

// Initialize app
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
createAddQuoteForm();
populateCategories();
filterQuotes();
fetchQuotesFromServer();
setInterval(fetchQuotesFromServer, 60000);

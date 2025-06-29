// Load from localStorage on page load
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Injustice anywhere is a threat to justice everywhere.", category: "Justice" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show all quotes or filter based on category
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes found in this category.</em>";
    return;
  }

  filteredQuotes.forEach(quote => {
    const para = document.createElement("p");
    para.innerHTML = `"${quote.text}" - ${quote.category}`;
    quoteDisplay.appendChild(para);
  });
}

// Show a random quote (from all or filtered)
function showRandomQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const availableQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (availableQuotes.length === 0) {
    alert("No quotes in this category.");
    return;
  }

  const randomIndex = Math.floor(Math.random() * availableQuotes.length);
  const quote = availableQuotes[randomIndex];

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `"${quote.text}" - ${quote.category}`;

  sessionStorage.setItem("lastQuote", quote.text);
}

// Add new quote and send to server
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = { text: newText, category: newCategory };
  quotes.push(newQuote);
  saveQuotes();

  populateCategories();
  filterQuotes();
  textInput.value = "";
  categoryInput.value = "";
  alert("New quote added!");

  sendQuoteToServer(newQuote);
}

// Send quote to server (POST)
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
      console.log("Quote sent to server:", data);
    })
    .catch(error => {
      console.error("Failed to send quote to server:", error);
    });
}

// Populate dropdown with unique categories
function populateCategories() {
  const categorySet = new Set(quotes.map(q => q.category));
  const select = document.getElementById("categoryFilter");

  const selectedBefore = localStorage.getItem("selectedCategory") || "all";
  select.innerHTML = `<option value="all">All Categories</option>`;

  categorySet.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  select.value = selectedBefore;
}

// JSON Export
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

// JSON Import
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");

      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported successfully!");
    } catch (error) {
      alert("Failed to import quotes. Please check the file format.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Sync with server (GET)
async function syncQuotes() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    const serverData = await response.json();

    const serverQuotes = serverData.map(item => ({
      text: item.title,
      category: "Server"
    }));

    handleServerQuotes(serverQuotes);
  } catch (error) {
    console.error("Error fetching from server:", error);
  }
}

// Handle conflict resolution
function handleServerQuotes(serverQuotes) {
  let updated = false;

  serverQuotes.forEach(serverQuote => {
    const exists = quotes.some(localQuote =>
      localQuote.text === serverQuote.text &&
      localQuote.category === serverQuote.category
    );

    if (!exists) {
      quotes.push(serverQuote);
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    filterQuotes();
    alert("New quotes were synced from the server.");
  }
}

// Create form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.id = "addQuoteBtn";
  addButton.textContent = "Add Quote";

  const exportButton = document.createElement("button");
  exportButton.id = "exportBtn";
  exportButton.textContent = "Export Quotes";

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.id = "importFile";
  importInput.accept = ".json";

  const syncButton = document.createElement("button");
  syncButton.id = "syncBtn";
  syncButton.textContent = "Sync Quotes";

  const filterDropdown = document.createElement("select");
  filterDropdown.id = "categoryFilter";

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
  formContainer.appendChild(document.createElement("br"));
  formContainer.appendChild(exportButton);
  formContainer.appendChild(importInput);
  formContainer.appendChild(document.createElement("br"));
  formContainer.appendChild(syncButton);
  formContainer.appendChild(filterDropdown);
  document.body.appendChild(formContainer);
}

// Attach event listeners after DOM elements exist
document.addEventListener("DOMContentLoaded", () => {
  createAddQuoteForm();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
  document.getElementById("syncBtn").addEventListener("click", syncQuotes);
  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);

  populateCategories();
  filterQuotes();
  syncQuotes();
  setInterval(syncQuotes, 60000);
});

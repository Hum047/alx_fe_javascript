// Step 1: Quote storage
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Injustice anywhere is a threat to justice everywhere.", category: "Justice" }
];

// Step 2: Show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `"${quote.text}" - ${quote.category}`;
}

// Attach event listener to "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Step 3: Add new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });

  textInput.value = "";
  categoryInput.value = "";

  alert("New quote added!");
}

// Attach event listener to "Add Quote" button
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);

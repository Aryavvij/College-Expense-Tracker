// ====== Data variables ======
let totalBudget = 0;
let categories = [];
let expenses = [];

// ====== Firebase configuration ======
// Replace these with your actual Firebase project values
const firebaseConfig = {
  apiKey: "AIzaSyADZ-3Wd0Y6CrT7pLyVse5SSVPGOXp85yo",
  authDomain: "expense-tracker-95702.firebaseapp.com",
  projectId: "expense-tracker-95702"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Using a demo user for now; later you can use real auth UID
const userDoc = db.collection("users").doc("demoUser");

// ====== Load data from Firestore ======
function loadData() {
  userDoc.get()
    .then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        totalBudget = data.totalBudget || 0;
        categories = data.categories || [];
        expenses = data.expenses || [];

        recalcCategorySpent();
        document.getElementById("totalBudget").value = totalBudget || '';
        updateOverview();
        updateCategorySelect();
        renderCategoryBreakdown();
        renderExpenseTable();
      }
    })
    .catch((err) => console.error("Error loading data:", err));
}

// ====== Save data to Firestore ======
function saveData() {
  userDoc.set({
    totalBudget,
    categories,
    expenses
  })
  .then(() => console.log("Data saved to Firebase"))
  .catch((err) => console.error("Error saving data:", err));
}

// ====== Recalculate category spent ======
function recalcCategorySpent() {
  categories.forEach(c => c.spent = 0);
  expenses.forEach(e => {
    const cat = categories.find(c => c.name === e.category);
    if (cat) cat.spent += e.amount;
  });
}

// ====== Budget ======
function setBudget() {
  const input = document.getElementById("totalBudget").value;
  totalBudget = parseFloat(input) || 0;
  updateOverview();
  saveData();
}

// ====== Category form ======
document.getElementById("categoryForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("categoryName").value.trim();
  const limit = parseFloat(document.getElementById("categoryLimit").value);

  if (name && limit > 0) {
    categories.push({ name, limit, spent: 0 });
    recalcCategorySpent();
    updateCategorySelect();
    renderCategoryBreakdown();
    saveData();
  }
  this.reset();
});

// ====== Expense form ======
document.getElementById("expenseForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const date = document.getElementById("date").value;
  const category = document.getElementById("categorySelect").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const note = document.getElementById("note").value;

  if (category && amount > 0) {
    expenses.push({ date, category, amount, note });
    recalcCategorySpent();
    updateOverview();
    renderCategoryBreakdown();
    renderExpenseTable();
    saveData();
  }
  this.reset();
});

// ====== Overview ======
function updateOverview() {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  document.getElementById("totalBudgetDisplay").innerText = totalBudget.toFixed(2);
  document.getElementById("totalSpentDisplay").innerText = totalSpent.toFixed(2);
  document.getElementById("remainingBudgetDisplay").innerText = (totalBudget - totalSpent).toFixed(2);
}

// ====== Category dropdown ======
function updateCategorySelect() {
  const select = document.getElementById("categorySelect");
  select.innerHTML = "";
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.name;
    option.textContent = cat.name;
    select.appendChild(option);
  });
}

// ====== Category breakdown ======
function renderCategoryBreakdown() {
  const container = document.getElementById("categoryBreakdownList");
  container.innerHTML = "";

  categories.forEach((cat) => {
    const left = cat.limit - cat.spent;
    const div = document.createElement("div");
    div.className = "category-box";
    div.innerHTML = `
      <strong>${cat.name}</strong><br>
      Spent: ₹${cat.spent.toFixed(2)} / ₹${cat.limit.toFixed(2)}<br>
      Remaining: ₹${left.toFixed(2)}
    `;
    container.appendChild(div);
  });
}

// ====== Expense table ======
function renderExpenseTable() {
  const tbody = document.getElementById("expenseTableBody");
  tbody.innerHTML = "";

  expenses.forEach((exp, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${exp.date}</td>
      <td>${exp.category}</td>
      <td>₹${exp.amount.toFixed(2)}</td>
      <td>${exp.note || "-"}</td>
      <td><button onclick="deleteExpense(${index})">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

// ====== Delete expense ======
function deleteExpense(index) {
  expenses.splice(index, 1);
  recalcCategorySpent();
  updateOverview();
  renderCategoryBreakdown();
  renderExpenseTable();
  saveData();
}

// ====== Initialize page ======
window.addEventListener('load', loadData);

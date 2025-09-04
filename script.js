let totalBudget = 0;
let categories = [];
let expenses = [];

function setBudget() {
  const input = document.getElementById("totalBudget").value;
  totalBudget = parseFloat(input) || 0;
  updateOverview();
}

document.getElementById("categoryForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("categoryName").value.trim();
  const limit = parseFloat(document.getElementById("categoryLimit").value);

  if (name && limit > 0) {
    categories.push({ name, limit, spent: 0 });
    updateCategorySelect();
    renderCategoryBreakdown();
  }

  this.reset();
});

document.getElementById("expenseForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const date = document.getElementById("date").value;
  const category = document.getElementById("categorySelect").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const note = document.getElementById("note").value;

  if (category && amount > 0) {
    expenses.push({ date, category, amount, note });

    const cat = categories.find((c) => c.name === category);
    if (cat) cat.spent += amount;

    updateOverview();
    renderCategoryBreakdown();
    renderExpenseTable();
  }

  this.reset();
});

function updateOverview() {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  document.getElementById("totalBudgetDisplay").innerText = totalBudget.toFixed(2);
  document.getElementById("totalSpentDisplay").innerText = totalSpent.toFixed(2);
  document.getElementById("remainingBudgetDisplay").innerText = (totalBudget - totalSpent).toFixed(2);
}

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

function deleteExpense(index) {
  const expense = expenses[index];
  const cat = categories.find((c) => c.name === expense.category);
  if (cat) cat.spent -= expense.amount;

  expenses.splice(index, 1);
  updateOverview();
  renderCategoryBreakdown();
  renderExpenseTable();
}

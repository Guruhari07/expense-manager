const transactionForm = document.getElementById('transactionForm');
const transactionsTable = document.getElementById('transactionsTable');
const tableBody = document.getElementById('tableBody');
const totalBalanceEl = document.getElementById('totalBalance');
const emptyState = document.getElementById('emptyState');
const tableWrapper = document.querySelector('.table-wrapper');

let transactions = [];

// Format currency (INR as default representation but simple to read)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
};

// Format date
const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
};

// Start date as today by default
document.getElementById('date').valueAsDate = new Date();

// Render app state
const render = () => {
    tableBody.innerHTML = '';
    
    if (transactions.length === 0) {
        emptyState.style.display = 'flex';
        tableWrapper.style.display = 'none';
        totalBalanceEl.textContent = formatCurrency(0);
        return;
    }
    
    emptyState.style.display = 'none';
    tableWrapper.style.display = 'block';

    let currentBalance = 0;
    
    // Sort transactions by date (oldest first) so running balance is logical
    // We will display them newest first, so we calculate forwards and then reverse for display
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const displayList = sortedTransactions.map(tx => {
        if (tx.type === 'income') {
            currentBalance += tx.amount;
        } else {
            currentBalance -= tx.amount;
        }
        return { ...tx, balanceAfter: currentBalance };
    });

    totalBalanceEl.textContent = formatCurrency(currentBalance);
    
    // Reverse for displaying latest first
    displayList.reverse().forEach(tx => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="date-col">${formatDate(tx.date)}</td>
            <td class="desc-col">${tx.description}</td>
            <td><span class="badge ${tx.type}">${tx.type}</span></td>
            <td class="amount-col ${tx.type}">${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}</td>
            <td class="balance-col">${formatCurrency(tx.balanceAfter)}</td>
            <td>
                <button class="delete-btn" onclick="deleteTransaction('${tx.id}')" title="Delete">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
};

// Delete transaction
window.deleteTransaction = (id) => {
    transactions = transactions.filter(tx => tx.id !== id);
    saveData();
    render();
};

// Form submission handler
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    if (!date || !description || isNaN(amount) || amount <= 0) {
        alert("Please provide valid details.");
        return;
    }

    const newTransaction = {
        id: crypto.randomUUID(),
        date,
        description,
        amount,
        type
    };

    transactions.push(newTransaction);
    saveData();
    
    // Reset form
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('description').focus();
    
    render();
});

// Persistence via localStorage
const saveData = () => {
    localStorage.setItem('calculator_transactions', JSON.stringify(transactions));
};

const loadData = () => {
    const saved = localStorage.getItem('calculator_transactions');
    if (saved) {
        try {
            transactions = JSON.parse(saved);
        } catch(e) {
            transactions = [];
        }
    }
};

// Initial load
loadData();
render();

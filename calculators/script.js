document.addEventListener('DOMContentLoaded', () => {

    // --- Helper Function to Format Currency ---
    const formatCurrency = (value) => {
        const num = Math.round(value);
        return `${num.toLocaleString('ar-JO')} دينار`;
    };

    // --- Tab Switching Logic ---
    const tabs = document.querySelectorAll('.tab');
    const calculatorViews = document.querySelectorAll('.calculator-view');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show the correct calculator view
            const targetId = `${tab.dataset.tab}-calc`;
            calculatorViews.forEach(view => {
                view.style.display = view.id === targetId ? 'block' : 'none';
            });
        });
    });

    // --- Calculators Logic ---

    // 1. Personal Loan Calculator
    function calculateLoan() {
        const principal = parseFloat(document.getElementById('loan-principal').value) || 0;
        const months = parseInt(document.getElementById('loan-months').value) || 0;
        const annualRate = (parseFloat(document.getElementById('loan-apr').value) || 0) / 100;
        
        if (months === 0 || annualRate === 0) {
            document.getElementById('loan-monthly-payment').textContent = formatCurrency(0);
            document.getElementById('loan-total-interest').textContent = formatCurrency(0);
            document.getElementById('loan-total-paid').textContent = formatCurrency(principal);
            return;
        }

        const monthlyRate = annualRate / 12;
        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        const totalPaid = monthlyPayment * months;
        const totalInterest = totalPaid - principal;

        document.getElementById('loan-monthly-payment').textContent = formatCurrency(monthlyPayment);
        document.getElementById('loan-total-interest').textContent = formatCurrency(totalInterest);
        document.getElementById('loan-total-paid').textContent = formatCurrency(totalPaid);
    }
    
    // 2. Savings Calculator
    function calculateSavings() {
        const initial = parseFloat(document.getElementById('sv-initial').value) || 0;
        const monthly = parseFloat(document.getElementById('sv-monthly').value) || 0;
        const annualRate = (parseFloat(document.getElementById('sv-rate').value) || 0) / 100;
        const years = parseInt(document.getElementById('sv-years').value) || 0;
        
        const monthlyRate = annualRate / 12;
        const months = years * 12;
        
        let futureValue = initial * Math.pow(1 + monthlyRate, months);
        if (monthlyRate > 0) {
            futureValue += monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
        } else {
            futureValue += monthly * months;
        }
        
        const totalDeposits = initial + (monthly * months);
        const totalInterest = futureValue - totalDeposits;

        document.getElementById('sv-future-balance').textContent = formatCurrency(futureValue);
        document.getElementById('sv-total-deposits').textContent = formatCurrency(totalDeposits);
        document.getElementById('sv-total-interest').textContent = formatCurrency(totalInterest);
    }
    
    // 3. Term Deposits Calculator
    function calculateDeposits() {
        const principal = parseFloat(document.getElementById('dp-amount').value) || 0;
        const annualRate = (parseFloat(document.getElementById('dp-rate').value) || 0) / 100;
        const years = parseInt(document.getElementById('dp-years').value) || 0;
        const compounding = parseInt(document.getElementById('dp-compounding').value) || 1;

        const maturityAmount = principal * Math.pow(1 + (annualRate / compounding), compounding * years);
        const totalInterest = maturityAmount - principal;

        document.getElementById('dp-maturity-amount').textContent = formatCurrency(maturityAmount);
        document.getElementById('dp-principal').textContent = formatCurrency(principal);
        document.getElementById('dp-total-interest').textContent = formatCurrency(totalInterest);
    }

    // 4. Murabaha Calculator
    function calculateMurabaha() {
        const cost = parseFloat(document.getElementById('murabaha-cost').value) || 0;
        const downPayment = parseFloat(document.getElementById('murabaha-down').value) || 0;
        const annualProfitRate = (parseFloat(document.getElementById('murabaha-profit-rate').value) || 0) / 100;
        const months = parseInt(document.getElementById('murabaha-months').value) || 0;
        
        const financedAmount = cost - downPayment;
        const totalProfit = financedAmount * annualProfitRate * (months / 12);
        const totalAmount = financedAmount + totalProfit;
        const monthlyPayment = months > 0 ? totalAmount / months : 0;

        document.getElementById('murabaha-financed').textContent = formatCurrency(financedAmount);
        document.getElementById('murabaha-total-profit').textContent = formatCurrency(totalProfit);
        document.getElementById('murabaha-monthly').textContent = formatCurrency(monthlyPayment);
    }
    
    // 5. Card Payoff Calculator
    function calculateCardPayoff() {
        const balance = parseFloat(document.getElementById('card-balance').value) || 0;
        const annualRate = (parseFloat(document.getElementById('card-apr').value) || 0) / 100;
        const monthlyPayment = parseFloat(document.getElementById('card-fixed').value) || 0;

        if (balance <= 0 || monthlyPayment <= 0) {
            document.getElementById('card-months').textContent = '0 أشهر';
            document.getElementById('card-total-interest').textContent = formatCurrency(0);
            return;
        }
        
        const monthlyRate = annualRate / 12;
        
        if (monthlyPayment <= balance * monthlyRate) {
             document.getElementById('card-months').textContent = 'لا يمكن السداد بهذا المبلغ';
             document.getElementById('card-total-interest').textContent = '---';
             return;
        }

        const months = -(Math.log(1 - (balance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate));
        const totalPaid = months * monthlyPayment;
        const totalInterest = totalPaid - balance;

        document.getElementById('card-months').textContent = `${Math.ceil(months)} أشهر`;
        document.getElementById('card-total-interest').textContent = formatCurrency(totalInterest);
    }
    
    // 6. Mortgage Calculator
    function calculateMortgage() {
        const price = parseFloat(document.getElementById('mortgage-price').value) || 0;
        const downPayment = parseFloat(document.getElementById('mortgage-down').value) || 0;
        const years = parseInt(document.getElementById('mortgage-years').value) || 0;
        const annualRate = (parseFloat(document.getElementById('mortgage-apr').value) || 0) / 100;

        const principal = price - downPayment;
        const months = years * 12;
        const monthlyRate = annualRate / 12;
        
        if (months === 0 || monthlyRate === 0) {
             document.getElementById('mortgage-principal').textContent = formatCurrency(principal);
             document.getElementById('mortgage-monthly-payment').textContent = formatCurrency(0);
             document.getElementById('mortgage-total-interest').textContent = formatCurrency(0);
             return;
        }
        
        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        const totalInterest = (monthlyPayment * months) - principal;

        document.getElementById('mortgage-principal').textContent = formatCurrency(principal);
        document.getElementById('mortgage-monthly-payment').textContent = formatCurrency(monthlyPayment);
        document.getElementById('mortgage-total-interest').textContent = formatCurrency(totalInterest);
    }
    
    // 7. Car Loan Calculator
    function calculateCarLoan() {
        const price = parseFloat(document.getElementById('car-price').value) || 0;
        const downPayment = parseFloat(document.getElementById('car-down').value) || 0;
        const years = parseInt(document.getElementById('car-years').value) || 0;
        const annualRate = (parseFloat(document.getElementById('car-apr').value) || 0) / 100;
        
        const principal = price - downPayment;
        const months = years * 12;
        const monthlyRate = annualRate / 12;

        if (months === 0 || monthlyRate === 0) {
             document.getElementById('car-principal').textContent = formatCurrency(principal);
             document.getElementById('car-monthly-payment').textContent = formatCurrency(0);
             document.getElementById('car-total-interest').textContent = formatCurrency(0);
             return;
        }
        
        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        const totalInterest = (monthlyPayment * months) - principal;

        document.getElementById('car-principal').textContent = formatCurrency(principal);
        document.getElementById('car-monthly-payment').textContent = formatCurrency(monthlyPayment);
        document.getElementById('car-total-interest').textContent = formatCurrency(totalInterest);
    }
    
    // 8. Retirement Calculator
    function calculateRetirement() {
        const currentAge = parseInt(document.getElementById('ret-current-age').value) || 0;
        const retirementAge = parseInt(document.getElementById('ret-age').value) || 0;
        const currentSavings = parseFloat(document.getElementById('ret-current-savings').value) || 0;
        const monthlyContrib = parseFloat(document.getElementById('ret-monthly-contrib').value) || 0;
        const annualRate = (parseFloat(document.getElementById('ret-rate').value) || 0) / 100;

        const years = retirementAge - currentAge;
        const months = years * 12;
        const monthlyRate = annualRate / 12;

        let futureValue = currentSavings * Math.pow(1 + monthlyRate, months);
        if (monthlyRate > 0) {
            futureValue += monthlyContrib * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
        } else {
            futureValue += monthlyContrib * months;
        }

        const totalContributions = currentSavings + (monthlyContrib * months);
        const totalInterest = futureValue - totalContributions;

        document.getElementById('ret-total-savings').textContent = formatCurrency(futureValue);
        document.getElementById('ret-total-contrib').textContent = formatCurrency(totalContributions);
        document.getElementById('ret-total-interest').textContent = formatCurrency(totalInterest);
    }

    // --- Setup Listeners and Initial Calculations ---
    function initializeCalculators() {
        const calculators = {
            'loan-calc': { func: calculateLoan, inputs: ['loan-principal', 'loan-months', 'loan-apr'] },
            'savings-calc': { func: calculateSavings, inputs: ['sv-initial', 'sv-monthly', 'sv-rate', 'sv-years'] },
            'deposits-calc': { func: calculateDeposits, inputs: ['dp-amount', 'dp-rate', 'dp-years', 'dp-compounding'] },
            'murabaha-calc': { func: calculateMurabaha, inputs: ['murabaha-cost', 'murabaha-down', 'murabaha-profit-rate', 'murabaha-months'] },
            'card-payoff-calc': { func: calculateCardPayoff, inputs: ['card-balance', 'card-apr', 'card-fixed'] },
            'mortgage-calc': { func: calculateMortgage, inputs: ['mortgage-price', 'mortgage-down', 'mortgage-years', 'mortgage-apr'] },
            'car-loan-calc': { func: calculateCarLoan, inputs: ['car-price', 'car-down', 'car-years', 'car-apr'] },
            'retirement-calc': { func: calculateRetirement, inputs: ['ret-current-age', 'ret-age', 'ret-current-savings', 'ret-monthly-contrib', 'ret-rate'] }
        };

        for (const calcId in calculators) {
            const { func, inputs } = calculators[calcId];
            inputs.forEach(inputId => {
                const element = document.getElementById(inputId);
                if (element) {
                    element.addEventListener('input', func);
                }
            });
            func(); // Initial calculation
        }
    }

    initializeCalculators();
});
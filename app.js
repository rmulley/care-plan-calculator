const { createApp } = Vue;

createApp({
    data() {
        return {
            rowCount: 10,
            colCount: 10,
            cells: {},
            headers: {},
            selectedCell: null,
            allColumns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
        };
    },
    watch: {
        rowCount(newValue) {
            // Enforce maximum row limit
            if (newValue > 100) {
                this.rowCount = 100;
            }
            // Enforce minimum row limit
            if (newValue < 1) {
                this.rowCount = 1;
            }
        },
        colCount(newValue) {
            // Enforce maximum column limit
            if (newValue > 26) {
                this.colCount = 26;
            }
            // Enforce minimum column limit
            if (newValue < 1) {
                this.colCount = 1;
            }
        }
    },
    computed: {
        rows() {
            return Array.from({ length: this.rowCount }, (_, i) => i + 1);
        },
        columns() {
            return this.allColumns.slice(0, this.colCount);
        },
        formulaCellCount() {
            return Object.values(this.cells).filter(cell => cell.formula && cell.formula.startsWith('=')).length;
        }
    },
    methods: {
        // Cell management
        getCellKey(row, col) {
            return `${row}-${col}`;
        },
        
        getCell(row, col) {
            const key = this.getCellKey(row, col);
            if (!this.cells[key]) {
                this.cells[key] = { value: '', formula: '', displayValue: '' };
            }
            return this.cells[key];
        },
        
        updateCell(row, col, value) {
            const cell = this.getCell(row, col);
            cell.formula = value;
            this.evaluateCell(row, col);
        },
        
        updateCellValue() {
            if (this.selectedCell) {
                this.evaluateCell(this.selectedCell.row, this.selectedCell.col);
            }
        },
        
        selectCell(row, col) {
            this.selectedCell = { row, col };
        },
        
        getCellDisplayValue(row, col) {
            const cell = this.getCell(row, col);
            return cell.displayValue;
        },
        
        getCellClass(row, col) {
            const cell = this.getCell(row, col);
            if (cell.error) {
                return 'error-cell';
            }
            // No special styling for formula cells since we're not evaluating them
            return '';
        },
        
        // Formula evaluation - disabled, just display formulas as-is
        evaluateCell(row, col) {
            const cell = this.getCell(row, col);
            const formula = cell.formula;
            
            if (!formula) {
                cell.displayValue = '';
                cell.error = false;
                return;
            }
            
            // Always display the formula as-is, no evaluation
            cell.displayValue = formula;
            cell.error = false;
        },
        
        evaluateFormula(formula, currentRow, currentCol) {
            // Remove spaces and convert to uppercase
            formula = formula.replace(/\s/g, '').toUpperCase();
            
            // Handle incomplete formulas - just show the formula as-is
            if (!formula || formula.trim() === '') {
                return '='; // Return just the equals sign for incomplete formulas
            }
            
            // Handle basic arithmetic operations
            const operators = ['+', '-', '*', '/', '(', ')'];
            let tokens = [];
            let current = '';
            
            for (let i = 0; i < formula.length; i++) {
                const char = formula[i];
                if (operators.includes(char)) {
                    if (current) {
                        tokens.push(current);
                        current = '';
                    }
                    tokens.push(char);
                } else {
                    current += char;
                }
            }
            if (current) {
                tokens.push(current);
            }
            
            // Check if we have valid tokens to evaluate
            if (tokens.length === 0 || (tokens.length === 1 && tokens[0] === '')) {
                return '='; // Return just the equals sign for incomplete formulas
            }
            
            // Evaluate tokens
            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                if (this.isCellReference(token)) {
                    const value = this.getCellValue(token);
                    tokens[i] = value;
                }
            }
            
            // Join tokens and evaluate
            const expression = tokens.join('');
            return this.evaluateExpression(expression);
        },
        
        isCellReference(token) {
            // Check if token matches pattern like A1, B2, etc.
            const cellPattern = /^[A-Z][0-9]+$/;
            return cellPattern.test(token);
        },
        
        getCellValue(cellRef) {
            const col = cellRef.match(/[A-Z]+/)[0];
            const row = parseInt(cellRef.match(/[0-9]+/)[0]);
            
            // Check if cell exists
            if (row > this.rowCount || !this.allColumns.includes(col) || this.allColumns.indexOf(col) >= this.colCount) {
                return 0;
            }
            
            const cell = this.getCell(row, col);
            if (cell.error || cell.displayValue === '') {
                return 0;
            }
            
            const value = parseFloat(cell.displayValue);
            return isNaN(value) ? 0 : value;
        },
        
        evaluateExpression(expression) {
            // Simple expression evaluator for basic arithmetic
            try {
                // Replace mathematical functions
                expression = expression.replace(/SUM\(([^)]+)\)/g, (match, args) => {
                    const cells = args.split(',').map(cell => cell.trim());
                    return cells.reduce((sum, cell) => sum + this.getCellValue(cell), 0);
                });
                
                expression = expression.replace(/AVERAGE\(([^)]+)\)/g, (match, args) => {
                    const cells = args.split(',').map(cell => cell.trim());
                    const values = cells.map(cell => this.getCellValue(cell));
                    return values.reduce((sum, val) => sum + val, 0) / values.length;
                });
                
                // Evaluate the expression
                return eval(expression);
            } catch (error) {
                throw new Error('Invalid formula');
            }
        },
        
        // Spreadsheet management
        addRow() {
            if (this.rowCount < 100) {
                this.rowCount++;
            } else {
                console.log('Maximum row limit (100) reached');
            }
        },
        
        deleteRow() {
            if (this.rowCount > 1) {
                // Remove cells in the last row
                const lastRow = this.rowCount;
                this.columns.forEach(col => {
                    const key = this.getCellKey(lastRow, col);
                    delete this.cells[key];
                });
                this.rowCount--;
            }
        },
        
        addColumn() {
            if (this.colCount < 26) {
                this.colCount++;
            } else {
                console.log('Maximum column limit (26) reached');
            }
        },
        
        deleteColumn() {
            if (this.colCount > 1) {
                // Remove cells in the last column
                const lastCol = this.allColumns[this.colCount - 1];
                this.rows.forEach(row => {
                    const key = this.getCellKey(row, lastCol);
                    delete this.cells[key];
                });
                // Remove header for the deleted column
                delete this.headers[lastCol];
                this.colCount--;
            }
        },
        
        clearAll() {
            this.cells = {};
            this.headers = {};
            this.selectedCell = null;
        },
        
        // Header management
        getHeaderValue(col) {
            return this.headers[col] || '';
        },
        
        updateHeader(col, value) {
            this.headers[col] = value;
        },
        
        // Evaluate sheet data
        async evaluateSheet() {
            try {
                // Prepare the sheet data in the required format
                const sheetData = [];
                
                // Add header row with all headers (including empty ones)
                const headerRow = {};
                this.columns.forEach((col, index) => {
                    const headerValue = this.getHeaderValue(col);
                    headerRow[index + 1] = headerValue || '';
                });
                sheetData.push(headerRow);
                
                // Add data rows
                for (let row = 1; row <= this.rowCount; row++) {
                    const rowData = {};
                    this.columns.forEach((col, index) => {
                        const cell = this.getCell(row, col);
                        // Include all cells, including empty ones
                        rowData[index + 1] = cell.formula || cell.displayValue || '';
                    });
                    sheetData.push(rowData);
                }
                
                console.log('Sending sheet data:', sheetData);
                
                // Make the HTTP POST request
                const response = await fetch('/evaluate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(sheetData)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                console.log('Evaluation result:', result);
                
                // Show success message (you can enhance this with a proper notification system)
                alert('Sheet evaluated successfully! Check console for details.');
                
            } catch (error) {
                console.error('Error evaluating sheet:', error);
                alert('Error evaluating sheet: ' + error.message);
            }
        },
        
        // Data export
        exportData() {
            const csvContent = this.generateCSV();
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'care_plan_calculator.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        
        generateCSV() {
            let csv = ',';
            // Header row with column letters
            for (let i = 0; i < this.colCount; i++) {
                csv += this.columns[i] + ',';
            }
            csv = csv.slice(0, -1) + '\n';
            
            // Custom header row with titles
            csv += ',';
            for (let i = 0; i < this.colCount; i++) {
                const col = this.columns[i];
                const headerValue = this.getHeaderValue(col) || '';
                // Escape quotes and wrap in quotes if contains comma
                const escapedValue = headerValue.toString().replace(/"/g, '""');
                csv += (headerValue.includes(',') ? `"${escapedValue}"` : escapedValue) + ',';
            }
            csv = csv.slice(0, -1) + '\n';
            
            // Data rows
            for (let row = 1; row <= this.rowCount; row++) {
                csv += row + ',';
                for (let i = 0; i < this.colCount; i++) {
                    const col = this.columns[i];
                    const cell = this.getCell(row, col);
                    const value = cell.displayValue || '';
                    // Escape quotes and wrap in quotes if contains comma
                    const escapedValue = value.toString().replace(/"/g, '""');
                    csv += (value.includes(',') ? `"${escapedValue}"` : escapedValue) + ',';
                }
                csv = csv.slice(0, -1) + '\n';
            }
            
            return csv;
        },
        
        // Keyboard navigation
        handleKeydown(event) {
            if (!this.selectedCell) return;
            
            const { row, col } = this.selectedCell;
            let newRow = row;
            let newCol = col;
            
            switch (event.key) {
                case 'ArrowUp':
                    if (row > 1) newRow = row - 1;
                    break;
                case 'ArrowDown':
                    if (row < this.rowCount) newRow = row + 1;
                    break;
                case 'ArrowLeft':
                    const colIndex = this.columns.indexOf(col);
                    if (colIndex > 0) newCol = this.columns[colIndex - 1];
                    break;
                case 'ArrowRight':
                    const colIndexRight = this.columns.indexOf(col);
                    if (colIndexRight < this.colCount - 1) newCol = this.columns[colIndexRight + 1];
                    break;
                default:
                    return;
            }
            
            if (newRow !== row || newCol !== col) {
                this.selectCell(newRow, newCol);
                // Focus the new cell input
                setTimeout(() => {
                    const newCellInput = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"] input`);
                    if (newCellInput) {
                        newCellInput.focus();
                    }
                }, 0);
            }
        }
    },
    
    mounted() {
        // Add keyboard event listener
        document.addEventListener('keydown', this.handleKeydown);
    },
    
    beforeUnmount() {
        // Remove keyboard event listener
        document.removeEventListener('keydown', this.handleKeydown);
    }
}).mount('#app'); 
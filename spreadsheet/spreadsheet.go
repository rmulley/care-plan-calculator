package spreadsheet

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

type Spreadsheet []map[int]string

func (s Spreadsheet) Evaluate() Spreadsheet {
	var newSheet Spreadsheet = make(Spreadsheet, len(s))

	for i, row := range s {
		newSheet[i] = make(map[int]string)
		for j, cell := range row {
			if len(cell) > 0 && cell[0] == '=' {
				val, err := evaluateCell(cell, s)
				if err != nil {
					newSheet[i][j] = "#ERROR"
				} else {
					floatVal := strconv.FormatFloat(val, 'f', -1, 64)
					newSheet[i][j] = floatVal
				}
			} else {
				newSheet[i][j] = cell
			}
		}
	}

	return newSheet
}

func evaluateCell(cell string, sheet Spreadsheet) (float64, error) {
	return evaluateCellWithVisited(cell, sheet, make(map[string]bool))
}

func evaluateCellWithVisited(cell string, sheet Spreadsheet, visited map[string]bool) (float64, error) {
	// A valid spreadsheet formula starts with '='
	cell = strings.TrimSpace(cell)
	if len(cell) == 0 {
		return 0, fmt.Errorf("cell is empty")
	}
	if cell[0] != '=' {
		return 0, fmt.Errorf("not a formula")
	}

	// Check for circular references
	if visited[cell] {
		return 0, fmt.Errorf("circular reference detected")
	}
	visited[cell] = true
	defer delete(visited, cell)

	formula := cell[1:] // Remove '='

	// Replace cell references (e.g., A1, B2) with their values from the sheet
	re := regexp.MustCompile(`([A-Z]+)([0-9]+)`)
	formulaWithValues := re.ReplaceAllStringFunc(formula, func(ref string) string {
		colLetters := re.ReplaceAllString(ref, "$1")
		rowStr := re.ReplaceAllString(ref, "$2")

		// Convert column letters to index (A=1, B=2, etc.)
		colIdx := 0
		for i := 0; i < len(colLetters); i++ {
			colIdx = colIdx*26 + int(colLetters[i]-'A'+1)
		}
		// Keep 1-based indexing to match the data structure

		// Convert row number to index
		rowIdx, err := strconv.Atoi(rowStr)
		if err != nil || rowIdx < 1 || colIdx < 0 {
			return "0"
		}


		// Check bounds
		if rowIdx >= len(sheet) {
			fmt.Printf("Row index out of bounds: %d >= %d\n", rowIdx, len(sheet))
			return "0"
		}

		row := sheet[rowIdx]
		if row == nil {
			fmt.Printf("Row %d is nil\n", rowIdx)
			return "0"
		}

		val, ok := row[colIdx]
		if !ok {
			fmt.Printf("Cell [%d][%d] not found in row: %+v\n", rowIdx, colIdx, row)
			return "0"
		}

		val = strings.TrimSpace(val)
		if len(val) == 0 {
			return "0"
		}

		// If the referenced cell is also a formula, evaluate it recursively
		if len(val) > 0 && val[0] == '=' {
			result, err := evaluateCellWithVisited(val, sheet, visited)
			if err != nil {
				return "0"
			}
			return fmt.Sprintf("%v", result)
		}

		// Try to parse as float
		f, err := strconv.ParseFloat(val, 64)
		if err != nil {
			return "0"
		}
		return fmt.Sprintf("%v", f)
	})

	// Debug output
	//fmt.Printf("Original formula: %s\n", formula)
	//fmt.Printf("Formula with values: %s\n", formulaWithValues)

	// Evaluate the resulting expression
	result, err := evalSimpleExpression(formulaWithValues)
	if err != nil {
		return 0, fmt.Errorf("invalid formula: %v", err)
	}
	return result, nil
}

// Helper: very basic arithmetic expression evaluator (supports +, -, *, /, parentheses)
func evalSimpleExpression(expr string) (float64, error) {
	// For safety, only allow numbers, operators, and parentheses
	allowed := regexp.MustCompile(`^[0-9\.\+\-\*/\(\)\s]+$`)
	if !allowed.MatchString(expr) {
		return 0, fmt.Errorf("expression contains invalid characters")
	}
	// Use Go's parser? Not available. Use a simple shunting yard algorithm.
	return evalArithmetic(expr)
}

// Simple arithmetic evaluator (supports +, -, *, /, parentheses)
func evalArithmetic(expr string) (float64, error) {
	// Remove spaces
	expr = strings.ReplaceAll(expr, " ", "")
	// Use a stack-based approach
	var nums []float64
	var ops []rune

	precedence := func(op rune) int {
		switch op {
		case '+', '-':
			return 1
		case '*', '/':
			return 2
		}
		return 0
	}

	apply := func() error {
		if len(nums) < 2 || len(ops) == 0 {
			return fmt.Errorf("invalid expression")
		}
		b := nums[len(nums)-1]
		a := nums[len(nums)-2]
		op := ops[len(ops)-1]
		nums = nums[:len(nums)-2]
		ops = ops[:len(ops)-1]
		var res float64
		switch op {
		case '+':
			res = a + b
		case '-':
			res = a - b
		case '*':
			res = a * b
		case '/':
			if b == 0 {
				return fmt.Errorf("division by zero")
			}
			res = a / b
		default:
			return fmt.Errorf("unknown operator: %c", op)
		}
		nums = append(nums, res)
		return nil
	}

	var i int
	for i < len(expr) {
		ch := expr[i]
		if ch >= '0' && ch <= '9' || ch == '.' {
			j := i
			for j < len(expr) && (expr[j] >= '0' && expr[j] <= '9' || expr[j] == '.') {
				j++
			}
			num, err := strconv.ParseFloat(expr[i:j], 64)
			if err != nil {
				return 0, err
			}
			nums = append(nums, num)
			i = j
		} else if ch == '(' {
			ops = append(ops, '(')
			i++
		} else if ch == ')' {
			for len(ops) > 0 && ops[len(ops)-1] != '(' {
				if err := apply(); err != nil {
					return 0, err
				}
			}
			if len(ops) == 0 {
				return 0, fmt.Errorf("mismatched parentheses")
			}
			ops = ops[:len(ops)-1] // pop '('
			i++
		} else if ch == '+' || ch == '-' || ch == '*' || ch == '/' {
			for len(ops) > 0 && precedence(ops[len(ops)-1]) >= precedence(rune(ch)) {
				if err := apply(); err != nil {
					return 0, err
				}
			}
			ops = append(ops, rune(ch))
			i++
		} else {
			return 0, fmt.Errorf("invalid character: %c", ch)
		}
	}
	for len(ops) > 0 {
		if err := apply(); err != nil {
			return 0, err
		}
	}
	if len(nums) != 1 {
		return 0, fmt.Errorf("invalid expression")
	}
	return nums[0], nil
}

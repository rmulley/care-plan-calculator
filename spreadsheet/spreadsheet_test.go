package spreadsheet

import (
	"reflect"
	"testing"
)

func TestSpreadsheetEvaluate_Addition(t *testing.T) {
	sheet := Spreadsheet{
		{1: "Session Hours", 2: "Rate per Hour", 3: "Total Cost"},
		{1: "10", 2: "2", 3: "=(A1+B1)"},
	}

	expected := Spreadsheet{
		{1: "Session Hours", 2: "Rate per Hour", 3: "Total Cost"},
		{1: "10", 2: "2", 3: "12"},
	}

	result := sheet.Evaluate()

	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Evaluate() = %+v, want %+v", result, expected)
	}
}

func TestSpreadsheetEvaluate_Subtraction(t *testing.T) {
	sheet := Spreadsheet{
		{1: "Session Hours", 2: "Rate per Hour", 3: "Total Cost"},
		{1: "10", 2: "2", 3: "=(A1-B1)"},
	}

	expected := Spreadsheet{
		{1: "Session Hours", 2: "Rate per Hour", 3: "Total Cost"},
		{1: "10", 2: "2", 3: "8"},
	}

	result := sheet.Evaluate()

	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Evaluate() = %+v, want %+v", result, expected)
	}
}

func TestSpreadsheetEvaluate_Multiply(t *testing.T) {
	sheet := Spreadsheet{
		{1: "Session Hours", 2: "Rate per Hour", 3: "Total Cost"},
		{1: "10", 2: "2", 3: "=(A1*B1)"},
	}

	expected := Spreadsheet{
		{1: "Session Hours", 2: "Rate per Hour", 3: "Total Cost"},
		{1: "10", 2: "2", 3: "20"},
	}

	result := sheet.Evaluate()

	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Evaluate() = %+v, want %+v", result, expected)
	}
}


func TestSpreadsheetEvaluate_Division(t *testing.T) {
	sheet := Spreadsheet{
		{1: "Session Hours", 2: "Rate per Hour", 3: "Total Cost"},
		{1: "10", 2: "2", 3: "=(A1/B1)"},
	}

	expected := Spreadsheet{
		{1: "Session Hours", 2: "Rate per Hour", 3: "Total Cost"},
		{1: "10", 2: "2", 3: "5"},
	}

	result := sheet.Evaluate()

	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Evaluate() = %+v, want %+v", result, expected)
	}
}

func TestSpreadsheetEvaluate_ComplexFormulas(t *testing.T) {
	// Construct the input spreadsheet
	// Columns: 1:Session, 2:Hours, 3:Rate per Hour, 4:Total Cost
	// Use 1-based column indices to match the implementation
	sheet := Spreadsheet{
		{1: "Session Hours", 2: "Rate per Hour", 3: "Total Cost"},
		{1: "10", 2: "100", 3: "=A1 * B1"},
		{1: "=C1 / 2", 2: "150", 3: "=A2 * B2"},
		{1: "=C3 / B3", 2: "=B1 / 2", 3: "1200"},
	}

	expected := Spreadsheet{
		{1: "Session Hours", 2: "Rate per Hour", 3: "Total Cost"},
		{1: "10", 2: "100", 3: "1000"},
		{1: "500", 2: "150", 3: "75000"},
		{1: "24", 2: "50", 3: "1200"},
	}

	result := sheet.Evaluate()

	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Evaluate() = %+v, want %+v", result, expected)
	}
}

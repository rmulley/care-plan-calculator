package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Serve static files
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Serve index.html for the root path
		if r.URL.Path == "/" {
			http.ServeFile(w, r, "index.html")
			return
		}
		
		// Serve other static files
		http.ServeFile(w, r, r.URL.Path[1:])
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status": "healthy", "timestamp": "%s"}`, time.Now().Format(time.RFC3339))
	})

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
} 
# Amazon Clone — 8x Assignment Project

A modern, high-performance Amazon Clone web application built as part of the **8x Assignment**. This repository includes fully automated prompt/response agent session logging under `.agent-logs/` and capture verification in `CAPTURE-TEST.md`.

## Features
- **Modern E-Commerce UI**: Inspired by Amazon's navigation, department filters, and responsive design.
- **Product Catalog & Search**: Instant searching across electronics, fashion, home, books, and gaming.
- **Product Details Modal**: Rich specs view, image gallery, rating system, and stock indicators.
- **Interactive Cart & Checkout**: Slide-out cart drawer, dynamic price calculation, quantity controls, and checkout simulation.
- **Agent Session Logs**: Automated transcript capture in `.agent-logs/` according to 8x Assignment specifications.

## Project Structure
```
├── .agent-logs/          # Automated session logs (committed)
├── scripts/              # Session capture helper scripts
│   └── sync_agent_logs.py
├── index.html            # Main web application HTML
├── styles.css            # Custom CSS design system
├── app.js                # E-commerce application logic & state management
├── CAPTURE-TEST.md       # Capture verification document
└── README.md             # Project documentation
```

## Setup & Running
Simply open `index.html` in any browser or launch a local web server:
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000`.

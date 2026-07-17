# Reykjavik 1986 FRUS Document Workbench

Static document-register site for official FRUS records on Reagan and Gorbachev's October 1986 Reykjavik meeting.

## Files

- `index.html` - site structure
- `styles.css` - responsive layout and visual system
- `sources.js` - primary-source register
- `app.js` - filters, timeline, copy, and CSV export

## Run

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Coverage Note

The active register includes only individual FRUS document pages on `history.state.gov`. It covers the lead-up, summit, and aftermath through 113 documents from Volumes V, VI, XI, and XLIV Part 1. Reagan Library photographs remain as unlinked image assets; every external record link points to an official FRUS document.

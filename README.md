# Reykjavik 1986 Primary Source Workbench

Static source-register site for public primary sources on Reagan and Gorbachev's October 1986 Reykjavik meeting.

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

The register includes public online primary sources and finding-aid leads. When a document is reproduced in FRUS, the visible card defers to the history.state.gov record rather than listing duplicate National Security Archive, Reagan Library, or Thatcher-hosted copies as separate sources. The site does not claim that every undigitized folder in the Reagan Library, TNA, Gorbachev Foundation, RGANI, GARF, Library of Congress, or State Department holdings has been harvested yet.

# Test Project

A Node.js starter project by Mamun.

## Stack

- Node.js (CommonJS)
- npm
- [dotenv](https://www.npmjs.com/package/dotenv) for environment variables

## Getting started

1. Install [Node.js](https://nodejs.org/) (includes npm).
2. Open a terminal in this folder.
3. Install dependencies:

```bash
npm install
```

If PowerShell blocks `npm` (`running scripts is disabled on this system`), use a new terminal after setting the CurrentUser execution policy, or run `npm.cmd` instead of `npm`.

## Scripts

| Script | Command | Description |
| --- | --- | --- |
| Test placeholder | `npm test` | Default npm test stub (no tests yet) |

## Project layout

```
.
├── package.json
├── package-lock.json
├── cursor.md      # Cursor agent notes
└── README.md
```

`index.js` is listed as the package entry in `package.json` but is not created yet.

## Environment variables

This project depends on `dotenv`. When you add app code, create a `.env` file in the project root and load it with:

```js
require("dotenv").config();
```

Do not commit secrets. Keep `.env` out of git.

## License

ISC

# Branch Locator Prototype

A standalone React prototype that selects the nearest sample branch to a project location. Coordinate conversion, organization filtering, Haversine distance calculation, and result sorting run locally in the browser.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm test
npm run build
```

The map works without a basemap. Users may enable the optional OpenStreetMap visual layer with the **Map detail** control; that layer requires internet access but is not used by any locator calculation.

## Replacing prototype data

Edit `src/data/branches.js`. Keep organization IDs aligned between `organizations` and each branch's `organizationId`; branch records require `id`, `branchName`, `city`, `latitude`, and `longitude`.

All included locations are sample prototype records. Nearest straight-line distance is only a suggestion and does not establish official administrative responsibility.

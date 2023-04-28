// DO NOT EDIT. This file is generated by fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import config from "./deno.json" assert { type: "json" };
import * as $0 from "./routes/[listId].tsx";
import * as $1 from "./routes/api/share-to-pool.ts";
import * as $2 from "./routes/index.tsx";
import * as $3 from "./routes/pool.tsx";
import * as $$0 from "./islands/TodoListView.tsx";

const manifest = {
  routes: {
    "./routes/[listId].tsx": $0,
    "./routes/api/share-to-pool.ts": $1,
    "./routes/index.tsx": $2,
    "./routes/pool.tsx": $3,
  },
  islands: {
    "./islands/TodoListView.tsx": $$0,
  },
  baseUrl: import.meta.url,
  config,
};

export default manifest;

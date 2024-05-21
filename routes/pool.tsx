import { Handlers } from "$fresh/server.ts";
import { PoolList } from "../shared/api.ts";
import { loadPool } from "../utils/db.ts";
import { Head } from "$fresh/runtime.ts";
import ItemSummary from "../components/ItemSummary.tsx";

export const handler: Handlers = {
  GET: async (req, ctx) => {
    const url = new URL(req.url);
    const startTime = Date.now();
    const data = await loadPool(
      url.searchParams.get("consistency") === "strong" ? "strong" : "eventual",
    );
    const endTime = Date.now();
    const res = await ctx.render({ data, latency: endTime - startTime, url });
    res.headers.set("x-list-load-time", "" + (endTime - startTime));
    return res;
  },
};
export default function Pool({
  data: { data, latency },
}: {
  data: { data: PoolList; latency: number };
}) {
  return (
    <>
      <Head>
        <title>Todo List</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <div class="flex gap-2 w-full items-center justify-center py-4 xl:py-16 px-2">
          <div class="rounded w-full xl:max-w-xl">
            <div class="flex flex-col gap-4 pb-4">
              <div class="flex flex-row gap-2 items-center">
                <h1 class="font-bold text-xl">Todo Pool</h1>
                {/* todo: refresh button */}
                {
                  /* <button
                class="p-1 text-blue-700 border-blue-700 hover:opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  const url = new URL("/api/share-to-pool", location.href);
                  url.searchParams.set("to", props.listId);
                  fetch(url.href, {
                    method: "POST",
                    credentials: "same-origin",
                  })
                    .catch(() => {});
                }}
                disabled={adding || data.isShared}
              >
                Share to Pool
              </button> */
                }
              </div>
              <div class="flex">
                <p class="opacity-50 text-sm">
                  Select the project you wanna to join.
                </p>
              </div>
              {/* todo: search */}
              {
                /* <div class="flex">
              <input
                class="border rounded w-full py-2 px-3 mr-4"
                placeholder="Add a todo item"
                ref={addTodoInput}
              />
              <button
                class="p-2 bg-blue-600 text-white rounded disabled:opacity-50"
                onClick={addTodo}
                disabled={adding}
              >
                Add
              </button>
            </div> */
              }
            </div>
            <div>
              {data.items.map((item) => (
                <ItemSummary
                  initialData={item}
                />
              ))}
            </div>
            <div class="pt-6 opacity-50 text-sm">
              <p>Initial data fetched in {latency}ms</p>
              <p>
                <a
                  href="https://github.com/denoland/showcase_todo"
                  class="underline"
                >
                  Source code
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

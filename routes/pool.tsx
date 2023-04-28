import { Handlers } from "$fresh/server.ts";
import { PoolList } from "../shared/api.ts";
import { loadPool } from "../utils/db.ts";

export const handler: Handlers = {
  GET: async (req, ctx) => {
    const url = new URL(req.url);
    const startTime = Date.now();
    const data = await loadPool(
      url.searchParams.get("consistency") === "strong" ? "strong" : "eventual",
    );
    const endTime = Date.now();
    const res = await ctx.render({ data, latency: endTime - startTime });
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
      <div>
        {JSON.stringify(data)}
        {latency.toString()}
      </div>
    </>
  );
}

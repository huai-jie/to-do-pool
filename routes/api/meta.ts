import type { Handlers } from "$fresh/server.ts";
import { metaSchema, writeTodoListMeta } from "../../utils/db.ts";

export const handler: Handlers = {
  async POST(req) {
    const body = metaSchema.parse(await req.json());
    const params = new URL(req.url).searchParams;
    const listId = params.get("to");

    if (listId) {
      await writeTodoListMeta(listId, body);
      const bc = new BroadcastChannel(`list/${listId}`);
      bc.postMessage("" + Date.now());
      return Response.json({ ok: true });
    }
    return new Response("Missing 'to' query parameter", { status: 400 });
  },
};

import type { Handlers } from "$fresh/server.ts";
import { writePoolItems } from "../../utils/db.ts";

export const handler: Handlers = {
  async POST(req) {
    const params = new URL(req.url).searchParams;
    const listId = params.get("to");

    if (listId) {
      await writePoolItems(listId, {
        id: listId,
        title: "title",
        description: "description",
      });
      const bc = new BroadcastChannel(`list/${listId}`);
      bc.postMessage("" + Date.now());
      return Response.json({ ok: true });
    }
    return new Response("Missing 'to' query parameter", { status: 400 });
  },
};

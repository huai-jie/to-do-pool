import {
  PoolList,
  PoolListItem,
  TodoList,
  TodoListItem,
} from "../shared/api.ts";
import { z } from "zod";

export const db = await Deno.openKv();
export const inputSchema = z.array(z.object({
  id: z.string(),
  text: z.string().nullable(),
  completed: z.boolean(),
}));
export const metaSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
});
export type InputSchema = z.infer<typeof inputSchema>;
export type MetaSchema = z.infer<typeof metaSchema>;

export async function loadList(
  id: string,
  consistency: "strong" | "eventual",
): Promise<TodoList> {
  //default
  const out: TodoList = {
    items: [],
    isShared: false,
  };

  const it = db.list({ prefix: ["list", id] }, {
    reverse: true,
    consistency,
  });
  for await (const entry of it) {
    const item = entry.value as TodoListItem;
    item.id = entry.key[entry.key.length - 1] as string;
    item.versionstamp = entry.versionstamp!;
    out.items.push(item);
  }
  out.isShared =
    !!((await db.get<string>(["pool", id], { consistency: "strong" }))
      .value);
  return out;
}
export async function loadPool(
  consistency: "strong" | "eventual",
): Promise<PoolList> {
  //default
  const out: PoolList = {
    items: [],
  };

  const it = db.list({ prefix: ["pool"] }, {
    reverse: true,
    consistency,
  });

  for await (const entry of it) {
    const item = entry.value as PoolListItem;
    out.items.push(item);
  }

  return out;
}

export async function writeItems(
  listId: string,
  inputs: InputSchema,
): Promise<void> {
  const currentEntries = await db.getMany(
    inputs.map((input) => ["list", listId, input.id]),
  );

  const op = db.atomic();

  inputs.forEach((input, i) => {
    if (input.text === null) {
      op.delete(["list", listId, input.id]);
    } else {
      const current = currentEntries[i].value as TodoListItem | null;
      const now = Date.now();
      const createdAt = current?.createdAt ?? now;

      const item: TodoListItem = {
        text: input.text,
        completed: input.completed,
        createdAt,
        updatedAt: now,
      };
      op.set(["list", listId, input.id], item);
    }
  });

  await op.commit();
}

export async function writePoolItems(
  listId: string,
  input: MetaSchema,
): Promise<void> {
  const op = db.atomic();
  //current entry
  const curr = await db.get(["pool", input.id]);

  if (input.title === null) {
    op.delete(["list", listId]);
  } else {
    const current = curr.value as PoolListItem | null;
    const now = Date.now();
    const createdAt = current?.createdAt ?? now;

    const item: PoolListItem = {
      title: input.title || listId,
      link: listId,
      createdAt,
      updatedAt: now,
    };
    op.set(["pool", input.id], item);
  }

  await op.commit();
}

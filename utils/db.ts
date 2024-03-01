import {
  PoolList,
  PoolListItem,
  TodoList,
  TodoListItem,
  TodoListMeta,
} from "../shared/api.ts";
import { z } from "zod";

export const kv = await Deno.openKv();
export const inputSchema = z.array(
  z.object({
    id: z.string(),
    text: z.string().nullable(),
    completed: z.boolean(),
  }),
);
export const metaSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
});
export type InputSchema = z.infer<typeof inputSchema>;
export type MetaSchema = z.infer<typeof metaSchema>;

const defaultMeta = {
  title: "Todo List",
  description: "Share this page to collaborate with others.",
};

export async function loadTodoList(
  id: string,
  consistency: "strong" | "eventual",
): Promise<TodoList> {
  //default
  const info = {
    items: [],
    isShared: false,
  };

  let _meta = defaultMeta;
  const meta = await kv.get<TodoListMeta>(["meta", id]);
  if (meta.value) {
    _meta = meta.value;
  }
  const out: TodoList = { ...info, ..._meta };
  const it = kv.list(
    { prefix: ["list", id] },
    {
      reverse: true,
      consistency,
    },
  );
  for await (const entry of it) {
    const item = entry.value as TodoListItem;
    item.id = entry.key[entry.key.length - 1] as string;
    item.versionstamp = entry.versionstamp!;
    out.items.push(item);
  }
  out.isShared = !!(
    await kv.get<string>(["pool", id], { consistency: "strong" })
  ).value;

  return out;
}
export async function loadPool(
  consistency: "strong" | "eventual",
): Promise<PoolList> {
  //default
  const out: PoolList = {
    items: [],
  };

  const it = kv.list(
    { prefix: ["pool"] },
    {
      reverse: true,
      consistency,
    },
  );

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
  const currentEntries = await kv.getMany(
    inputs.map((input) => ["list", listId, input.id]),
  );

  const op = kv.atomic();

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

export async function writeTodoListMeta(
  listId: string,
  input: MetaSchema,
): Promise<void> {
  const curr = await kv.get<string>(["meta", listId]);

  const op = kv.atomic();

  if (input.title === null) {
    op.delete(["meta", listId]);
  } else {
    const current = curr.value as TodoListMeta | null;
    const now = Date.now();
    const createdAt = current?.createdAt ?? now;

    const item: TodoListMeta = {
      title: input.title,
      description: input.description || "",
      createdAt,
      updatedAt: now,
    };
    op.set(["meta", listId], item);
  }

  await op.commit();
}

export async function writePoolItems(
  listId: string,
  input: MetaSchema,
): Promise<void> {
  const op = kv.atomic();
  //current entry
  const curr = await kv.get(["pool", listId]);
  const meta = await kv.get<string>(["meta", listId]);
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
    op.set(["pool", listId], item);

    if (!meta.value) {
      const metaValue: MetaSchema = defaultMeta;
      writeTodoListMeta(listId, metaValue);
    }
  }

  await op.commit();
}

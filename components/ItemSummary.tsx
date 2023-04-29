import type { PoolListItem } from "../shared/api.ts";

export default function ItemSummary(props: {
  initialData: PoolListItem;
}) {
  return (
    <div class="py-2">
      <div>
        <span class="cursor-pointer mr-2 text-gray-300">▲</span>
        <span class="mr-2">
          <a href={props.initialData.link}>{props.initialData.title}</a>
        </span>
        {
          <span class="text-gray-500">
            Link id: {props.initialData.link}
          </span>
        }
      </div>
      <div class="text-gray-500">
        {/* {props.initialData.description || ''} */}
        Desctiption soon ...
      </div>
    </div>
  );
}

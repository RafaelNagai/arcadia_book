import type { CSSProperties, ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

export function DroppableSection({
  id,
  itemIds,
  style,
  children,
}: {
  id: string;
  itemIds: string[];
  style?: CSSProperties;
  children: ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
      <div ref={setNodeRef} style={style}>
        {children}
      </div>
    </SortableContext>
  );
}

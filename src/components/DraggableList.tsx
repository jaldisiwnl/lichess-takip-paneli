'use client';

import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import type { TrackedPlayer } from '@/types/lichess';
import OyuncuKarti from './OyuncuKarti';
import { useApp } from '@/context/AppContext';

export default function DraggableList() {
  const { players, reorderPlayers } = useApp();

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const items = Array.from(players);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    reorderPlayers(items);
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="players">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-3">
            {players.map((player, index) => (
              <Draggable key={player.username} draggableId={player.username} index={index}>
                {(drag, snapshot) => (
                  <div
                    ref={drag.innerRef}
                    {...drag.draggableProps}
                    style={{
                      ...drag.draggableProps.style,
                      opacity: snapshot.isDragging ? 0.85 : 1,
                    }}
                  >
                    <OyuncuKarti
                      player={player}
                      dragHandle={
                        <span {...drag.dragHandleProps}>
                          <GripVertical size={16} />
                        </span>
                      }
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

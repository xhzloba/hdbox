'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

const DraggableTab = ({ tab, activeTab, onTabClick, isLocked, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id, disabled: isLocked })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
        ${isDragging ? 'z-50' : ''}
        ${
          activeTab === tab.id
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
        }
        ${isLocked ? 'cursor-default' : 'cursor-grab'}
        ${isDragging && !isLocked ? 'cursor-grabbing' : ''}
      `}
    >
      {/* Drag handle - показывается только когда не заблокировано */}
      {!isLocked && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing flex items-center justify-center w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="w-3 h-3" />
        </div>
      )}
      
      {/* Контент таба */}
      <div 
        onClick={onTabClick}
        className="flex items-center gap-2 cursor-pointer flex-1"
      >
        {children}
      </div>
    </div>
  )
}

export default DraggableTab
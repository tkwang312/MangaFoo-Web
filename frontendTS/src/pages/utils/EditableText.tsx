import React, {useEffect} from "react";
import { ResizableText } from "./ResizableText";
import { EditableTextInput } from "./EditableTextInput";

const RETURN_KEY = 13;
const ESCAPE_KEY = 27;

export function EditableText({
  x,
  y,
  isEditing,
  isTransforming,
  onToggleEdit,
  onToggleTransform,
  onChange,
  onResize,
  text,
  width,
  height,
  onDragEnd,
}) {

    // const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    useEffect(() => {
        
      }, [isEditing]);
  function handleEscapeKeys(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    console.log(e)
    if ((e.keyCode === RETURN_KEY && !e.shiftKey) || e.keyCode === ESCAPE_KEY) {
      onToggleEdit(e);
    }
  }

  function handleTextChange(e) {
    onChange(e.currentTarget.value);
  }

  return (
    !isEditing ? (
    <EditableTextInput
        x={x}
        y={y}
        width={width}
        height={height}
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleEscapeKeys}
      />
    ) : (
      <ResizableText
        x={x}
        y={y}
        isSelected={isTransforming}
        onClick={onToggleTransform}
        onDoubleClick={onToggleEdit}
        onResize={onResize}
        onDragEnd={onDragEnd}
        text={text}
        width={width}
      />
    )
  );
  

//   if (isEditing) {
//     return (
//       <EditableTextInput
//         x={x}
//         y={y}
//         width={width}
//         height={height}
//         value={text}
//         onChange={handleTextChange}
//         onKeyDown={handleEscapeKeys}
//       />
//     );
//   }
//   return (
//     <ResizableText
//       x={x}
//       y={y}
//       isSelected={isTransforming}
//       onClick={onToggleTransform}
//       onDoubleClick={onToggleEdit}
//       onResize={onResize}
//       text={text}
//       width={width}
//     />
//   );
}
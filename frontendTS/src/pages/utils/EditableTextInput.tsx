import React, { useEffect, useRef } from "react";
import { Html } from "react-konva-utils";

export function EditableTextInput({ x, y, width, value, onChange, onKeyDown }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    textareaRef.current.focus();
  }, []);

  return (
    <Html groupProps={{ x, y }} divProps={{ style: { opacity: 1 } }}>
        <textarea
        ref={textareaRef}
        style={{
            position: "absolute",
            left: x,
            top: y,
            width: width,
        }}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        />
    </Html>

  );
}

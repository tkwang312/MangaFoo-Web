import {
    FiSquare,
  } from 'react-icons/fi'
  
  export enum DrawAction {
    Select = "select",
    Rectangle = "rectangle",
    Circle = "circle",
    Scribble = "freedraw",
    Arrow = "arrow",
  }
  
  export const PAINT_OPTIONS = [
    { id: DrawAction.Rectangle, label: "Draw Rectangle Shape", icon: <FiSquare /> },
  ];
import React, { useCallback } from "react";
import type { WidgetProps } from "../../types/index.types";
import "./Widget.css";

const Widget = React.memo(({ id, name, value, style }: WidgetProps) => {
  const getColor = useCallback((value: number) => {
    if (value < 50) return "#ff0000"; // красный
    if (value > 50) return "#0000ff"; // синий
    return "#cccccc"; // серый
  }, []);

  return (
    <div
      className="widget"
      style={{
        ...style,
        backgroundColor: getColor(value),
      }}
      data-id={id}
    >
      <span className="widget-name">{name}</span>
      <span className="widget-value">{value}</span>
    </div>
  );
});

export default Widget;

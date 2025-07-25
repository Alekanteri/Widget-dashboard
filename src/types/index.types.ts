interface WidgetPosition {
  left: number;
  top: number;
}

export interface WidgetProps {
  id: string | number;
  name?: string;
  value: number;
  style?: React.CSSProperties;
  direction?: number;
  position?: WidgetPosition;
}

export interface VirtualizedWidgetGridProps {
  widgets: WidgetProps[];
}

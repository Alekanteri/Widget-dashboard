import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  WIDGET_HEIGHT,
  WIDGET_SPACING,
  WIDGET_WIDTH,
} from "../../consts/index.consts";
import type {
  VirtualizedWidgetGridProps,
  WidgetProps,
} from "../../types/index.types";
import Widget from "../Widget/Widget";

const VirtualizedWidgetGrid = ({ widgets }: VirtualizedWidgetGridProps) => {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [renderedWidgets, setRenderedWidgets] = useState<WidgetProps[]>([]);
  const widgetPositionsRef = useRef([]);
  const widgetsPerRowRef = useRef(0);
  const totalRowsRef = useRef(0);

  const calculateWidgetsPerRow = useCallback((containerWidth: number) => {
    return Math.max(
      1,
      Math.floor(containerWidth / (WIDGET_WIDTH + WIDGET_SPACING))
    );
  }, []);

  const precomputePositions = useCallback(
    (widgetsCount: number, containerWidth: number) => {
      const widgetsPerRow = calculateWidgetsPerRow(containerWidth);
      const positions = new Array(widgetsCount);

      for (let i = 0; i < widgetsCount; i++) {
        const row = Math.floor(i / widgetsPerRow);
        const col = i % widgetsPerRow;
        positions[i] = {
          left: col * (WIDGET_WIDTH + WIDGET_SPACING),
          top: row * (WIDGET_HEIGHT + WIDGET_SPACING),
          rowIndex: row,
          colIndex: col,
        };
      }

      return { positions, widgetsPerRow };
    },
    [calculateWidgetsPerRow]
  );

  useEffect(() => {
    if (widgets.length === 0 || containerSize.width === 0) return;

    const { positions, widgetsPerRow } = precomputePositions(
      widgets.length,
      containerSize.width
    );
    widgetPositionsRef.current = positions;
    widgetsPerRowRef.current = widgetsPerRow;
    totalRowsRef.current = Math.ceil(widgets.length / widgetsPerRow);
  }, [widgets.length, containerSize.width, precomputePositions]);

  const updateVisibleRange = useCallback(() => {
    const container = containerRef.current;
    if (!container || widgets.length === 0 || containerSize.width === 0) return;

    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const widgetsPerRow = widgetsPerRowRef.current;

    if (widgetsPerRow === 0) return;

    const startRow = Math.max(
      0,
      Math.floor(scrollTop / (WIDGET_HEIGHT + WIDGET_SPACING)) - 1
    );
    const visibleRows =
      Math.ceil(containerHeight / (WIDGET_HEIGHT + WIDGET_SPACING)) + 2;
    const endRow = Math.min(totalRowsRef.current, startRow + visibleRows);

    const startIndex = Math.max(0, startRow * widgetsPerRow);
    const endIndex = Math.min(widgets.length, endRow * widgetsPerRow);

    setVisibleRange({ start: startIndex, end: endIndex });
  }, [widgets.length, containerSize.width]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: number;
    const handleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(updateVisibleRange, 16);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    updateVisibleRange();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [updateVisibleRange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (visibleRange.start === visibleRange.end) return;

    const widgetsToRender = [];
    const positions = widgetPositionsRef.current;

    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      const widget = widgets[i];
      const position = positions[i];

      if (widget && position) {
        widgetsToRender.push({
          ...widget,
          position: {
            left: position.left,
            top: position.top,
          },
        });
      }
    }

    setRenderedWidgets(widgetsToRender);
  }, [visibleRange, widgets]);

  const totalHeight = useMemo(() => {
    if (widgets.length === 0 || containerSize.width === 0) return 0;
    const widgetsPerRow = calculateWidgetsPerRow(containerSize.width);
    const rows = Math.ceil(widgets.length / widgetsPerRow);
    return rows * (WIDGET_HEIGHT + WIDGET_SPACING);
  }, [widgets.length, containerSize.width, calculateWidgetsPerRow]);

  return (
    <div ref={containerRef} className="widget-grid-container">
      <div
        className="widget-grid"
        style={{
          height: `${totalHeight}px`,
          position: "relative",
        }}
      >
        {renderedWidgets.map((widget: WidgetProps) => (
          <Widget
            key={widget.id}
            id={widget.id}
            name={widget.name}
            value={widget.value}
            style={{
              position: "absolute",
              left: `${widget.position!.left}px`,
              top: `${widget.position!.top}px`,
              width: `${WIDGET_WIDTH}px`,
              height: `${WIDGET_HEIGHT}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default VirtualizedWidgetGrid;

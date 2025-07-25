import { useEffect, useRef, useState } from "react";
import { UPDATE_INTERVAL } from "../../consts/index.consts";
import type { WidgetProps } from "../../types/index.types";
import VirtualizedWidgetGrid from "../VirtualizedWidgetGrid/VirtualizedWidgetGrid";
import "./WidgetDashboard.css";

const WidgetDashboard = () => {
  const [widgets, setWidgets] = useState<WidgetProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const widgetsRef = useRef<Map<string | number, WidgetProps>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3001/api/widgets");
        const data = await response.json();

        const widgetsWithData = data.map((widget: WidgetProps) => ({
          ...widget,
          direction: 1,
        }));

        setWidgets(widgetsWithData);

        const widgetMap = new Map();
        widgetsWithData.forEach((widget: WidgetProps) => {
          widgetMap.set(widget.id, widget);
        });
        widgetsRef.current = widgetMap;
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (widgets.length === 0) return;

    const ws = new WebSocket("ws://localhost:3001");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket соединение установлено");
    };

    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        const widget = widgetsRef.current.get(update.id);

        if (widget) {
          widget.value = update.value;

          setWidgets((prev) => {
            const index = prev.findIndex(
              (w: WidgetProps) => w.id === update.id
            );
            if (index === -1) return prev;

            const newWidgets = [...prev];
            newWidgets[index] = { ...newWidgets[index], value: update.value };
            return newWidgets;
          });
        }
      } catch (error) {
        console.error("Ошибка обработки WebSocket сообщения:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket ошибка:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket соединение закрыто");
    };

    return () => {
      ws.close();
    };
  }, [widgets.length]);

  //! Симуляция обновления данных с бекенда
  useEffect(() => {
    if (widgets.length === 0) return;

    const interval = setInterval(() => {
      setWidgets((prev) => {
        const updates: WidgetProps[] = [];
        const newWidgets = prev.map((widget) => {
          let newValue = widget.value + widget.direction!;
          let newDirection = widget.direction;

          if (newValue >= 100) {
            newValue = 100;
            newDirection = -1;
          } else if (newValue <= -100) {
            newValue = -100;
            newDirection = 1;
          }

          if (newValue !== widget.value || newDirection !== widget.direction) {
            updates.push({ id: widget.id, value: newValue });
            return { ...widget, value: newValue, direction: newDirection };
          }

          return widget;
        });

        if (
          wsRef.current &&
          wsRef.current.readyState === WebSocket.OPEN &&
          updates.length > 0
        ) {
          updates.forEach((update) => {
            wsRef.current!.send(JSON.stringify(update));
          });
        }

        return newWidgets;
      });
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [widgets.length]);

  if (loading) {
    return <div className="loading">Загрузка данных...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Панель виджетов ({widgets.length} элементов)</h1>
      <VirtualizedWidgetGrid widgets={widgets} />
    </div>
  );
};

export default WidgetDashboard;

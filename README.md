# Widget Dashboard

Панель с 10000 виджетов в реальном времени с обновлением данных через WebSocket.

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm start
```

Приложение будет доступно по адресу: `http://localhost:3000`

### Сборка для продакшена

```bash
npm run build
```

## Запуск с Docker

### Сборка Docker образа

```bash
docker build -t widget-dashboard .
```

### Запуск контейнера

```bash
docker run -p 5173:5173 widget-dashboard
```


## Docker Compose

Также можно использовать docker-compose для запуска:

```bash
docker-compose up
```

Для запуска в фоновом режиме:
```bash
docker-compose up -d
```

Остановка:
```bash
docker-compose down
```

## Требования

- Node.js 14+
- npm 6+
- Docker (для запуска через контейнер)

## Использование

1. Запустите сервер (отдельно)
2. Настройте WebSocket endpoint в компоненте `WidgetDashboard`
3. Запустите React приложение

Приложение автоматически подключится к WebSocket серверу и начнет получать обновления данных в реальном времени.
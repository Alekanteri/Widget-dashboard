FROM node:24.4.1-alpine

# Установка рабочей директории
WORKDIR /app

# Копирование файлов конфигурации
COPY package.json package-lock.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

RUN npm run build

# Открытие порта
EXPOSE 5173

# Запуск в режиме preview (для production сборки)
CMD ["yarn", "preview", "--host", "0.0.0.0", "--port", "5173"]
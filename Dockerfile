FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Create a startup script
RUN echo '#!/bin/sh\n\
echo "Running database migrations..."\n\
node migrate.js\n\
echo "Starting server..."\n\
node server.js' > /app/start.sh && \
    chmod +x /app/start.sh

CMD ["/app/start.sh"]
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

COPY package*.json ./
RUN corepack enable
RUN corepack prepare pnpm@9.1.0 --activate
RUN pnpm install

COPY . .

EXPOSE 3000

# Create a startup script
RUN echo '#!/bin/sh\n\
echo "Running database migrations..."\n\
pnpm run migrate\n\
echo "Starting server..."\n\
pnpm run start' > /app/start.sh && \
    chmod +x /app/start.sh

CMD ["/app/start.sh"]

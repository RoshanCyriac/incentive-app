FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .

RUN echo "VITE_API_URL=$VITE_API_URL"

RUN npm run build


FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

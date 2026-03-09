FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# In production, we'd run prisma generate
# RUN npx prisma generate

EXPOSE 3002

CMD ["npm", "start"]

FROM node:16 as build

RUN mkdir /build
WORKDIR /build
RUN npm install -g @angular/cli@^15

COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
RUN ng build

FROM nginx
COPY --from=build /build/dist/game-of-life-hex /usr/share/nginx/html/

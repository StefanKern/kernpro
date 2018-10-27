
FROM nginx:alpine

COPY nginx.conf /etc/nginx/

WORKDIR /usr/share/nginx/html
COPY dist/kernpro/ .
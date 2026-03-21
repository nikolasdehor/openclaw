# Frontend Dockerfile
FROM nginx:alpine

# Remove config padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia configuração customizada
COPY nginx.conf /etc/nginx/conf.d

# Copia arquivos estáticos
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

FROM node:18-slim
WORKDIR /app
COPY . /app
COPY package.json /app
COPY package-lock.json /app
RUN npm install
RUN apt update
RUN apt install build-essential -y
RUN apt install software-properties-common -y
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt install python3.9
RUN apt install default-jdk -y
CMD ["node","index"]
EXPOSE 5000
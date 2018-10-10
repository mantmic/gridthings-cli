from node

RUN mkdir /gridthings-cli
RUN mkdir /root/.gtcli
COPY ./.gtcli/ /root/.gtcli/
COPY ./ /gridthings-cli/

WORKDIR /gridthings-cli
RUN (npm install -g)

EXPOSE 443

CMD [ "npm", "start" ]

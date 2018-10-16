from node

ARG gtcli_key

RUN mkdir /gridthings-cli
RUN mkdir /root/.gtcli

COPY ./ /gridthings-cli/

WORKDIR /gridthings-cli
RUN (npm install -g)

RUN (openssl aes-256-cbc -d -in .gtcli.aes -k $gtcli_key >> .gtcli.tar)
RUN (tar -xvf .gtcli.tar)
RUN (cp -R .gtcli /root/.gtcli)

EXPOSE 443

CMD [ "npm", "start" ]

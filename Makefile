all: build doc

allsts: build docsts

build:
	yarn && \
	grunt ts && \
	grunt && \
	grunt delivery

doc:
	grunt nodesheets
	mkdir -p doc/sdk/node/cheatsheets
	cp bin/jsdoc/sheets/cheatsheet/node/nodeSheet.png doc/sdk/node/cheatsheets && \
	mkdir -p doc/sdk/node/api && \
	cp build/*.md doc/sdk/node/api && \
	cp build/*.xml doc/sdk/node/api && \
	mkdir -p doc/sdk/node/guides && \
	cp tutorials/*.md doc/sdk/node/guides && \
	cp index.yml doc/sdk/node && \
	cp sitemap.xml doc/sdk/node

docsts
	grunt nodesheets
	mkdir -p doc/sdk/node/sts/cheatsheets && \
	cp bin/jsdoc/sheets/cheatsheet/node/nodeSheet.png doc/sdk/node/sts/cheatsheets && \
	mkdir -p doc/sdk/node/sts/api && \
	cp build/*.md doc/sdk/node/sts/api && \
	cp build/*.xml doc/sdk/node/sts/api && \
	mkdir -p doc/sdk/node/sts/guides && \
	cp tutorials/*.md doc/sdk/node/sts/guides && \
	cp index.yml doc/sdk/node/sts && \
	cp lts_version.json doc/sdk/node/sts && \
	cp sitemap.xml doc/sdk/node/sts && \ 
	echo "{ \n \"lts\": false,\n \"ltsbeta\": false,\n \"sts\": true \n  }" > ./doc/sdk/node/sts/version.json

doclts
	grunt nodesheets
	mkdir -p doc/sdk/node/lts/cheatsheets && \
	cp bin/jsdoc/sheets/cheatsheet/node/nodeSheet.png doc/sdk/node/lts/cheatsheets && \
	mkdir -p doc/sdk/node/lts/api && \
	cp build/*.md doc/sdk/node/lts/api && \
	cp build/*.xml doc/sdk/node/lts/api && \
	mkdir -p doc/sdk/node/lts/guides && \
	cp tutorials/*.md doc/sdk/node/lts/guides && \
	cp index.yml doc/sdk/node/lts && \
	cp lts_version.json doc/sdk/node/lts && \
	cp sitemap.xml doc/sdk/node/lts && \ 
	echo "{ \n \"lts\": true,\n \"ltsbeta\": false,\n \"sts\": false \n  }" > ./doc/sdk/node/sts/version.json

#	cp build/*.xml doc/sdk/node/guides

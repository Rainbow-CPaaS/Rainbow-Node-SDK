all: build doc

build:
	yarn && \
	grunt

doc:
	grunt nodesheets
	mkdir -p doc/sdk/node/cheatsheets
	cp bin/jsdoc/sheets/cheatsheet/node/nodeSheet.png doc/sdk/node/cheatsheets && \
	mkdir -p doc/sdk/node/api && \
	cp build/*.md doc/sdk/node/api && \
	mkdir -p doc/sdk/node/guides && \
	cp tutorials/*.md doc/sdk/node/guides && \
	cp index.yml doc/sdk/node

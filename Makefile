all: build doc

build:
	yarn && \
	grunt

doc:
	mkdir -p doc/sdk/node/api && \
	cp build/*.md doc/sdk/node/api && \
	cp jsdoc/api/index.yml doc/sdk/node/api && \
	mkdir -p doc/sdk/node/guides && \
	cp tutorials/*.md doc/sdk/node/guides && \
	cp jsdoc/guides/index.yml doc/sdk/node/guides && \
all: build doc

build:
	yarn && \
	grunt

doc:
	mkdir -p doc/sdk/node/api && \
	cp build/*.md doc/sdk/node/api && \
	mkdir -p doc/sdk/node/guides && \
	cp tutorials/*.md doc/sdk/node/guides
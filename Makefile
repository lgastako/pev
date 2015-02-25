PORT=8080

all:


demo:
	open http://localhost:$(PORT)/demo/index.html
	python -mSimpleHTTPServer $(PORT)


test:
	open http://localhost:$(PORT)/tests/index.html
	python -mSimpleHTTPServer $(PORT)


d: demo
t: test


.PHONY: demo test
.PHONY: d t

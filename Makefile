PORT=8080

all:

demo:
	open http://localhost:$(PORT)/demo/index.html
	python -mSimpleHTTPServer $(PORT)

tab-demo:
	open http://localhost:$(PORT)/demo/tab.html
	python -mSimpleHTTPServer $(PORT)

test:
	open http://localhost:$(PORT)/tests/index.html
	python -mSimpleHTTPServer $(PORT)

d: demo
td: tab-demo
t: test

.PHONY: demo test tab-demo
.PHONY: d t td

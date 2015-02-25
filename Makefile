PORT=8080

all:


demo:
	open http://localhost:$(PORT)/demo/index.html
	python -mSimpleHTTPServer $(PORT)


d: demo


.PHONY: demo d

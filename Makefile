dev:
	xdg-open http://127.0.0.1:4000/snake/
	bundle exec jekyll serve

run: dev

push:
	git add _posts/
	git commit -m "New post"
	git push

update:
	git add _posts/
	git commit --no-edit --amend
	git push -f

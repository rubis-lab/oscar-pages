sudo docker run --name=oscar-pages --rm --volume="$PWD:/srv/jekyll" -p 3000:4000 -it jekyll/jekyll jekyll serve
# check jekyll page through browser localhost:3000

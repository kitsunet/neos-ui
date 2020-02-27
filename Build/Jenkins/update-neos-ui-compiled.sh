#!/usr/bin/env bash

set -xe

export NODE_OPTIONS='--max_old_space_size=8192'

if [ -z "$GIT_BRANCH" ]; then echo "\$GIT_BRANCH not set"; exit 1; fi

# go to root directory of Neos.Neos.Ui
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/../../

path_to_yarn=$(which yarn)
if [ -z "$path_to_yarn" ] ; then
    echo "installing yarn:"
    npm install -g yarn
fi

GIT_SHA1=`git rev-parse HEAD`
GIT_TAG=`git describe --exact-match HEAD 2>/dev/null || true`

make install
make build-production

rm -Rf tmp_compiled_pkg
git clone git@github.com:neos/neos-ui-compiled.git tmp_compiled_pkg
cd tmp_compiled_pkg
git checkout "$GIT_BRANCH"
cd ..


mkdir -p tmp_compiled_pkg/Resources/Public/JavaScript
mkdir -p tmp_compiled_pkg/Resources/Public/Styles

cp -Rf Resources/Public/JavaScript/* tmp_compiled_pkg/Resources/Public/JavaScript
cp -Rf Resources/Public/Styles/* tmp_compiled_pkg/Resources/Public/Styles

cd tmp_compiled_pkg
git add Resources/Public/
git commit -m "Compile Neos UI - $GIT_SHA1" || true

if [[ "$GIT_BRANCH" == "origin/master" || "$GIT_BRANCH" == "origin/4.0"  || "$GIT_BRANCH" == "origin/5.0" ]]; then
    echo "Git branch $GIT_BRANCH found, pushing to this branch."
    git push origin HEAD:${GIT_BRANCH#*/}
fi

if [ "$GIT_TAG" != "" ]; then
    echo "Git tag $GIT_TAG found; also tagging the UI-compiled package."
    git tag -a -m "$GIT_TAG" $GIT_TAG
    git push origin $GIT_TAG
fi

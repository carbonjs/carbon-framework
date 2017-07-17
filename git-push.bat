set /p commit_message="Enter commit message: "
git add .
git commit -am "%commit_message%"
git push origin master

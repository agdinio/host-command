# ambassador-pass

SPORTOCO PWA

If you are not familiar with git, **PLEASE** read up on the subject before proceeding. A good reference is Professional Git by Brent Laster.

To setup your local repository:
Once you have installed git, create a local folder called SPORTOCO. This will be the root for all of your git repos for SPORTOCO work.
From this folder, then use the command:

```
$ git clone
git@gitlab.com:william.hoopes/ambassador-pass.git
Cloning into 'ambassador-pass'...
```

This creates a folder under SPORTOCO called ambassador-pass that contains a clone of the origin repository. In git parlance, the origin repository is the one hosted in GitLab, and the remote repository is the one on your local machine. At this moment, the remote repo on your machine is in synch with the origin.

To see the status of the repository on your machine:

```
$ git status
On branch master
Your branch is up-to-date with 'origin/master'.
nothing to commit, working tree clean
```

To see the history of the repo that you just cloned:

```
$ git log --oneline --decorate --graph --all
```

When you are ready to begin work on a specific feature, create a new branch. The branch should be named according to the story or bug ID related to your work. It is always safest to re-pull the code from github to make sure that you are working on the latest checkin. This reduces the effort to merge your work back into the codebase and reduces the likelihood of clobbering in-flight work of others.

## over view of process

```
1. git checkout -b sign-up-screen

# create upstream branch
1a. git push origin sign-up-screen (initially one time only)

-- or

# after upstream branch exist
1b. git branch --set-upstream-to=origin/sign-up-screen

# do work: git add, git commit, ...

### push to up stream repo
git push origin sign-up-screen // will call precommit
or
git push origin sign-up-screen --no-verify // skip precommit
```

This creates a local branch sign-up-screen for your feature work, if it doesn't already exist. As you do development work, you use the following commands (among others) to maintain your local repo:

```
git status
git add
git commit
git push origin sign-up-screen
git log --oneline --decorate --graph --all
```

As you make changes and additions to your project, it is wise to commit them to your local repository. As a general rule, commits to your local repo should be made each time you complete a discrete piece of functionality and the code compiles. You should avoid adding code that breaks the build to the repository. To determine which files to add to your commit:

```
$ git status
On branch sign-up-screen
Changes not staged for commit:

no changes added to commit (use "git add" and/or "git commit -a")
```

We see that _README.md_ has been modified and not yet added to the commit. To add it:

```
$ git add README.md
$ git status
On branch sign-up-screen

```

So the file is staged and ready to be committed. To commit the change:

```
$ git commit -m "Added additional verbosity to the README.md file."

```

You should regularly push your local branch to the repository to prevent accidental loss of work.

Once your feature work is complete, please create a PR or MR and get concensus approval prior to the merge into the main branch.

Once you no longer need the _sign-up-screen_ branch since this work has been completed, delete the branch by:

```
$ git branch -d sign-up-screen
Deleted branch sign-up-screen (was e150c2b).
```

### pull an upstream remote branch

```
git checkout -b sign-up-screen origin/sign-up-screen
git pull
```

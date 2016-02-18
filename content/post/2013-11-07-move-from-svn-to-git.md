---
title: Migrating from a Subversion repository to GitHub
date: 2013-11-07 16:31:04+00:00
slug: move-from-svn-to-git
categories:
  - General
tags:
  - GitHub
  - SCCS
---

One of greatest attractions of [GitHub](https://github.com/) is the community and the tooling that allows this community to share code. Each contributor can clone the repository, make their changes and then send you a [pull request](https://help.github.com/articles/using-pull-requests). As the project maintainer your job is now a whole lot easier and more manageable. No more patch files to worry about.

Follow the recipe bellow to move your [SVN](http://subversion.apache.org/) repo to [Git](http://git-scm.com/).
Best of all, you get to **keep the entire commit history** of your project.

<!--more-->

## Git author data

The first step is to create a text file mapping the SVN users into Git authors. The format is:

```ini
samaxes = Samuel Santos <samaxes@example.com>
```

To get a list of the author names that SVN uses, you can run this (on OSX the grep parameter is `-e` for a regular expression instead of the `-P`):

```bash
$ svn log ^/ --xml | grep -P "^<author" | sort -u | perl -pe 's/<author>(.*?)<\/author>/$1 = /' > authors.txt
```

**Note:** If the command-line is not your thing and you are migrating from a [SourceForge](http://sourceforge.net/) Subversion repository, use the code in [FindSVNCommitters.java](https://gist.github.com/samaxes/5674973) together with [SourceForge backup tool: rsync](http://sourceforge.net/apps/trac/sourceforge/wiki/Subversion#Backups) to get the complete list of author names.

## Create the Git repository

Next, create a new Git repository for your project. This will be a local repository for now so there's no need to worry about GitHub just yet:

```bash
$ git svn clone http://my-project.googlecode.com/svn/ --no-metadata --stdlayout --authors-file=../authors.txt my_project
```

**Notes:** Without the `--no-metadata` option, `git svn` adds a reference to the SVN revision number in every log message.
If `git svn` encounters an SVN committer name that does not exist in the `--authors-file` option, it will abort operation.

## Clean up SVN references

The initial clone imports everything including SVN branches and tags, however only a `master` branch is available locally:

```bash
$ git branch
* master
```

The svn-related branches and tags are actually remote branches in Git:

```bash
$ git branch -r
  tags/v1.0
  trunk
  ```

So, to move the tags to be proper Git tags, run:

```bash
$ git for-each-ref refs/remotes/tags | cut -d / -f 4- | grep -v @ | while read tagname; do git tag "$tagname" "tags/$tagname"; git branch -r -d "tags/$tagname"; done
Deleted remote branch tags/v1.0 (was 539f804).
```

And move the rest of the references under `refs/remotes` to be local branches:

```bash
$ git for-each-ref refs/remotes | cut -d / -f 3- | grep -v @ | while read branchname; do git branch "$branchname" "refs/remotes/$branchname"; git branch -r -d "$branchname"; done
Deleted remote branch trunk (was e4b45d8).
```

Now we have all the tags and branches locally:

```bash
$ git tag
v1.0
```

```bash
$ git branch
* master
  trunk
  ```

However, the local `trunk` branch is redundant with our Git `master` branch and should be removed:

```bash
$ git branch -d trunk
Deleted branch trunk (was e4b45d8).
```

## Push the code to GitHub

Now all the old branches are real Git branches and all the old tags are real Git tags, it's finally time to push the code to GitHub. For that, create your new repository on GitHub, and:

1. Add your new GitHub repository as a remote:

    ```bash
    $ git remote add origin git@my-git-server:myrepository.git
    ```

    If you get the error "**fatal: remote origin already exists**", do the following instead:

    ```bash
    $ git remote set-url origin git@my-git-server:myrepository.git
    ```

2. Push the code to it:

    ```bash
    $ git push origin --all
    Counting objects: 32, done.
    Delta compression using up to 2 threads.
    Compressing objects: 100% (24/24), done.
    Writing objects: 100% (31/31), 10.85 KiB | 0 bytes/s, done.
    Total 31 (delta 6), reused 0 (delta 0)
    To git@my-git-server:myrepository.git
       78ffd8f..f50e329  master -> master
    ```

    ```bash
    $ git push origin master --tags
    Counting objects: 1, done.
    Writing objects: 100% (1/1), 219 bytes | 0 bytes/s, done.
    Total 1 (delta 0), reused 0 (delta 0)
    To git@my-git-server:myrepository.git
        * [new tag]         v1.0 -> v1.0
    ```

All your branches and tags should be on your new GitHub repository in a nice, clean import.

Happy pushing!

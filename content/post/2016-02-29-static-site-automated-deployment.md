---
title: "Moving to a Static Website, part 3: Automated deployment with Wercker"
date: 2016-02-29
slug: static-site-automated-deployment
categories:
  - Web Development
tags:
  - Amazon
  - GitHub
  - Hugo
  - S3
  - Wercker
---

This is the third part of a four-part blog post covering my move from WordPress to Hugo, a static website generator. This post outlines how you can use [Wercker](http://wercker.com/) to streamline your [Hugo](http://gohugo.io/) deployment pipeline to [Amazon S3](https://aws.amazon.com/s3/).

If you haven't read the first two parts, you may find them at [Moving to a Static Website, part 1: From WordPress to Hugo]({{< ref "post/2016-02-18-static-site-from-wordpress-to-hugo.md" >}}) and [Moving to a Static Website, part 2: Hosting]({{< ref "post/2016-02-25-static-site-hosting.md" >}}).

<!--more-->

---

## Prerequisites

* You have [created a free account at Wercker](https://app.wercker.com/users/new/).

* You have the code of your Hugo site hosted at [GitHub](https://github.com/).

* You have cloned a repository that contains a [Hugo](http://gohugo.io/) site locally.

* You have an [Amazon S3 bucket](https://console.aws.amazon.com/s3/) that will serve your website.

### Git repository

We don't want the `public` directory version controlled, as we will use Wercker to generate that later on. Therefore, you should add a `.gitignore` file that will exclude this using the following command:

```sh
$ echo "/public" >> .gitignore
```

For the build to work properly with Wercker you need to have the full content of your theme folder on GitHub. Remove the external git configuration from it (`.git` folder), otherwise it will be considered as a submodule and the content will not be added to GitHub.

## Connect Wercker to GitHub

After you are registered at Wercker, you will need to link your GitHub account to Wercker.

You do this by going to your **profile settings**, and then **Git connections**.

<div>
{{< figure src="/img/wercker/connect-github.png" link="/img/wercker/connect-github.png" caption="Wercker GitHub connect" >}}
</div>

## Create an application

Now that we've got all the preliminaries out of the way, it's time to set up the application.

Click on the **+ Create** button in the top menu, and:

1. Choose to use GitHub as the Git provider.

2. Choose a repository.

3. Configure Wercker access to the repository.

<div>
{{< figure src="/img/wercker/create-application.png" link="/img/wercker/create-application.png" caption="Wercker new application example" >}}
</div>

## Add Amazon S3 deploy target

We now need to specify a custom deploy target on Wercker that we will use to setup the details for Amazon S3. Go to the settings tab for your application and under the section **Targets** click add **Add deploy target** and choose **custom deploy**.

Here you can fill in the name for your deploy target and, if you prefer, select the auto deploy option that allows you to automatically deploy specific branches.

Next you want to add the following environment variables that the build pipeline must leverage to sync your app with Amazon S3:

<div>
{{< figure src="/img/wercker/add-deploy-target.png" link="/img/wercker/add-deploy-target.png" caption="Wercker deploy target example" >}}
</div>

Here you enter the details of your Amazon S3 bucket. The key and secret key can be found in the [AWS security credentials](https://portal.aws.amazon.com/gp/aws/securityCredentials) page. The URL for the key `bucket-url` should be in the format `s3://example.com`.

## Create wercker.yml

Now it is time to define your build process. This is the pipeline that is run each time changes are pushed to the Git repository.

Create a new file called `wercker.yml` in the root of your repository with the following content:

<!-- TODO: update language alias to yaml or yml when they get supported -->
```
# This references a standard debian container from the
# Docker Hub https://registry.hub.docker.com/_/debian/
# Read more about containers on our dev center
# http://devcenter.wercker.com/docs/containers/index.html
box: debian

# You can also use services such as databases. Read more on our dev center:
# http://devcenter.wercker.com/docs/services/index.html
# services:
  # - postgres
  # http://devcenter.wercker.com/docs/services/postgresql.html

  # - mongodb
  # http://devcenter.wercker.com/docs/services/mongodb.html

# This is the build pipeline. Pipelines are the core of wercker
# Read more about pipelines on our dev center
# http://devcenter.wercker.com/docs/pipelines/index.html
build:
  # Steps make up the actions in your pipeline
  # Read more about steps on our dev center:
  # http://devcenter.wercker.com/docs/steps/index.html
  steps:
    # Build Hugo site
    - arjen/hugo-build:
        version: "0.15"
        theme: hugo-minimalist-theme
        config: config.yaml
        disable_pygments: true

deploy:
  steps:
    # Deploy site to Amazon S3
    - wercker/s3sync:
        key-id: $AWS_ACCESS_KEY_ID
        key-secret: $AWS_SECRET_ACCESS_KEY
        bucket-url: $AWS_BUCKET_URL
        source_dir: public/
        delete-removed: true
        opts: --acl-public --add-header=Cache-Control:max-age=2592000
```

Before you push the file `wercker.yml` to GitHub, make sure it validates on [wercker.yml validator](http://devcenter.wercker.com/articles/werckeryml/validate.html).

**Note:** If you get the message "Box `debian` does not exist in de the registry", change the box value to `wercker/default` and try again (make sure you revert it back to `debian` before you commit it).

The `s3sync` step synchronises a source directory with an Amazon S3 bucket. The `key_id`, `key_secret` and `bucket_url` options are set to the information from the deploy target, previously created on Wercker. Only the `source` option is hard configured to `public/` folder. This is the default folder with the output from the `hugo` command, which is executed in the build phase.

After you've created the `wercker.yml` add it to your repository by executing the following commands in your terminal:

```sh
$ git add wercker.yml
$ git commit -m "Add wercker.yml"
$ git push origin master
```

This automatically triggers a new build on Wercker as you can see below:

<div>
{{< figure src="/img/wercker/build.png" link="/img/wercker/build.png" caption="Wercker build example" >}}
</div>

If everything went well it should automatically start a new deploy to the S3 bucket that you have defined previously as the deploy target (if you did activate the auto deploy option):

<div>
{{< figure src="/img/wercker/deploy.png" link="/img/wercker/deploy.png" caption="Wercker deploy example" >}}
</div>

Congratulations your blog built with Hugo and deployed via Wercker is now live on Amazon S3!

---
title: 'Static Hosting with MongoDB Atlas: App Services'
meta_title: 'Static Hosting with MongoDB Atlas: App Services | Atlas Search'
meta_description: 'Static Hosting with App Services and Atlas Search.'
keywords:
    - overview
    - atlas-search
    - search-ui
    - react
    - vue
    - realm
    - hosting
    - mongodb
sidebar: 'docs'
nestedSidebar: 'atlas-search'
---

You can host the search UIs with MongoDB Atlas: App Services.

## Introduction

> App Services: Hosting allows you to host, manage, and serve your application's static media and document files. You can use Hosting to store individual pieces of content or to upload and serve your entire client application.


## Enabling Hosting

You need to first enable hosting for App Services. Navigate to "Org > Project > App Services > Application" menu and click "Enable Hosting".

![](https://i.imgur.com/XQ9kGGt.png)

Read more about enabling hosting in the official MongoDB App Services docs over [here](https://www.mongodb.com/docs/atlas/app-services/hosting/enable-hosting/).

## Uploading Search UI Files

For demonstration purposes, we will use the below Search UI on Codesandbox.io. Direct Github link for the same is over [here](https://github.com/appbaseio/searchbox/tree/master/packages/react-searchbox/examples/by-usecases/facet-filters).

<iframe src="https://codesandbox.io/embed/github/appbaseio/searchbox/tree/master/packages/react-searchbox/examples/by-usecases/facet-filters?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="@appbaseio/react-searchbox-mongo-facet-filters-example"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

![](https://i.imgur.com/MFI9RKj.png)

First, download the search UI project's directory locally from the **File > Export to ZIP** menu option.


Next, build the search UI by running `yarn && yarn build` (or `npm install && npm run build`). Now upload the files under the `build/` directory to the **App Services > Hosting** menu in Atlas cloud.

![](https://i.imgur.com/4dz4dh1.png)

**Note:** Ensure that the `static/` directory is also uploaded along with the other files.

Once uploaded, select "Review Draft & Deploy" action. This will generate a public URL for your search UI app.

We just deployed our app at: https://public-demo-skxjb.mongodbstitch.com/.

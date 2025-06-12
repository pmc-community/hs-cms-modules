This package contains the scripts that has to be loaded in any app/site that use IHS common REDUX store and IHS Message Hub.

# IMPORTANT
The scripts cannot be used as they are. They are designed to be used with the common REDUX store and IHS Message Hub that has to be loaded also. Loading the scripts only will (probably) not raise any error but will be also completely useless. We don't advise to install them with npm, it makes no sense. However, if needed to have the files locally for whatever reason, use **npm i global-ihs-init-for-web-apps --prefix /path/to/the/local/folder**.

# USAGE

```
<script async defer src="https://unpkg.com/global-ihs-init-for-web-apps@<version or latest>/<file-name.js>"></script>
```

# CONTENT
- v1.7.2: [ihs-main.js, globals.js, jquery.mark.js ]
# Global assets with CMS free

Global assets = global CSS od JS (such as latest jQuery)

Hubspot free CMS does not have the option to globally load assets for the whole site (crazy, huh!!!). In order to have some assets available for the whole site, these assets may be loaded in the the footer (or header but footer is better). Another anoying thing is that free Hubspot CMS is not able to load the latest jQuery which may be useful. 

So, edit the global footer (or header), select one text field (such as the company address or whatever), click on "Advanced" and see the HTML source for that field. Add the following for each asset you need:

{# embed the latest jQuery version #} 

{{ require_js("https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js") }} 

{{ require_js("https://cdnjs.cloudflare.com/ajax/libs/jquery-migrate/3.3.2/jquery-migrate.min.js") }} 

{# load a global stylesheet #} 

{{ require_css(get_asset_url("/ihs-assets/css/ihs-main.css")) }}
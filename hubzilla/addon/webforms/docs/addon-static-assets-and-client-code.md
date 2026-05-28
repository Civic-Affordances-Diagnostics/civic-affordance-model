# Addon Static Assets and Client-Side Code

## Status

Deployment finding and maintainer-facing technical note.

This document records a tested issue encountered while developing the Hubzilla `webforms` addon: addon JavaScript registered through Hubzilla's existing `head_add_js()` convention may fail to load when the web server denies all `/addon/...` paths.

The finding is not specific to `webforms`.

The tested solution is to permit safe static addon assets by extension while continuing to deny arbitrary addon source access.

## Why this matters

Client-side behavior is important for the `webforms` addon and for future Hubzilla addons that may perform substantial browser-local work.

For `webforms`, the browser is expected to handle:

```text
local draft state
visual grid rendering
selected-object editing
generated JSON inspection
future copy/download/import behavior
future drag/drop and snapping behavior
```

This is desirable because it avoids unnecessary server work and keeps early form-authoring behavior local to the user's workstation.

The Hubzilla server still provides:

```text
page shell
identity context
permission context
addon routing
future storage bridge
future federation bridge
```

The browser-local design direction depends on JavaScript loading reliably through normal Hubzilla addon conventions.

## Hubzilla-side JavaScript convention

Existing Hubzilla addons use `head_add_js()` with `/addon/...` asset paths.

Examples observed in the local Hubzilla tree included:

```php
head_add_js('/addon/hideaside/view/js/hideaside.js', 1);
head_add_js('/addon/logger_stats/view/js/chartjs/dist/chart.umd.js');
head_add_js('/addon/logger_stats/view/js/chartjs/zoom/chartjs-plugin-zoom.min.js');
head_add_js('/addon/logger_stats/view/js/momentjs/min/moment.min.js');
head_add_js('/addon/logger_stats/view/js/chartjs/moment-adapter.js');
head_add_js('/addon/hsse/sceditor/minified/sceditor.min.js');
head_add_js('/addon/workflow/view/js/workflow.js');
head_add_js('/addon/cart/submodules/view/js/jquery-ui-1.12.1/jquery-ui.min.js', 99);
```

The `webforms` addon follows the same pattern:

```php
head_add_js('/addon/webforms/view/js/webforms-design.js?v=property-editing-2');
```

This means the addon is not inventing a new JavaScript-loading convention.

## Initial failure

The browser console showed:

```text
GET https://directory.diagnostics.kane-il.us/addon/webforms/view/js/webforms-design.js?v=property-editing-2&v=11.2.1 net::ERR_ABORTED 403 (Forbidden)
```

The Design page itself loaded, but the browser-local Grid and JSON behavior did not run.

Visible symptoms:

```text
/webforms?mode=design
  page rendered

Grid tab
  no JavaScript-generated sample field

Selected object panel
  did not update on clicks

Browser console
  403 Forbidden for /addon/webforms/view/js/webforms-design.js
```

## Local nginx configuration before fix

The tested node had this nginx rule:

```nginx
location ~ ^/(store|addon|util|doc|cache)/ {
    deny all;
}
```

This rule denied every `/addon/...` path before addon JavaScript could be served.

The same server also had a static asset rule, but it did not include `.js`, and the `/addon` deny rule matched first:

```nginx
location ~* \.(jpg|jpeg|gif|png|ico|css|map|ttf|woff|woff2|svg)$ {
    expires 30d;
    try_files $uri /index.php?q=$uri&$args;
}
```

## Proof before fix

The following checks were performed before changing nginx.

Core JavaScript worked:

```bash
curl -k -I https://directory.diagnostics.kane-il.us/view/js/main.js | head
```

Result:

```text
HTTP/1.1 200 OK
Content-Type: application/javascript
```

Existing addon JavaScript was blocked:

```bash
curl -k -I https://directory.diagnostics.kane-il.us/addon/logger_stats/view/js/chartjs/moment-adapter.js | head
```

Result:

```text
HTTP/1.1 403 Forbidden
```

Webforms addon JavaScript was blocked:

```bash
curl -k -I https://directory.diagnostics.kane-il.us/addon/webforms/view/js/webforms-design.js | head
```

Result:

```text
HTTP/1.1 403 Forbidden
```

The webforms route itself worked:

```bash
curl -k -I "https://directory.diagnostics.kane-il.us/webforms?mode=design" | head
```

Result:

```text
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
```

The nginx error log confirmed:

```text
access forbidden by rule
```

for both:

```text
/addon/webforms/view/js/webforms-design.js
/addon/logger_stats/view/js/chartjs/moment-adapter.js
```

This established that the failure was not specific to `webforms`.

It was a static addon asset delivery issue.

## Tested nginx solution

A narrow static-addon-asset allow rule was inserted above the broad `/addon` deny rule.

Tested rule:

```nginx
location ~* ^/addon/.+\.(js|mjs|css|map|jpg|jpeg|gif|png|ico|svg|ttf|woff|woff2)$ {
    expires 30d;
    try_files $uri =404;
}

location ~ ^/(store|addon|util|doc|cache)/ {
    deny all;
}
```

This does not open arbitrary `/addon/...` access.

It permits only selected static asset extensions.

The broad deny rule remains in place below it.

## Backup and test procedure used

A backup was made before editing:

```bash
BACKUP="/root/hubzilla-nginx-before-addon-static-$(date +%Y%m%d-%H%M%S).conf"
cp -a /etc/nginx/sites-enabled/hubzilla "$BACKUP"
echo "Backup: $BACKUP"
```

The rule was inserted above the `/addon` deny block.

The config was tested:

```bash
nginx -t
```

Result:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

The server was reloaded:

```bash
systemctl reload nginx
```

## Proof after fix

Core JavaScript still worked:

```bash
curl -k -I https://directory.diagnostics.kane-il.us/view/js/main.js | head
```

Result:

```text
HTTP/1.1 200 OK
Content-Type: application/javascript
```

Existing addon JavaScript worked:

```bash
curl -k -I https://directory.diagnostics.kane-il.us/addon/logger_stats/view/js/chartjs/moment-adapter.js | head
```

Result:

```text
HTTP/1.1 200 OK
Content-Type: application/javascript
```

Webforms addon JavaScript worked:

```bash
curl -k -I https://directory.diagnostics.kane-il.us/addon/webforms/view/js/webforms-design.js | head
```

Result:

```text
HTTP/1.1 200 OK
Content-Type: application/javascript
```

Protected addon PHP/source remained blocked:

```bash
curl -k -I https://directory.diagnostics.kane-il.us/addon/webforms/webforms.php | head
```

Result:

```text
HTTP/1.1 403 Forbidden
```

This is the desired security boundary:

```text
static addon assets:
  allowed by extension

arbitrary addon source paths:
  still denied
```

## Browser proof after fix

After the nginx change, the browser no longer reported a `403 Forbidden` error for:

```text
/addon/webforms/view/js/webforms-design.js
```

The Design page then showed browser-local JavaScript behavior:

```text
sample field rendered on the Grid tab
clicking the field selected it
Selected object panel updated
browser console showed no asset-loading error
```

This proved that the addon-side JavaScript code was functional once the static asset could be served.

## Security boundary

The tested solution is not:

```text
open /addon to the web
```

The tested solution is:

```text
permit safe static addon assets by extension
continue denying arbitrary /addon source access
```

The protected PHP file test confirmed that:

```text
/addon/webforms/webforms.php
```

continued to return:

```text
403 Forbidden
```

## Maintainer-facing interpretation

This finding should be framed carefully.

Incorrect framing:

```text
Hubzilla does not provide a way to register JavaScript.
```

That is not true. Hubzilla provides `head_add_js()`, and existing addons use it.

Better framing:

```text
Hubzilla addons commonly register JavaScript with head_add_js() using /addon/... asset paths.

A restrictive nginx deployment rule can block these assets while leaving addon routes otherwise functional.

This may cause client-heavy addons to fail in ways that are not obvious unless the browser console or nginx error log is inspected.
```

## Possible upstream questions

This deserves Hubzilla maintainer attention because browser-local addon behavior can reduce server load and enable richer addons.

Questions for maintainers:

```text
1. Should Hubzilla's nginx deployment guidance explicitly allow safe static addon assets under /addon/...?

2. Should the recommended nginx rule allow static extensions such as js, mjs, css, map, images, and fonts while denying arbitrary addon source paths?

3. Should Hubzilla provide or document a preferred asset-serving route for addon JavaScript and CSS that avoids direct web-server exposure of /addon/... paths?

4. Should addon developer documentation clarify when to use head_add_js('/addon/...') versus relative asset names?
```

## Recommendation for this addon

The `webforms` addon should continue to use Hubzilla's existing JavaScript registration convention:

```php
head_add_js('/addon/webforms/view/js/webforms-design.js?v=property-editing-2');
```

The addon should not:

```text
inline large JavaScript into PHP output
copy addon JavaScript into core /view/js
bypass Hubzilla conventions
require arbitrary /addon source access
```

Deployment documentation should mention that addon JavaScript requires safe static addon assets to be servable.

## Current decision

The tested local solution is accepted for development:

```text
allow static addon assets by extension in nginx
keep arbitrary /addon access denied
continue using head_add_js() from webforms
```

This issue should be documented and raised respectfully with Hubzilla maintainers as a deployment/documentation/core-asset question, not as a complaint and not as a webforms-specific workaround.

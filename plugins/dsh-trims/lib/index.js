//#region lib/types/index.js
/**
 * Eloize demo trims plugin, node half.
 *
 * The empty apply gives the Loader a host-side row, while the browser half ships
 * through `exports["./client"]`. This package hides a few composer controls in the
 * UI only: it publishes no service, injects no host service and reaches no model
 * request, so every plugin behind the hidden controls keeps running untouched.
 */
/** Host plugin body - browser presentation only. */
function apply() {}
//#endregion
export { apply };

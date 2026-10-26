//#region lib/types/index.js
/**
 * Eloize demo shell plugin, node half.
 *
 * The empty apply gives the Loader a host-side row, while the browser half ships
 * through `exports["./client"]`. This package contributes browser presentation and
 * navigation only: it publishes no service and reaches no model request.
 */
/** Host plugin body - browser presentation only. */
function apply() {}
//#endregion
export { apply };

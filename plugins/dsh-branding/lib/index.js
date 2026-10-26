//#region lib/types/index.js
/**
 * Eloize branding plugin, node half.
 *
 * The empty apply gives the Loader a host-side row, while the browser half ships
 * through `exports["./client"]`. This package contributes browser presentation
 * only: it publishes no service, holds no mutable state and reaches no model
 * request.
 */
/** Host plugin body — browser presentation only. */
function apply() {}
//#endregion
export { apply };

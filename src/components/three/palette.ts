/**
 * ACES tone mapping crushes near-black. A scene value of #151515 comes out
 * as exactly the page's #050505, so canvases meet the page with no seam.
 */
export const SCENE_BLACK = "#151515";
export const PAGE_BLACK = "#050505";

/** Clear colour is not tone mapped unless post-processing is on. */
export const clearColor = (postprocessing: boolean) => (postprocessing ? SCENE_BLACK : PAGE_BLACK);

// Applies a computeThemeGradient() result to the page background, and dims
// the ambient decorative blobs (see FloatingBlobs.jsx / .blobs in
// styles/index.css) so the gradient reads clearly instead of getting washed
// out underneath them. Returns a cleanup function that puts everything back
// to normal — meant to be returned directly from a useEffect.
export function applyPageTheme(themeResult) {
  document.body.style.background = themeResult ? themeResult.gradient : "";
  document.body.classList.toggle("theme-active", Boolean(themeResult));

  return () => {
    document.body.style.background = "";
    document.body.classList.remove("theme-active");
  };
}

/**
 * changePathVisibility: Change the visibility of a path
 * @param path string the path to change the visibility of
 * @param hide boolean whether to hide the path or not
 * @return void
 **/
function changePathVisibility(path: string, hide: boolean) {
	const n = document.querySelector(`[data-path="${path}"]`);
	if (!n) {
		return;
	}
	const p = n.parentElement
	if (p) {
		if (hide) {
			p.style.display = `none`
		} else {
			p.style.display = ``;
		}
	}
}



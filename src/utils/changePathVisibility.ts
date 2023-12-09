export function changePathVisibility(path: string, hide: boolean) {
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

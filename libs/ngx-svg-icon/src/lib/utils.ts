export function classesToArray(v: string | string[] | null): string[] | null {
	if (v != null) {
		let a = (Array.isArray(v) ? v : v.split(' '))
			.map(x => (x ?? '').trim())
			.filter(x => x.length);
		a = uniqueStringArray(a);
		if (a.length) return a;
	}
	return null;
}

function uniqueStringArray(arr: string[]) {
	const map: Record<string, boolean> = {};
	for (const x of arr) map[x] = true;
	return Object.keys(map);
}


export const createSvgElement = (data: string, doc: Document): SVGElement => {
  const div = doc.createElement('DIV');
  div.innerHTML = data;
  return div.querySelector('svg') as SVGElement;
}

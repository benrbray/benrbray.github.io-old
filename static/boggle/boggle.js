"use strict"

let boggle = null;
let wordTrie = null;

window.addEventListener("load", function(){
	boggle = document.getElementById("boggle-board");
	//wordTrie = new WordTrie(DICTIONARY, 3);
});

function solveBoggle(){
	// read boggle board
	let boggleArray = boggle.getArray();
	let numRows = boggle.numRows;
	let numCols = boggle.numCols;

	// find words
	let pathMap = {};
	for(let r = 0; r < numRows; r++){
		for(let c = 0; c < numCols; c++){
			trieSearch(wordTrie.tree, boggleArray, [], r, c, pathMap);
		}
	}

	// sort keys
	let words = Object.keys(pathMap);
	words.sort(function(a,b){ return b.length - a.length; });

	displayWords(words, pathMap);

	return {
		words: words,
		paths: pathMap
	}
}

let BoggleState = {
	words: null,
	pathMap: null
}

function boggleHighlightWord(word){
	// pathMap must exist to find path for word
	if(!BoggleState.pathMap){ boggle.unhighlight(); return; }

	let coords = BoggleState.pathMap[word].map(function(coord){
		return [coord.r, coord.c];
	});

	boggle.highlight(coords, -1);
}

function displayWords(words, pathMap){
	BoggleState.pathMap = pathMap;
	let wordListElt = document.getElementsByClassName("wordList")[0];

	// remove children
	removeChildren(wordListElt);

	// add children
	for(let k = 0; k < words.length; k++){
		let word = words[k];
		let wordElt = document.createElement("span");
		wordElt.onmouseover = (evt => { boggleHighlightWord(word) }); 
		wordElt.textContent = word
		wordListElt.appendChild(wordElt);
	}
}

function removeChildren(elt){
	while(elt.children.length > 0){
		elt.removeChild(elt.lastChild);
	}
}

// Solver ----------------------------------------------------------------------

/* TRIESEARCH
 * Recursively search the boggle `board` for words contained in `subtrie`.
 * Current progress is represented by `path`.
 * @param (subtrie) A subtree of a `WordTrie` object.
 * @param (board) A boggle board, as a 2d array in row-major order.
 * @param (path) An array of coordinates { r:#, c:# } as (row/col).
 * @param (r,c) Row / column of the next cell to visit.
 * @param (pathMap) Map from words --> paths.
 */
function trieSearch(subtrie, board, path, r, c, pathMap){
	// skip if path already contains this point
	if(pathContains(path, r, c)){ return; }

	// skip if letter at (r,c) not in trie
	let letter = board[r][c];
	if(subtrie.hasOwnProperty(letter) === false) { return; }

	// extend path
	let newPath = path.slice();
	newPath.push({r:r, c:c});

	// check for words at this depth
	if(subtrie[letter].hasOwnProperty("*")){
		let word = getPathWord(board, newPath);
		pathMap[word] = newPath;
	}

	// dimensions
	let numRows = board.length;
	let numCols = board[0].length;

	// determine neighbors
	let left  = (c <= 0) ? 0 : -1;
	let right = (c >= numCols-1) ? 0 : +1;
	let up    = (r <= 0) ? 0 : -1;
	let down  = (r >= numRows-1) ? 0 : +1;
	
	// visit neighbors
	for(let nr = r + up; nr <= r + down; nr++){
		for(let nc = c + left; nc <= c + right; nc++){
			// exclude center point
			if(nc == c && nr == r){ continue; }
			// descend 
			trieSearch(subtrie[letter], board, newPath, nr, nc, pathMap);
		}
	}
}

/* GETPATHWORD
 * Returns the sequence of letters obtained by reading
 * the letters in `board` at the coordinates in `path`.
 * @param (board) A boggle board, as a 2d array in row-major order. 
 * @param (path) An array of coordinates { r:#, c:# } as (row/col).
 */
function getPathWord(board, path){
	let word = "";
	for(let i = 0; i < path.length; i++){
		let p = path[i];
		word += board[p.r][p.c];
	}
	return word;
}

/* PATHCONTAINS
 * Check whether `path` passes through row `r`, column `c`.
 * @param (path) An array of coordinates { r:#, c:# } as (row/col).
 */
function pathContains(path, r, c){
	for(let i = 0; i < path.length; i++){
		let p = path[i];
		if(p.r == r && p.c == c) return true;
	}
	return false;
}

function printBoard(){
	let boggleArray = boggle.getArray();

	for(let r = 0; r < boggle.numRows; r++){
		let row = [];
		for(let c = 0; c < boggle.numCols; c++){
			row.push({ r: r, c: c });
		}
		console.log(getPathWord(boggleArray, row));
	}
}

//// BOARD GENERATION //////////////////////////////////////////////////////////

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// english language cumulative letter frequencies
const eng_dist = [
    8167,  9659,  12441, 16694, 29396, 31624, 33639, 39733,
    46699, 46852, 47624, 51649, 54055, 60804, 68311, 70240,
    70335, 76322, 82649, 91705, 94463, 95441, 97801, 97951,
    99925, 100000
];

const words_25letters = [
	"ANTIESTABLISHMENTARIANISM", "ANTIDISESTABLISHMENTARISM",
	"DISESTABLISHMENTARIANISMS", "MICROCRYSTALLOGRAPHICALLY",
	"OCTILLIONDUOTRIGINTILLION", "QUINQUASEPTUAGINTILLIONTH",
	"UVULOPALATOPHARYNGOPLASTY", "SCAPHOTRAPEZIOTRAPEZOIDAL"
];

const order_16letters = [
	(false, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15]),
	(false, [0, 3, 4,15, 2, 1, 5,14, 7, 6,11,13, 8, 9,10,12]),
	(true,  [0,15,14,13, 2, 1,11,12, 3, 4, 9,10, 5, 6, 7, 8]),
	(false, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15]),
	(false, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,15]),
]

const words_16letters = [
	"ABSENTMINDEDNESS", "ACCEPTABLENESSES", "ACKNOWLEDGEMENTS", "ACQUAINTANCESHIP",
	"ALPHANUMERICALLY", "ALPHABETIZATIONS", "ANESTHESIOLOGIST", "ANTAGONISTICALLY",
	"ANTHROPOMORPHIZE", "ANTICOLONIALISTS", "AUTOBIOGRAPHICAL", "AUTHORITARIANISM",
	"AUTOCORRELATIONS", "BIODEGRADABILITY", "BLOODTHIRSTINESS", "BIOTECHNOLOGICAL",
	"BUREAUCRATICALLY", "CANNIBALIZATIONS", "CHARACTERIZATION", "CINEMATOGRAPHERS",
	"CIRCUMNAVIGATION", "CIRCUMSTANTIALLY", "CODETERMINATIONS", "COMPARTMENTALIZE",
	"CONTAGIOUSNESSES", "CONTEMPTUOUSNESS", "COORDINATENESSES", "COUNTERESPIONAGE",
	"CREDITWORTHINESS", "CRYSTALLOGRAPHER", "CURVILINEARITIES", "DECLASSIFICATION",
	"DEMYSTIFICATIONS", "DENUCLEARIZATION", "DIAGRAMMATICALLY", "DIPHTHONGIZATION",
	"DISCONTINUATIONS", "DISQUALIFICATION", "EDITORIZLIZATION", "ELECTRIFICATIONS",
	"EMANCIPATIONISTS", "EMBOURGEOISEMENT", "ENVIRONMENTALIST", "FLIBBERTIGIBBETY",
	"HYDRODYNAMICALLY", "HYPERINTELLIGENT", "HYPERSENSITIVITY", "IMMUNODEFICIENCY",
	"IMPERCEPTIVENESS", "INAUSPICIOUSNESS", "INCOMPREHENSIBLY", "INCONCEIVABILITY",
	"INCORRUPTIBILITY", "INDISCRIMINATING", "INEXTINGUISHABLE", "INHARMONIOUSNESS",
	"INSCRUTABILITIES", "INSTITUTIONALIZE", "INSTRUMENTATIONS", "INTERCOMMUNICATE",
	"INTERDIGITATIONS", "INTERNATIONALISM", "INTERPRETABILITY", "KNOWLEDGEABILITY",
	"LASCIVIOUSNESSES", "MALAPPORTIONMENT", "MALCONTENTEDNESS", "MECHANORECEPTORS",
	"METEOROLOGICALLY", "METHAMPHETAMINES", "MICROELECTRONICS", "MISPRONUNCIATION",
	"MISCOMMUNICATION", "MISUNDERSTANDING", "MONOCHROMATICITY", "MULTICULTURALISM",
	"MULTIDIMENSIONAL", "MULTIMILLIONAIRE", "NANOTECHNOLOGIES", "NEUROTRANSMITTER",
	"NONCHRONOLOGICAL", "NONDETERMINISTIC", "NONDISCRETIONARY", "NONPROLIFERATION",
	"ONOMATOPOEICALLY", "OTHERWORLDLINESS", "OVERENTHUSIASTIC", "PAPILLOMAVIRUSES",
	"PARAMETERIZATION", "PARLIAMENTARIANS", "PERIODONTOLOGIES", "PERIPHRASTICALLY",
	"PERPENDICULARITY", "PHONOCARDIOGRAPH", "PHOTOSYNTHESIZED", "PIEZOELECTRICITY",
	"PREPOSTEROUSNESS", "PRESUMPTUOUSNESS", "PROLETARIANISING", "PSYCHOPATHICALLY",
	"QUASIPERIODICITY", "QUINTESSENTIALLY", "RADIOSENSITIVITY", "RATIONALIZATIONS",
	"REPREHENSIBILITY", "RETROREFLECTIONS", "SCRUPULOUSNESSES", "SEMIPERMEABILITY",
	"SENSATIONALIZING", "SHORTSIGHTEDNESS", "SIMPLEMINDEDNESS", "STRAIGHTJACKETED",
	"SUBCONSCIOUSNESS", "SUBORGANIZATIONS", "SUPERINTELLIGENT", "THERMODYNAMICIST",
	"THERMOPLASTICITY", "TRANSFIGURATIONS", "TRANSPLANTATIONS", "ULTRACENTRIFUGAL",
	"UNATTRACTIVENESS", "UNAVAILABILITIES", "UNCONSTITUTIONAL", "UNDEMOCRATICALLY",
	"UNDERAPPRECIATED", "UNDERACHIEVEMENT", "UNDERESTIMATIONS", "UNDIPLOMATICALLY",
	"UNGRAMMATICALITY", "UNPREDICTABILITY", "UNRESPONSIVENESS", "UNSCRUPULOUSNESS",
	"VASOCONSTRICTION", "WHATCHAMACALLITS"
];


// uniform random
function randomUniform() {
	console.log("random :: uniform");
	let numRows = boggle.numRows;
	let numCols = boggle.numCols;
	let board = [];
	
	for(let r = 0; r < numRows; r++){
		let row = [];
		for(let c = 0; c < numCols; c++){
			let idx = (Math.random() * alphabet.length) | 0;
			row.push(alphabet[idx]);
		}
		board.push(row);
	}

	boggle.fillBoard({
		numRows : numRows,
		numCols : numCols,
		data: board
	});
}

// english letter distribution
function randomFreq() {
	console.log("random :: english letter frequency");
	let numRows = boggle.numRows;
	let numCols = boggle.numCols;
	let board = [];
	
	for(let r = 0; r < numRows; r++){
		let row = [];
		for(let c = 0; c < numCols; c++){
			row.push(letterFreqEN());
		}
		board.push(row);
	}

	boggle.fillBoard({
		numRows : numRows,
		numCols : numCols,
		data: board
	});
}

function letterFreqEN() {
	let random = Math.random() * 100000;
	for (let k = 0, length = alphabet.length; k < length; k++) {
		if (random < eng_dist[k]) { return alphabet[k]; }
	}
}

function backbite(numRows, numCols){
	// generate empty path
	let path = [];
	for(let idx = 0; idx < numRows*numCols; idx++){
		path.push({ prev: null, next: null });
	}

	// generate zigzag
	let zig = true;
	let prev = null;

	for(let r = 0; r < numRows; r++){
		for(let c = 0; c < numCols; c++){
			let idx = r*numCols + ( zig ? c : (numCols-c-1) );

			path[idx].prev = prev;
			if(prev != null){ path[prev].next = idx; }

			prev = idx;
		}
		zig = !zig;
	}

	// generate zigzag
	/*let diagCount = numRows + numCols - 1;
	let diagLength = 1;
	let diagStartIdx = 0;
	let minDim = Math.min(numRows, numCols);
	let zig = false;
	for(let i = 0; i < diagCount; i++){
		// zigzag
		let idx = diagStartIdx;
		for(let j = 0 ; j < diagLength; j++){
			// ??????
		}

		// compute diagonal start idx (first row, then final col)
		if(i < numCols-1) { diagStartIdx += 1;       }
		else              { diagStartIdx += numCols; }

		// compute diagonal length (even for non-square grids)
		if(i+1 < minDim)             { diagLength++; }
		if(i  >= diagCount - minDim) { diagLength--; }
	}*/

	// handle single row / column
	if(numRows == 1 || numCols == 1){
		return path;
		// TODO: reverse path with probability
	}

	let endA = 0;
	let endB = prev;

	// validate initial path
	validatePath(path, numRows, numCols, endA, endB);

	// backbite algorithm
	let max_iter = numRows * numCols;
	for(let iter = 0; iter < max_iter; iter++){
		// random stopping
		if(Math.random() < 0.01){ break; }

		let result = backbiteIter(path, numRows, numCols, endA, endB);
		path = result.path;
		endA = result.endA;
		endB = result.endB;
		
		validatePath(path, numRows, numCols, endA, endB);
	}

	//printPath(path, numRows, numCols);
	
	// return order of each array index in the path
	let result = [];
	for(; result.length < 10; result.push(-1)) { };

	let idx = endA;
	let order = 0;

	while(idx != null){
		result[idx] = order;
		order++;
		idx = path[idx].next;
	}
	
	return result;
}

function backbiteIter(path, numRows, numCols, endA, endB){
	// backbite
	let whichEnd = (Math.random() < 0.5);
	let end = (whichEnd ? endA : endB);
	let row = Math.floor(end / numCols);
	let col = end % numCols;

	// select random neighbor
	let neighbors = [];

	// t(op), b(ottom), l(eft), r(ight)
	let free_l = (col > 0);
	let free_r = (col < numCols-1);
	let free_t = (row > 0);
	let free_b = (row < numRows-1);

	// TODO: Prettier?
	if(free_l) {     neighbors.push(end-1); }
	if(free_r) {     neighbors.push(end+1); }
	if(free_t) {     neighbors.push(end-numCols);
		if(free_l) { neighbors.push(end-numCols-1); }
		if(free_r) { neighbors.push(end-numCols+1); }
	}
	if(free_b) {     neighbors.push(end+numCols);
		if(free_l) { neighbors.push(end+numCols-1); }
		if(free_r) { neighbors.push(end+numCols+1); }
	}

	// choose random non-adjacent neighbor
	// (resolve wrong choice with fisher-yates-like shuffle)
	let idx = (Math.random() * neighbors.length) | 0;
	let adjacent = (whichEnd ? path[end].next : path[end].prev);
	while(neighbors[idx] == adjacent){
		neighbors[idx] = neighbors[neighbors.length-1];
		idx = (Math.random() * (neighbors.length-1)) | 0;
	}
	let nhbr = neighbors[idx];

	// connect neighbor to endpoint
	if(whichEnd){ 

		if(nhbr == endB){
			path[end ].prev = nhbr;
			path[nhbr].next = end;

			endA = nhbr;
			endB = path[nhbr].prev;
			path[endB].next = null;
			path[endA].prev = null;
		} else {
			path[end].prev = path[end].next;
			path[end].next = nhbr;
			let idx = path[nhbr].prev;
			path[nhbr].prev = end;

			// new front is at idx
			endA = idx;

			// reverse path from [end --> nhbr)
			let prev = null;
			while(idx != end){
				let next = path[idx].prev;
				path[idx].prev = prev;
				path[idx].next = next;
				prev = idx;
				idx = next;
			}
		}

	} else {

		if(nhbr == endA){
			path[end ].next = nhbr;
			path[nhbr].prev = end;

			endA = path[nhbr].next;
			endB = nhbr;
			path[endB].next = null;
			path[endA].prev = null;
		} else {
			path[end].next = path[end].prev;
			path[end].prev = nhbr;
			let idx = path[nhbr].next;
			path[nhbr].next = end; 

			// new back is at idx
			endB = idx;

			// reverse path from [end --> nhbr)
			let next = null;
			while(idx != end){
				let prev = path[idx].next;
				path[idx].next = next;
				path[idx].prev = prev;
				next = idx;
				idx = prev;
			}
		}
	}

	return { path, endA, endB, idx };
}

/*function printPath(path, numRows, numCols){
	let pathStr = "";
	for(let r = 0; r < numRows; r++){
		let rowStr = "";
		for(let c = 0; c < numCols; c++){
			let idx = r*numCols + c;
			let next = path[idx].next;

			if(path[idx].prev == null){
				     if(next == null)          { rowStr += "E ";  }
				else if(next == idx-1)         { rowStr += "🢀 "; }
				else if(next == idx+1)         { rowStr += "🢂 "; }
				else if(next == idx-numCols)   { rowStr += "🢁 "; }
				else if(next == idx+numCols)   { rowStr += "🢃 "; }
				else if(next == idx-numCols-1) { rowStr += "🢄 "; }
				else if(next == idx+numCols-1) { rowStr += "🢇 "; }
				else if(next == idx-numCols+1) { rowStr += "🢅 "; }
				else if(next == idx+numCols+1) { rowStr += "🢆 "; }
			} else {
				     if(next == null)          { rowStr += "E ";  }
				else if(next == idx-1)         { rowStr += "🡨 "; }
				else if(next == idx+1)         { rowStr += "🡪 "; }
				else if(next == idx-numCols)   { rowStr += "🡩 "; }
				else if(next == idx+numCols)   { rowStr += "🡫 "; }
				else if(next == idx-numCols-1) { rowStr += "🡤 "; }
				else if(next == idx+numCols-1) { rowStr += "🡧 "; }
				else if(next == idx-numCols+1) { rowStr += "🡥 "; }
				else if(next == idx+numCols+1) { rowStr += "🡦 "; }
			}
		}
		pathStr += rowStr + "\n";
	}

	console.log(pathStr);
}*/

function assert(cond, message){
	if(!cond){ throw message || "Assertion Failed!"; }
}

function validatePath(path, numRows, numCols, endA, endB){
	// check ends
	assert(path[endA].prev == null, `endA=${endA} :: prev not null`);
	assert(path[endA].next != null, `endA=${endA} :: next is null`);
	assert(path[endB].prev != null, `endB=${endB} :: prev is null`);
	assert(path[endB].next == null, `endB=${endB} :: next not null`);

	// check middle
	let visited = [];
	for(let idx = 0; idx < numRows*numCols; idx++){
		visited.push(false);
		if(idx != endA) { assert(path[idx].prev != null, `path[${idx}] is null`); }
		if(idx != endB) { assert(path[idx].next != null, `path[${idx}] is null`); }
	}

	// check traversal
	let idx = endA;
	let prev = null;

	while(idx != null){
		assert(path[idx].prev == prev, "inconsistent pointers");
		assert(!visited[idx], "cycle found!");
		visited[idx] = true;
		prev = idx;
		idx = path[idx].next;
	}

	// all visited?
	for(let idx = 0; idx < visited.length; idx++){
		assert(visited[idx], `idx=${idx} not visited!`);
	}
}

function randomWord(){
	let word, numRows, numCols;

	if(true){
		// choose random 16-letter word
		word = words_16letters[(Math.random()*words_16letters.length)|0];
		numRows = numCols = 4;
		console.log(`random16 :: ${word}`);
	} else {
		// choose random 25-letter word
		word = words_25letters[(Math.random()*words_25letters.length)|0];
		numRows = numCols = 5;
		console.log(`random25 :: ${word}`);
	}

	// assign word to random(ish) hamiltonian path
	fillBoardWithWord(word);
}

function fillBoardWithWord(word){
	if(word.length < 2){ return; }
	
	// compute minimal board size needed to fit word
	let numCols = Math.floor(Math.sqrt(word.length));
	let numRows = Math.ceil(word.length / numCols);

	
	// generate random(ish) hamiltonian path
	let path = backbite(numRows, numCols);
	let board = [];

	for(let r = 0; r < numRows; r++){
		let row = [];
		for(let c = 0; c < numCols; c++){
			let idx = path[r * numCols + c];
			
			// pad with random letters if word not long enough
			if(idx < word.length){ row.push(word[idx]);      }
			else                 { row.push(letterFreqEN()); }
		}
		board.push(row);
	}

	boggle.fillBoard({
		numRows : numRows,
		numCols : numCols,
		data: board
	});
}

// RANDOM: Boggle Dice ---------------------------------------------------------

const BOGGLE_DICE_OLD = [
	"AACIOT", "ABILTY", "ABJMOQ", "ACDEMP",
	"ACELRS", "ADENVZ", "AHMORS", "BIFORX",
	"DENOSW", "DKNOTU", "EEFHIY", "EGKLUY",
	"EGINTV", "EHINPS", "ELPSTU", "GILRUW"
]

const BOGGLE_DICE_NEW = [
	"AEANEG", "AHSPCO", "ASPFFK", "OBJOAB",
	"IOTMUC", "RYVDEL", "LREIXD", "EIUNES",
	"WNGEEH", "LNHNRZ", "TSTIYD", "OWTOAT",
	"ERTTYL", "TOESSI", "TERWHV", "NUIHMQ"
]

// fisher-yates shuffle (https://bost.ocks.org/mike/shuffle/)
function shuffle(array) {
	let m = array.length, t, i;
	while (m) {
		i = Math.floor(Math.random() * m--);
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}

	return array;
}

function randomDice() {
	// TODO: support arbitrary #cells
	console.log("random :: dice");
	let numRows = 4, numCols = 4;

	// random permutation (fisher-yates shuffle)
	let permute = [];
	for(let idx = 0; permute.length < 16; permute.push(idx++)) {};
	permute = shuffle(permute);
	console.log(permute);

	// roll dice
	let board = [];
	let idx = 0;
	
	for(let r = 0; r < numRows; r++){
		let row = [];
		for(let c = 0; c < numCols; c++){
			let die = permute[idx++];
			let roll = (Math.random()*BOGGLE_DICE_OLD[die].length) | 0;
			row.push(BOGGLE_DICE_OLD[die][roll]);
		}
		board.push(row);
	}

	boggle.fillBoard({
		numRows : numRows,
		numCols : numCols,
		data: board
	});
}

///// BACKBITE DEMO //////////////////////////////////////////////////

let examplePath = 
	[{"prev":9,"next":8},{"prev":8,"next":2},{"prev":1,"next":11},{"prev":10,"next":12},{"prev":11,"next":5},{"prev":4,"next":13},{"prev":13,"next":7},{"prev":6,"next":14},{"prev":0,"next":1},{"prev":16,"next":0},{"prev":19,"next":3},{"prev":2,"next":4},{"prev":3,"next":21},{"prev":5,"next":6},{"prev":7,"next":22},{"prev":22,"next":23},{"prev":17,"next":9},{"prev":24,"next":16},{"prev":26,"next":25},{"prev":27,"next":10},{"prev":null,"next":27},{"prev":12,"next":28},{"prev":14,"next":15},{"prev":15,"next":30},{"prev":32,"next":17},{"prev":18,"next":34},{"prev":35,"next":18},{"prev":20,"next":19},{"prev":21,"next":36},{"prev":37,"next":null},{"prev":23,"next":39},{"prev":39,"next":38},{"prev":33,"next":24},{"prev":34,"next":32},{"prev":25,"next":33},{"prev":36,"next":26},{"prev":28,"next":35},{"prev":38,"next":29},{"prev":31,"next":37},{"prev":30,"next":31}];
let exampleEndA = 20;
let exampleEndB = 29;

window.addEventListener("load", function(){
	demoBackbite("#backbite-demo", 10, 16);
	demoExamples();
});

function pathListToPoints(pathList, startIdx){
	let order = [];
	let idx = startIdx;
	while(idx !== null){
		order.push(idx);
		idx = pathList[idx].next;
	}
	return order;
}

function demoBackbite(demoId, numRows, numCols){
	// dimensions
	let demoWidth = 800;
	let demoHeight = 500;
	let demoMargin = 20;

	// generate empty path
	let path = [];
	for(let idx = 0; idx < numRows*numCols; idx++){
		path.push({ prev: null, next: null });
	}

	// generate zigzag
	let zig = true;
	let prev = null;

	for(let r = 0; r < numRows; r++){
		for(let c = 0; c < numCols; c++){
			let idx = r*numCols + ( zig ? c : (numCols-c-1) );

			path[idx].prev = prev;
			if(prev != null){ path[prev].next = idx; }

			prev = idx;
		}
		zig = !zig;
	}

	// path start/end
	let endA = 0;
	let endB = prev;

	// convert path
	let pathPoints = pathListToPoints(path, endA);

	// set up svg
	let demo = d3.select(demoId);
	demo.attr("viewBox", `${-demoMargin} ${-demoMargin} ${demoWidth+2*demoMargin} ${demoHeight+2*demoMargin}`)
		.attr("height", "250");

	
	// draw grid
	demoGrid(demo, demoWidth, demoHeight, numRows, numCols);
	
	let points = [];
	for(let r = 0; r < numRows; r++){
		for(let c = 0; c < numCols; c++){
			points.push({ x:(c+0.5)*demoWidth/numCols, y:(r+0.5)*demoHeight/numRows });
		}
	}

	let lineFunction = d3.line()
		.x(function(d,i){ return points[d].x })
		.y(function(d,i){ return points[d].y })
		.curve(d3.curveNatural)
	//	.curve(d3.curveCatmullRom.alpha(0.5))
	//	.curve(d3.curveCardinal.tension(0.5))

	// path
	let line = demo.append("svg:path")
		.classed("hampath", true)
		.attr("stroke", "blue")
		.attr("d", lineFunction(pathPoints))

	// animate
	window.setInterval(function(){
		({path, endA, endB} = backbiteIter(path, numRows, numCols, endA, endB));
		let pathPoints = pathListToPoints(path, endA);
		line.attr("d", lineFunction(pathPoints))
	}, 40);
}

function demoGrid(svg, width, height, numRows, numCols){
	let gridv = svg.append("g")
		.selectAll("line")
		.data(Array(numCols+1))
		.enter()
			.append("line")
			.attr("x1", (d,k) => k*width/numCols)
			.attr("y1", (d,k) => 0)
			.attr("x2", (d,k) => k*width/numCols)
			.attr("y2", (d,k) => height)
			.attr("stroke", "#999")
			.attr("stroke-width", 2);
	let gridh = svg.append("g")
		.selectAll("line")
		.data(Array(numRows+1))
		.enter()
			.append("line")
			.attr("x1", (d,k) => 0)
			.attr("y1", (d,k) => k*height/numRows)
			.attr("x2", (d,k) => width)
			.attr("y2", (d,k) => k*height/numRows)
			.attr("stroke", "#999")
			.attr("stroke-width", 2);
}


// Example 1 ---------------------------------------------------------

function demoExamples(){
	// dimensions
	let demoWidth = 800;
	let demoHeight = 500;
	let demoMargin = 20;
	let numRows = 5;
	let numCols = 8;

	// Path Info -----------------------------------------------------

	// generate empty path
	let pathList = examplePath;
	let endA = exampleEndA;
	let endB = exampleEndB;

	// convert path from linked list --> vertex ids
	let pathPoints = [];
	let idx = endA;
	while(idx !== null){
		pathPoints.push(idx);
		idx = pathList[idx].next;
	}

	// path modifications
	let backbiteIdx = endA + 1;

	let pathExtended = pathPoints.slice();
	pathExtended.splice(0, 0, backbiteIdx);

	let pathFront = pathPoints.slice(0, pathPoints.indexOf(backbiteIdx)+1);
	let pathBack  = pathPoints.slice(pathPoints.indexOf(backbiteIdx)+1);

	let pathFrontLoop = pathFront.slice();
	pathFrontLoop.push(pathPoints[0]);

	let pathResult = pathFront.slice(0, -1).reverse();
	pathResult.push(backbiteIdx);
	pathResult.push(...pathBack);

	// Common --------------------------------------------------------

	// create svg for all examples
	let demoSvgs = d3.select("#backbite-example")
		.selectAll("figure")
		.select("svg")
			.attr("id", (d,k)=>`backbite-example${k+1}`)
			.attr("viewBox", `${-demoMargin} ${-demoMargin} ${demoWidth+2*demoMargin} ${demoHeight+2*demoMargin}`)

	// set up grid for all examples
	demoSvgs.each(function(){
		demoGrid(d3.select(this), demoWidth, demoHeight, numRows, numCols);
	});

	// grid points
	let points = [];
	for(let r = 0; r < numRows; r++){
		for(let c = 0; c < numCols; c++){
			points.push({
				x:(c+0.5)*demoWidth/numCols,
				y:(r+0.5)*demoHeight/numRows
			});
		}
	}

	// line function
	let lineFunction = d3.line()
		.x(function(d,i){ return points[d].x })
		.y(function(d,i){ return points[d].y })
		.curve(d3.curveCardinal.tension(0.3))
	
	// select demos
	let demo1 = d3.select("#backbite-example1");
	let demo2 = d3.select("#backbite-example2");
	let demo3 = d3.select("#backbite-example3");
	let demo4 = d3.select("#backbite-example4");

	// Example 1 -----------------------------------------------------
	
	// original path
	let path = demo1.append("svg:path")
		.classed("hampath", true)
		.attr("stroke", "blue")
		.attr("marker-mid", "url(#head)")
		.attr("d", lineFunction(pathPoints))

	d3.select(makeArrows(path.node(), 14))
		.style("fill", "blue");
	
	// Example 2 -----------------------------------------------------

	// original path
	path = demo2.append("svg:path")
		.classed("hampath", true)
		.attr("stroke", "blue")
		.attr("id", "path1")
		.attr("d", lineFunction(pathPoints))
	
	d3.select(makeArrows(path.node(), 14))
		.style("fill", "blue");

	// extension
	demo2.append("svg:path")
		.classed("hampath", true)
		.attr("stroke", "green")
		.attr("d", lineFunction([backbiteIdx, endA]))

	// Example 3 -----------------------------------------------------

	// original path
	path = demo3.append("svg:path")
		.attr("id", "pathLoop")
		.classed("hampath", true)
		.attr("stroke", "red")
		.attr("d", lineFunction(pathFrontLoop))
	
	d3.select(makeArrows(path.node(), 5))
		.style("fill", "red");

	// extension
	demo3.append("svg:path")
		.classed("hampath", true)
		.attr("stroke", "blue")
		.attr("d", lineFunction(pathBack));

	// Example 4 -----------------------------------------------------

	// path
	demo4.append("svg:path")
		.classed("hampath", true)
		.attr("stroke", "green")
		.attr("d", lineFunction(pathResult))

}

function makeArrows(pathElt, numArrows=10){
	// assign id to path if none exists
	let id = pathElt.getAttribute("id");
	if(id == null){
		id = Math.random().toString(36).replace('0.','path_');
		pathElt.setAttribute("id", id);
	}

	/* (see https://stackoverflow.com/a/6598786/1444650) */
	let textElt = document.createElementNS("http://www.w3.org/2000/svg", "text")
	pathElt.parentNode.insertBefore(textElt, pathElt);

	d3.select(textElt).classed("pathArrows", true)
		.selectAll("textPath")
		.data(Array(numArrows))
		.enter().append("svg:textPath")
			.attr("xlink:href", `#${id}`)
			.attr("startOffset", (d,k)=>`${((k+1)*100/(numArrows+1)).toFixed(1)}%`)
			.text("\u227B");
	
	return textElt;
}
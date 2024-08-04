

// UNDERSTANDING
// $moduleSpace[moduleName] = generator root
// spaces are trimmed from list values?
// {import:...} automatically added;
//   this statement just retrieves a reference to it.
// inline comments
// async functions : async fn_name() =>
// entire tree is exported, unless top-level $output is set.
// root of a tree has $imports = ["import", "names"]
// $output and $preprocess names are allowed,
//   others starting with $ will error
// top-level names must be valid JS identifiers
//   doesn't have to be the case
// setting a list prop to a string makes it a fully parsed still.
//   because str.toString() is overriden? No.
//   include this?

// {a} => a, an
// {A} => A, An

// {1-10} => random positive int within range
// {A-Z} => random uppercase within range
// {a-z} => random lowercase within range

// 10 kitten{s} => s if number is found
// no number, {s} is returned
// full stop ends search?

// {o1|o2} inline list; pick one at random
// {o1|o2^5|o3^[0.1]} probability weighting ("odds")


// what happens if a list has a property of a number, 
//   and used in a method

// __createPerchanceTree blanks empty lines for multi-line functions
//   can change what it does, potentially
// `indentOwners` --only clears up to grandchild. can add to parent of parent of parent?
// text kept for entire list --a lot of memory
//   detect if this is accessed at all, and then include src, and start/end indices for each source
// `unnecessarySquareBracketsRegex` // don't use .test() --> https://stackoverflow.com/a/21373261/11950764
//   this only happens depending on the flag like "g". That regex should be fine using .test()
// looping through many all lines many times. could loop once and do all work
// use one defineProperties instead of many defineProperty calls.
//   not sure how much better it is, but just generally simpler.
// use performance.now() (float in seconds) for more accuracy
//   instead of Date.now() (ms in integer) 

// __processEscapedCharacters
// escapableCharacters --could use a simple { "=":"=" } lookup
// or allow *any* character after \ to be a literal character 
//   instead of this only applying in some cases.

// __oddsTextToNumber
// + is not allowed
// will silently fail if malformed?



// EASY WINS --sent
//- use prototype for node special properties
//  and methods
//- use +val to turn a string into a number instead of eval
//  (false try-catch)
//- use !isNaN(str) to check if a string is of a number
//- .toString() or ""+val instead of String()
//- cache generated functions
//X Put text transform properties and manipulation methods
//  onto the String prototype instead
//- in replaceText use replaceAll instead of splitting and joining;
//  less memory use, potentially faster too
//- keep regexes/simple functions out of functions where they are called,
//  otherwise it creates a new one every time the function is called,
//  using more memory every time
//- reuse overriden selectMany (etc.) array.join function override,
//  to not create a new function every time it is processed.

// SUGGESTIONS
//- Add selectAllPossible => only those with positive odds.
//- consumableLists could overload with its own versions of methods,
//  instead of all methods needing to be aware of it and 
//  needing to check for it being consumable 
//  and being able to process differently.
//- array.selectAll could return copy, for consistencey with node.selectAll.
//- array does not have all text transforms etc.; could automate that
//- just let inline functions be multi-line functions. make no distinction.
//  fewer errors, less code to check and warn to run and maintain


// __valueOfMethod takes a `key` parameter, but doesn't use it
// textTransformNames is built in __addNodeMethods;
//   could be just set in the literal

// many number and bool properties normally give a string, but don't here.
// number singularForm = 1? or not have it at all


// many core functions are quite inefficient memory and processing-wise
// __curlyFunction_A --not used that much, so low priority
// __removeHtmlTagsFromBlocksArray --use regex on each item instead
// __chooseRandomTextByOdds --set values on details instead of making a new object
//   --use a couple of arrays, for odds and texts
//   --add up total odds in the first loop instead of going through a second time


// IDEAS
// compilation step for a generator.
// then just send down compiled JS when a user goes to a page that uses it.
// a lot less processing at runtime as the page is live.
// minimal, efficient hydration to add features to simple objects.

// use proxies/setters, but track things like totalOdds as values change
//   instead of every time anything is evaluated.




// BUGS
// .pluralForm, .singleForm broken
// .titleCase does not capitalise directly after non-space, (eg `:` or starting `-`)
	//   could look for any character preceded by \b
// .titleCase also capitalises "a", "the", "of", etc. which is unexpected in titles
// .sumItems adds strings also, which is unexpected.



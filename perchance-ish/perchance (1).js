// MY ENGINE
// make compiled line numbers match somehow? line 0 can be root
// make compiled character numbers match somehow?

var has_regex_sticky = !/1/y.test(" 1");



window.WARN = function WARN() {
	console.warn.apply(null, arguments);
}
window.ERROR = function ERROR() {
	if (arguments.length > 1) {
		console.error("Upcoming error context:", ...Array.prototype.slice.call(arguments,1));
	}
	if (arguments.length > 0) { throw new Error(arguments[0]); }
	else { throw new Error("An error occured."); }
}



var perchance = (function() {

var current_source;
	
var WARN = function(msg, indices, ...other) {
	var msg = msg ? format_message(msg, indices) : format_message("% Warning", [line_start]);
	if (warn_handler) {
		var mapped_indices = indices ? indices.map(line_char_from_index) : [];
		warn_handler(msg, mapped_indices, current_source);
	}
	window.WARN(msg, ...other);
};
var ERROR = function(msg, indices, ...other) {
	processing_transpile = false;

	if (!current_source) {
		if (msg) { msg = msg.replaceAll(/%\s*/g, ""); }
		else { msg = "Error"; }
	}
	
	msg = msg ? format_message(msg, indices) : format_message("% Error", [line_start]);
	if (error_handler) {
		var mapped_indices = indices ? indices.map(line_char_from_index) : [];
		var code_so_far = code.join("");
		error_handler(msg, mapped_indices, current_source, code_so_far);
	}
	current_source = ""; code.length = 0;
	window.ERROR(msg, ...other);
};

function format_message(msg, indices) {
	if (!msg.includes("%")) { return msg; }
	
	if (Array.isArray(indices)) {
		return msg.split("%").map(function(left, i) {
			if (i < indices.length) {
				return left + line_char_notation(current_source, indices[i]);
			}
			else { return left; }
		}).join("");
	}
	else {
		return msg;
	}
}
function line_char_from_index(index) {
	var char_n = index - find_line_start(current_source, index);
	var line_n = find_lines_before(current_source, index);
	return { line:line_n, char:char_n };
}

function line_char_notation(text, index) {
	var char_n = index - find_line_start(text, index);
	var line_n = find_lines_before(text, index);
	return `[${line_n+1}:${char_n+1}]`;
}
	
function find_line_start(text, index) {
	if (text[index] === "\n") { return index; }
	var start = text.lastIndexOf("\n", index-1);
	if (start === -1) { return 0; }
	else { return start + 1; }
}
function find_lines_before(text, index) {
	var lines = 0, f = 0, last_line = index;
	while (index > 0 && (index = text.lastIndexOf("\n", index-1)) !== -1) {
		// FAILSAFE: should never happen
		if (index === last_line) { return ERROR("Problem finding lines"); }

		lines++;
		last_line = index;
	}
	return lines;
}

var chain = 0, line_start, previous_item_line_start, f, code = [], allow_child_level;
	
var find_space_indents = /(?<=^(?:  |\t)*)  /gm;
// to normalise to tabs?
var find_malformed_indents = /  | |\t/gy;
var find_indents = /  |\t/gy;
var is_empty_string = /^\s*$/;
var is_valid_identifier = /^(?!\d)[_$a-zA-Z0-9\xA0-\uFFFF]+$/;
var find_illegal_identifier_chars = /[^_$a-zA-Z0-9\xA0-\uFFFF]/g;
var find_starting_digit = /^\d/;
	
var find_ending_inline_comment = /\/\/(.*)$/;
var find_trailing_commas = /,(?=\s*(?:[,})]|$))/g;
var find_last_newlines = /\n(?=(?:\s* \}\))*$)/g;
var find_newline_space_close = /(?<=\n) (?=}\))| +(?= }\)$)/g;

var parsed, m;
// escaped fn_arrow or assignment will be treated as regular names
var parse_line = /^(?:[ \t]*$(?:\n|$)|((?:  |\t)*|([ \t]*))(?=\S)(((async[ \t]+)?(.*?)?)[ \t]*(?:$|(?<!\\)\(([^\n\)\\]*)\)[ \t]*(=>)(.+$|(?:\n(?:\1(?:  |\t).*$|[ \t]*$))+|)|[ \t]*(?<!\\)(=)[ \t]*(.*)$))(?:\n|$))/gmy;
// line start. either:
// whitespace, end of line --ignore
	var indent, malformed_indent, line_text, name, async, fn_name; // then either:
		// end of line
		var args, arrow, fn_code; // args/code can be empty
		var assignment, value; // value can be empty

var hasOwn = Object.hasOwn;
if (!hasOwn) {
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	hasOwn = function(object, property) { return hasOwnProperty.call(object, property); };
}

var getOwnPropertyNames = Object.getOwnPropertyNames;


	
//* pre-replace "  " indents with "\t" indents?
// source.replace(find_space_indents, "\t");
// this would change code
// the problem is, without this, multiline code will only look for exactly the same indent
// on the other hand, prechance currently converts all indents anyway?
// somehow replace only non-code?

//* fn with code in() => { // first is on line with the declaration 
// curly brackets
// } last is on its own line at correct indent
// easily parsable, can avoid replacing "  "

// custom handlers passed in
var error_handler, warn_handler;

var perchance = {};
	
//! UNSAFE to recursively call
var processing_transpile = false;
perchance.to_js = function perchance_js_transpile(source, config=EMPTYOBJECT) {
	if (processing_transpile) { return ERROR("Cannot recursively call perchance.to_js()."); }
	processing_transpile = true;
	
	if ("error" in config) {
		if (typeof config.error === "function") { error_handler = config.error; }
		else {
			ERROR(`Error handler ${JSON.stringify(config.error)} is not a function.`);
			error_handler = null;
			return;
		}
	}
	if ("warn" in config) {
		if(typeof config.warn === "function") { warn_handler = config.warn; }
		else {
			return ERROR(`Warning handler ${JSON.stringify(config.warn)} is not a function.`);
			warn_handler = null;
		}
	}
	
	
	if (!has_regex_sticky) { throw "Cannot parse source; your browser does not have the regex 'sticky' feature."; }

	current_source = source; // for warnings/errors
	
	chain = 0;
	code.length = 1;
	code[0] = "P.buildList({ ";
	allow_child_level = false;

	previous_item_line_start = line_start = parse_line.lastIndex = 0;
	
	while ((parse_line.lastIndex < source.length) && (parsed = parse_line.exec(source))) {
		// FAILSAFE: should never happen
		if (parse_line.lastIndex === line_start) { break; }

		[m,
			 indent, malformed_indent, line_text, name, async, fn_name,
			 args, fn_arrow, fn_code,
			 assignment, value] = parsed;

		/*
		console.log(JSON.stringify({ m,
			 indent, malformed_indent, line_text, name, async, fn_name,
			 args, fn_arrow, fn_code,
			 assignment, value }));
		//*/
		
		// empty line
		if (!line_text) {
			// don't close open parent
			code.push("\n");
			next_line();
			continue;
		}
		
		indent_level = 0;
		if (malformed_indent) {
			// find_malformed_indents.lastIndex = line_start;
			while (find_malformed_indents.test(malformed_indent)) { indent_level++; }
			
			WARN("% Each indent should be made up of two-space groups and tabs. Malformed indent found: " +
				malformed_indent.replaceAll("  ", "(space-space)").replaceAll(" ", "(space)").replaceAll("\t", "(tab)") +
				"; indent set to "+indent_level,
				[line_start]);
		}
		else {
			find_indents.lastIndex = line_start;
			while (find_indents.test(source)) { indent_level++; }
		}

		if (indent_level > chain + 1) { // error
			return ERROR(`% Can only indent up to one level deeper. Indent found at ${indent_level - chain} levels deeper than parent item at %.`, [line_start, previous_item_line_start]);
		}
		else if (indent_level === chain + 1) { // at next indent
			//* if previous line was multi-line fn opening,
			//  give a helpful warning
			
			// start children
			if (allow_child_level) {
				code.push(", {\n" + indent); allow_child_level = false;
				chain++;
			}
			else { return ERROR("% Cannot create children for item at %.", [line_start, previous_item_line_start]); }
		}
		else { // children not being added
			if (allow_child_level) {
				//* fix it so closing happens *before* \n
				code.push(")");
			}
			
			if (indent_level === chain) { // at same indent
				// anything will be added to same parent

				if (allow_child_level) {
					code.push(",");
				}
				
				//* warn if same name as existing
			}
			else if (indent_level < chain) { // at smaller indent
				// close off chain
				close_chain(indent_level);
			}
				
			if (allow_child_level) {
				code.push("\n");
				allow_child_level = false;
			}
			code.push(indent);
		}

		if (line_text === "=") { WARN(`% Line found with only "=". Perhaps you meant to assign a property with a name and value?`, [line_start]); }
		
		if (fn_arrow) {
			if (!fn_name) {
				WARN(`% Functions must have names; function with no name found.`, [line_start]);
			}
			else if (!fn_code || is_empty_string.test(fn_code)) {
				WARN(`% Function ${JSON.stringify(fn_name)} found with no code.`, [line_start]);
			}

			// rewrite fn_code to make // comment on last line /**/ comment
			fn_code = fn_code.replace(find_ending_inline_comment, "/*$1*/");

			if (config.test_values) {
				try {
					new Function(fn_code); // tests for 
					// may not be neccessary
					// new Function("function f() { "+fn_code+" }");}
				}
				catch(e) {
					return ERROR(`% Function${
						fn_name ? " " + JSON.stringify(fn_name) : ""
					} found with invalid code. Error: ${e.message}`, [line_start]);
				}
			}

			var fn_own_name = fn_name.replace(find_illegal_identifier_chars, "_")
				.replace(find_starting_digit, "_$&");
			
			//* check fn_code has a return statement, warn if not
			code.push(`${JSON.stringify(fn_name)}: ${
				async?"async ":""}function ${fn_own_name}(${args}) {${fn_code}},\n`);
			
			allow_child_level = false;
		}
		else if (assignment) {
			var name_json = JSON.stringify(name);
			// FAILSAFE: shouldn't be possible to match without a name
			if (!name) { WARN(`% Assignment found with no name.`, [line_start]); }
			if (!value) { WARN(`% Assignment${name?" to "+name_json:""} found with no value.`, [line_start]); }

			code.push(`${name_json}: ${p_value_compile(name, value, config.test_values)},\n`);
			allow_child_level = false;
		}
		else if (name) {
			code.push(`${JSON.stringify(name)}: P.option(${p_option_compile(name, config.test_values)}`);
			allow_child_level = true;
		}

		previous_item_line_start = line_start;
		next_line();
	}

	if (parse_line.lastIndex < source.length) {
		 return ERROR("Stopped parsing at %.", [line_start]);
	}

	if (allow_child_level) { code.push(")"); }
	close_chain(0);

	var compiled_code = (code.join("") + " })")
		// hacky hacks for nicer formatting
		//* change for generating better code in the first place
		.replace(find_trailing_commas, "")
		.replace(find_last_newlines, "")
		.replace(find_newline_space_close, "");
	
	// save memory
	code.length = 0;

	processing_transpile = false;

	return compiled_code;
}
function next_line() {
	line_start = parse_line.lastIndex;
}
function close_chain(to_length) {
	if (chain > to_length) {
		while (chain > to_length) { code.push(" })"); chain--; }
		code.push(", ");
	}
}
	
// perchance.add_line_numbers = function(compiled) {
// 	var line = 1;
// 	var compiled_lines = compiled.split(/^/gm);
// 	var line_n_width = (compiled_lines.length).toString().length;
	
// 	return (compiled_lines
// 		.map((line,i,a) => (i+1).toString().padStart(line_n_width, " ")+": "+line)
// 		.join(""));
// };



	
	
perchance.value = function(item, children) {
	return new pValue(item, children);
};
var pValue = window.pValue = function pValue(item, children) {
	this.item = item; this.children = children;
}
pValue.prototype = {
	toString: function() { return this.item + ""; }
};

var p_value_compile = (function() {
	var regex_parts;
	var parse_regex_literal = /^\/(.*)\/([a-z]*)$/;
	var empty_string = "\"\"";
	var is_bigint = /^-?[1-9]\d*n$/;

	// accepts: booleans, regex, null, undefined
	// numbers, positive and negative:
	//   binary 0b101, hex 0xff, octal 0o1887,
	//   bigint 98234987n
	//* strings parsed for specials
	function p_value_compile(name, value, test_values) {
		switch(value) {
			case "":
				return empty_string;
			case "true": case "false":
			case "null": case "undefined":
				return value;
		}
		
		if (!isNaN(value) || (value[0]==="-" && !isNaN(value.substr(1)))
			|| is_bigint.test(value)
		) {
			return value;
		}
		else if (regex_parts = value.match(parse_regex_literal)) {
			if (test_values) {
				var regex;
				try { regex = new RegExp(regex_parts[1], regex_parts[2]); }
				catch(e) { return ERROR(`% Assigned property is an invalid literal regex: ${e.message}`, [line_start]); }
				regex_parts = null;
				return regex.toString();
			}
		}
		else { // assume it's a string
			//* parse for specials
			return "P.value("+JSON.stringify(value)+")";
		}
	}

	return p_value_compile;
})();
		
perchance.option = function(item, children) {
	return new pOption(item, children);
};
var pOption = window.pOption = function pOption(item, children) {
	this.item = item; this.children = children;
}
pOption.prototype = {
	toString: function() { return this.item + ""; }
};
function p_option_compile(value, test_values) {
	// name is the same as the value
	// NOTE: compiler has P.option( before this
	
	//* parse for specials etc.
	
	
	// always assume to be a string
	return JSON.stringify(value);
}

var compile_string = (function() {
	//  text only
	// "text only"
	
	//   text  [code] text
	//=>`text ${code} text`
	
	//   text  {option1|option2} text
	//=> var list1 = P.option("", {
	//=>   "option1": P.option(...),
	//=>   "option2": P.option(...)
	//=> });
	//=> text ${list1} text
	
	//* generate list names so it doesn't clash with 
	//  anything [code] wants to access.

	// skips escaped openings
	// skips openings that definitely don't have unescaped closings
	var find_special = /(?<!\\)(?:\[(?=[\W\w]*(?<!\\)\])|\{(?=[\W\w]*(?<!\\)\})|\|)/g;

	//* check for backreference support
	
	var m;
	var find_unescaped_square_or_string = /(["'`])[\W\w]*?(?<!\\)(?:(\1)|$)|(?<!\\)(?:(\[)|(\]))/g;
	var string_opening, string_closing, square_opening, square_with_valid_close, square_closing;

	var find_unescaped_special = /(?<!\\)(?:(\[)(?=[\W\w]*?(?:(?<!\\)(\])|$))|(\])|(\{)(?=[\W\w]*?(?<!\\)(\||$)[\W\w]*?(?:(?<!\\)(\})|$))|(\})|(\|))/g;
	var /*square_opening, square_with_valid_close, square_closing,*/ curly_opening, curly_with_or, curly_with_valid_close, curly_closing, or_char;
	//* seems to pick up \{1|2}
	
	var parsed_index, code, return_code = [], code_chain = [return_code], inline_code, special;
	var found, found_square_end, found_options_end;
	var current_source;

	//* sort the lists out to not need { toString } all over the place
	// var option_start = "{ toString: function(){ return \`";
	// var option_end = "\`; } }";

	
	//! UNSAFE to recursively call this function
	var compile_processing = false;
	function compile_string(source, test_values) {
		if (source === "") { return "\"\""; }
		
		// FAILSAFE should not happen
		if (compile_processing) { return ERROR(`Cannot recursively call compile_string().`); }
		compile_processing = true;
		
		current_source = source;
		parsed_index = 0;
		code_chain.length = 1; code = return_code; return_code.length = 0;
		code.has_text = false; code.has_option = false; code.has_list = false;
		
		var list_code = [];
		
		special = false;
		var f = 0;
		while (true) {
			if (++f > 1000) { throw "LOOP STUCK?"; }

			find_unescaped_special.lastIndex = parsed_index;
			found = find_unescaped_special.exec(source);
			if (!found) { break; }
			
			add_text_up_to(found.index);

			[m,
			 square_opening, square_with_valid_close, square_closing,
			 curly_opening, curly_with_or, curly_with_valid_close, curly_closing, or_char] = found;
			//* don't need to match ]
			
			if (square_opening) {
				if (!square_with_valid_close) { return ERROR(`% Square code block found with no unescaped ] to end it.`, [line_start], { source }) }
				
				special = true;
				
				// compile code block
				code.push("${"); parsed_index++;
				
				code.has_code = true; //* unnecessary?

				//* warn if no code

				var chain = 0;
				find_unescaped_square_or_string.lastIndex = parsed_index;
				found = null; found_square_end = false;
				while (found = find_unescaped_square_or_string.exec(source)) {
					[m, string_opening, string_closing, square_opening, square_closing] = found;
					if (string_opening) {
						if (string_closing) {} // ignore
						if (!string_closing) {
							return ERROR(`% Could not find end of string in code block`, [line_start], { source });
						}
					}
					else if (square_opening) { chain++; }
					else if (square_closing) {
						if (chain > 0) { chain--; }
						// close code block
						else {
							found_square_end = true;
							inline_code = add_code_up_to(find_unescaped_square_or_string.lastIndex - 1);
							code.push("}"); parsed_index++;
							break;
						}
					}
				}
				
				if (found_square_end) {
					if (test_values) {
						try { new Function("`${"+inline_code+"}`"); }
						catch(e) { return ERROR(`% Inline code could not compile: [${inline_code}]. ${e.message}`, [line_start], { source }); }
					}
				}
				else { return ERROR("% Square code block found with no unescaped ] to end it.", [line_start], { source }); }
			}
			else if (curly_opening) {
				if (!curly_with_or) { return ERROR(`% Curly options block found with no unescaped |; only one option when more than one option is required.`, [line_start], { source }); }
				if (!curly_with_valid_close) { return ERROR(`% Curly options block found with no unescaped } to end it.`, [line_start], { source }); }
				special = true;

				// start new nested options
				var list_name = new_list_name();
				//* add when handling option close
				code.push(`\${${list_name}}`); // add to return
				code.has_option = true;

				open_layer(); // options
				
				code.push(`var ${list_name} = P.inline_option(`);
				
				parsed_index++;
			}
			else if (or_char) {
				if (code_chain.length > 1) {
					//* handle previous option,
					
					//* start new option
					code.push(option_end + ", " + option_start);
					parsed_index++;
				}
				// not within curly, so just text
				else {
					add_text_up_to(find_unescaped_special.lastIndex);
				}
			}
			else if (curly_closing) {
				if (code_chain.length > 1) {
					code.push(option_end);

					//* make sure there is at least 2 options
					//  error otherwise
					//* warn instead of erroring for single-options?
					//* match for {non-options} first

					var lower = close_layer().join("");
					list_code.push(lower);
					
					parsed_index++;
				}
				// options aren't open; treat as text
				else {
					add_text_up_to(find_unescaped_special.lastIndex);
				}
			}
			else if (square_closing) {
				//* unneeded; remove match in regex
				add_text_up_to(find_unescaped_special.lastIndex);
			}
			else { // should not be possible
				throw "PROBLEM PARSING SPECIALS IN STRING";
			}
		}

		compile_processing = false;

		if (special) {
			add_text_up_to(source.length);

//* allow {|} to span multiple lines?
//* allow [] to span multiple lines?

			var compiled_code;
			if (list_code.length > 0) {
				list_code.reverse(); // put them in list# order
				compiled_code = "(function(){ " +
					list_code.join("; ") + "; " +
					"return { toString: function(){ return `" + code.join("") + "`; } "+
				"})()";
			}
			else {
				compiled_code = "{ toString: function() { return `" +
					code.join("") +
				"`; } }";
			}
			
			code.length = 0; list_code.length = 0; found = null; inline_code = "";
			return compiled_code;
		}
		else { // just a string
			return JSON.stringify(source);
		}
	}
	function add_text_up_to(index) {
		var added = add_up_to(index, true);
		if (added) { code.has_text = true; }
		return added;
	}
	function add_code_up_to(index) {
		var added = add_up_to(index, false);
		if (added) { code.has_code = true; }
		return added;
	}
	function add_up_to(index, escape) {
		var to_add = current_source.substring(parsed_index, index);
		if (escape) {
			// escape string-template specials
			to_add = to_add.replaceAll("`", "\\$&").replaceAll("${", "\\$&");
		}
		code.push(to_add);
		parsed_index = index;
		return to_add;
	}

	function open_layer() {
		code = [];
		code_chain.push(code);
		return code;
	}
	function close_layer() {
		var closed = code_chain.pop();
		code = code_chain[code_chain.length-1];
		return closed;
	}

	var list_name_base = "list", count = 0;
	function new_list_name() {
		while (current_source.includes(name = list_name_base + count)) {
			count++;
		}
		count++;
		return name;
	}

	function reset_option() {
		option.has_list = false; option.has_code = false;
	}


	//*/ TESTS
	document.body.innerText = 
		compile_string("text [code, 'with', 'end'] text", true) + "\n\n" +
		compile_string("text [code['with'], 'square'['brackets'['inside']],\n 'and inside\\\n\\' [ string'] text") + "\n\n" +
		compile_string("") + "\n\n" +
		compile_string("text {option1|option2} kdjfh } | text") + "\n\n" +
		compile_string("text [if(1){'blah'}] {opt[code]ion1  {nes[code]ted1|nested2} \{1|2} |option2}") +
		"";

	// compile_string("text \\[non-code] [\"]code with no end", true) // error: no string close
	// compile_string("text \\[non-code] [\']code with no end", true) // error: no string close
	
	//* check for ${} within `string`?
	// compile_string("text \\[non-code] [\`]code with no end", true) // error: no string close
	// compile_string("text \\[non-code] [code with no end", true) // error: no ]
	// compile_string("text {option}"); // error: no |
	// compile_string("text {option\\|}"); // error: no unescaped |
	// compile_string("text {option"); // no |
	// compile_string("text {option|"); // no }
	// compile_string("text {option|\\}"); // no unescaped }
	//*/
	
	return compile_string;
})();


var EMPTYARRAY = Object.freeze([]);
var EMPTYFUNCTION = Object.freeze(function() {});
var EMPTYOBJECT = Object.freeze({});
	
perchance.buildList = (function() {
	function buildList(object) {
		var all_keys = getOwnPropertyNames(object);
		
		// potentially using memory for empty arrays that aren't used,
		// but highly unlikely
		var option_keys = [], fn_keys = [], prop_keys = [];
		// easy access for handling deletion
		var handle = { option_keys, fn_keys, prop_keys };

		// for logging
		all_keys.name = "all keys";
		option_keys.name = "option keys";
		prop_keys.name = "property keys";
		fn_keys.name = "function keys";
		
		for (var key of all_keys) {
			var val = object[key];
			if (val instanceof pOption) { option_keys.push(key); }
			else if (typeof val === "function") { fn_keys.push(key); }
			// any other value is a property
			else { prop_keys.push(key); }
		}


		// stack prototypes
		//- take prototype of original object
		var cache = Object.create(Object.getPrototypeOf(object), {
			$allKeys: { value:immutable_array(all_keys) },
			$children: { value:immutable_array(option_keys) },
			$functionChildren: { value:immutable_array(fn_keys) },
			$valueChildren: { value:immutable_array(prop_keys) }
		});
		//- layer original object on top
		Object.setPrototypeOf(object, cache);
		// object -> cache -> original prototype

		// just to handle setting new properties
		var proxy = new Proxy(object, {
			set(target, prop, value, receiver) {
				if (hasOwn(target, prop)) {
					remove_non_prop_key(prop, target[prop], handle);
				}
				else { all_keys.push(prop); prop_keys.push(prop); }
				
				if (typeof value === "string") {
					//* check if special first
					// can only be a property with a value;
					// build new pValue and set that instead
					value = new Function("P", "return "+p_value_compile(prop, value, true)+";")(perchance);
				}
				
				return Reflect.set(target, prop, value, receiver);
			},
			
			//* handle delete?
			deleteProperty(target, prop) {
				console.log("deleting ",prop);
				//* remove key from all_keys
				if (hasOwn(target, prop)) {
					remove_type_key(prop, target[prop], handle);
					remove_value_from_array(all_keys, prop);
				}
				
				return Reflect.deleteProperty(target, prop);
			}
		});
		
		return proxy;
	};

	function remove_type_key(key, value, handle) {
		var keys_prop, keys;
		if (value instanceof pOption) { keys_prop = "option_keys"; }
		if (typeof value === "function") { keys_prop = "fn_keys"; }
		// otherwise, it's a property
		else { keys_prop = "prop_keys"; }
		
		if (keys_prop) {
			remove_value_from_array(handle[keys_prop], key);
		}
	}
	function remove_non_prop_key(key, value, handle) {
		if (value instanceof pOption || typeof value === "function") {
			remove_type_key(key, value, handle);
		}
	}
	
	function remove_value_from_array(array, value) {
		var index = array.indexOf(value);
		// FAILSAFE should not happen
		if (index === -1) { WARN(`Could not find ${JSON.stringify(value)} value in ${array.name?array.name+" ":""}array when trying to delete it.`); }
		// remove from keys
		else { array.splice(index,1); }
	}

	var immutable_array = (function() {
		function block() { return false; }
		//* check if there are any other ways to change the values
		//  not blocked here.
		var handler = {
			set: block, delete: block,
			get: function(target, prop, receiver) {
				if (hasOwn(target, prop)) { return Reflect.set(target, prop, receiver); }
				else { return undefined; }
			}
		};
		
		return function immutable_array(array) {
			return new Proxy(array, handler);
		}
	})();
	
	return buildList;
})();

return perchance;
})();


perchance.build_js = function(compiled) {
	// outside of hidden perchance scope,
	// so that eval cannot pick any of it up.
	// eval so that line numbers stay intact.
	return eval(`(function build(P) { return ${compiled} })`)(perchance);
};
perchance.to_built_js = function(source, config) {
	return perchance.to_built_js(perchance.to_js(source, config));
};


// running node with no values gives node name
// props are not values
// running node with values gives random value,
//   weighted
// [code] ... becomes ()=> code; ?
// prop() => code ... becomes a function property with *only one line*
// prop() =>
//   code  ... becomes a function property with *many lines*
// a [code] = 2 ... becomes a simple value
// a {o1|o2} = 2 ... becomes a simple value


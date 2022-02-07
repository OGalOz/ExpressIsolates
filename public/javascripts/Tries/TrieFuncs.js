


function updateDataList(data_el, options_list) {
    // This takes the datalist element, clears it and adds options to list
    data_el.innerHTML = ""
    for (let ix in options_list) {
        data_el.appendChild(options_list[ix])
    }
}


function create_Option_list(word_list) {
    // This function creates the option DOM elements
    //
    let option_list = []
    for (i=0;i<word_list.length;i++) {
        let opt = document.createElement("option")
        opt.value = word_list[i]
        option_list.push(opt)
    }

    return option_list
}


function get_all_words_start_with(root_T, prefix, taxon_type, max_num=10) {
    // taxon_type is one of "Domain", "Phylum", ... "Species"
    let prefix_node = get_tree_rooted_at(root_T, prefix)
    if (prefix_node == null) {
        return []
    } else {
        let word_list = get_all_words(prefix_node, prefix)
        let uppered_list = get_uppered_list(word_list, taxon_type, max_num)
        return uppered_list 
    }
}

function get_uppered_list(word_list, taxon_type, max_num) {
    // variable lc2or imported from javascript file 'lowercase_to_original.js'
    let n = Math.min(word_list.length, max_num)
    let taxon_d = lc2or[taxon_type];
    let wl = [];
    for (i=0; i < n; i++) {
        wl.push(taxon_d[word_list[i]][0])
    }
    return wl
}

function first2orig(word) {
    // This banks on the existence of a variable 'lc2or'
    return lc2or[word]
}


function get_all_words(T, word) {
    // T is an object with keys 'w', 'c'
    let words = []

    if (T["w"]) {
        words.push(word)
    }

    for (let [key, value] of Object.entries(T["c"])) {
        words = words.concat(get_all_words(value, word + key))
    }

    return words
}

function get_tree_rooted_at(T, prefix) {
    if (prefix.length == 0) {
        return T
    } else {
        next_char = prefix[0]
        if (next_char in T["c"]) {
            prefix = prefix.slice(1,)
            return get_tree_rooted_at(T["c"][next_char], prefix)
        } 
    }
    return null
}







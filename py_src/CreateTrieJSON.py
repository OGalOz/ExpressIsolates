'''
This file creates a Trie JSON object
given a list of words. All letters are automatically
converted into lower case.
The idea is to store it in as small a way as possible.
'''

import sys, os, logging, json
from typing import List, Dict
#from OGUtil import OGUtil 






def initialize_Trie():
    '''
    "c": -> children (dictionary)
    "w": -> bool if it ends a word
    '''
    T = {
            "c": {},
            "w": False
    }
    return T



def create_lc_to_all_dicts(input_dict):
    # input_dict has keys Domain, Phylum, etc.
    lc2all_each = {}
    for k in input_dict:
        print("working on key: " + k)
        lc2all_each[k] = lc_words_to_all_versions(input_dict[k])
    return lc2all_each



def lc_words_to_all_versions(word_list):
    lc2all = {}
    for W in word_list:
        w = W.lower()
        if w in lc2all:
            lc2all[w].append(W)
        else:
            lc2all[w] = [W]
    return lc2all





def add_word_to_Trie(T, word):
    if len(word) == 0:
        T["w"] = True
    else:
        # word is longer than 0
        first_char = word[0]
        if first_char in T["c"]:
            add_word_to_Trie(T["c"][first_char], word[1:])
        else:
            subT = initialize_Trie()
            T["c"][first_char] = subT
            add_word_to_Trie(T["c"][first_char], word[1:])


def check_if_word_in_Trie(T, word):
    if len(word) == 0:
        return T["w"]
    else:
        first_char = word[0]
        if first_char in T["c"]:
            return check_if_word_in_Trie(T["c"][first_char], word[1:])
        else:
            return False



def get_all_words_in_Trie(T, crt: str) -> List[str]:
    word_list: List[str] = []
    if T["w"]:
        word_list.append(crt)
    for c in T["c"]:
        word_list += get_all_words_in_Trie(T["c"][c], crt + c)
    return word_list

def get_prefix_Trie(T, prefix):
    if len(prefix) == 0:
        return T
    if prefix[0] in T["c"]:
        return get_prefix_Trie(T["c"][prefix[0]], prefix[1:])
    else:
        return None


def get_all_words_that_start_with(T, prefix: str) -> List[str]:
    pT: Dict = get_prefix_Trie(T, prefix)
    if pT is not None:
        word_list = get_all_words_in_Trie(pT, prefix)
        return word_list
    else:
        return []


def export_Trie(T, op_fp: str) -> None:
    with open(op_fp, "w") as g:
        g.write(json.dumps(T))

# Given JSON file with list of words to make Trie, do
def JSON_word_list_to_JSON_Trie(inp_json_fp: str, op_json_fp) -> None:
    with open(inp_json_fp, "r") as f:
        word_list: List[str] = json.loads(inp_json_fp)
    T: Dict = add_list_of_words_to_new_trie(word_list)
    with open(op_json_fp, "r") as g:
        g.write(json.dumps(T))


def add_list_of_words_to_new_trie(L: List[str]) -> bool:
    # L is list of words to add 
    T: Dict = initialize_Trie()
    for w in L:
        add_word_to_Trie(T, w)
    return T

def quick_test():
    L: List[str] = ["apple", "app", "banana", "Appalachia", "band", "bandana", 
                    "bag"]
    T: Dict = add_list_of_words_to_new_trie(L)

    print(get_all_words_that_start_with(T, "ban"))
    print(get_all_words_that_start_with(T, "ba"))
    print(get_all_words_that_start_with(T, "bag"))


def quick_lowercase_to_all_options(inp_json, op_fp):
    with open(inp_json, 'r') as f:
        x = json.loads(f.read())
    res = create_lc_to_all_dicts(x)
    with open(op_fp, 'w') as g:
        g.write(json.dumps(res))
        print("wrote to " + op_fp)


def import_export_test(inp_fp, op_fp):
    JSON_word_list_to_JSON_Trie(inp_fp, op_fp)

def main():
    _, inp_fp, op_fp = sys.argv
    quick_lowercase_to_all_options(inp_fp, op_fp)


if __name__ == "__main__":
    main()




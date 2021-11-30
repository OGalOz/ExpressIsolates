'''
In this script we collapse a matrix table into an adjacency list.
The config has to have the name for the columns of the tsv,
and the name of the column which represents each row.
For example: 
    ,WellA, WellB, WellC, WellD
    org1, 1, 2, 3, 4
    org2, 2, 5, 3, 1
would turn into:
    Well, org, value
    WellA, org1, 1
    WellA, org2, 2
    WellB, org1, 2
    WellB, org2, 5,
    etc
So the config would look like:

    "cols_nm": "Well",
    "rows_nm": "org",
    "vals_nm": "value",
    "rm_vals": list<str>: list of columns to ignore
    "other_nms": list of other columns to add 
    

'''

import os, sys, json
import pandas as pd
import copy

def collapse_tsv_to_adj_list(inp_TSV_fp, cfg_json_fp, op_tsv_fp):


    if os.path.exists(op_tsv_fp):
        x = input(f"Output path exists already at {op_tsv_fp}. Overwrite? y/n\n")
        if x not in ["y", "n"]:
            raise Exception("Must choose y or n as response to overwrite op tsv.")
        elif x == "n":
            sys.exit(0)
        else:
            print("Will overwrite file.")


    with open(cfg_json_fp, 'r') as f:
        inp_cfg = json.loads(f.read())

    for x in ["cols_nm", "rows_nm", "vals_nm", "other_nms", "rm_vals"]:
        if x not in inp_cfg:
            raise Exception("Config missing " + x)


    output_tsv_to_tsv(inp_TSV_fp, inp_cfg, op_tsv_fp)



def output_tsv_to_tsv(inp_TSV_fp, inp_cfg, op_tsv_fp):
    '''
    '''

    inp_FH = open(inp_TSV_fp, 'r')
    headers = inp_FH.readline().rstrip().split("\t")
    headers_d = {headers[i]:i for i in range(len(headers))}

    ic = inp_cfg
    OP_FH = open(op_tsv_fp, 'w')
    all_op_cols = [ic['cols_nm'], ic['rows_nm'], ic['vals_nm']]
    for x in ic["other_nms"]:
        if x not in headers:
            raise Exception("All other nms must be a column name in original TSV file." + \
                            f" '{x}' isn't.")
        all_op_cols.append(x)
   
    write_cols = copy.deepcopy(headers)
    for c in all_op_cols:
        if c in write_cols:
            write_cols.remove(c)
    for c in ic["rm_vals"]:
        if c in write_cols:
            write_cols.remove(c)

    OP_FH.write("\t".join(all_op_cols) + "\n")
    row_num = 1
    c_line = inp_FH.readline().rstrip()
    while c_line != "":
        c_list = c_line.split('\t')
        for col_nm in write_cols:
            row_str = col_nm + "\t" + c_list[headers_d[all_op_cols[1]]] + "\t"
            row_str += c_list[headers_d[col_nm]] + "\t"
            for opc in all_op_cols[3:]:
                row_str += c_list[headers_d[opc]] + "\t"
            row_str = row_str.rstrip()
            OP_FH.write(row_str + "\n")
            row_num += 1
            if row_num % 1000000 == 0:
                print(f"Printed row number {row_num}.")
        c_line = inp_FH.readline().rstrip()
    '''
    DF version:
    for ix, row in inp_df.iterrows():
        for c in cols:
            row_str = c + "\t" + row[all_op_cols[1]] + "\t"
            row_str += str(row[c]) + "\t"
            for opc in all_op_cols[3:]:
                row_str += str(row[opc]) + "\t"
            # removing final \t
            row_str = row_str.rstrip()
            OP_FH.write(row_str + "\n")
            row_num += 1
            if row_num % 50000 == 0:
                print(f"Printed row number {row_num}/{total_row_num}.")
    '''

    inp_FH.close()
    OP_FH.close()
    print("Finished writing output file to " + op_tsv_fp)

    return None



def main():

    args = sys.argv

    help_str = "Args must end in '1'. input file comes before that.\n" + \
                "python3 collape_tsv_to_adj.py inp_tsv config_json op_tsv_fp 1\n"


    if args[-1] != "1":
        print(help_str)
    else:
        inp_TSV_fp = args[1]
        cfg_json_fp = args[2]
        op_tsv_fp = args[3]
        collapse_tsv_to_adj_list(inp_TSV_fp, cfg_json_fp, op_tsv_fp)





if __name__ == "__main__":
    main()

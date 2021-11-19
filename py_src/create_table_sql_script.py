'''
Within this file the intention
is to create an SQL script which creates
a table from a tsv file.
We will first create this function specifically
for the TSV file that represents samples and OTUs.

As inputs to the file, use
input TSV file, config JSON, and output SQL file path.
Make sure the output SQL file path isn't at a location
where a file already exists.
'''



import sys, os
import pandas as pd
import json
import logging

def prepare_create_table_sql_script(inp_TSV_fp, cfg_json_fp, op_sql_fp):
    '''
    Args:
        inp_TSV_fp: Path to TSV file to add as table to mysql db
        cfg_json_fp: Path to JSON file which contains config info
        op_sql_fp: Path to write sql file
    '''
   
    inp_df, inp_cfg = check_inputs(inp_TSV_fp, cfg_json_fp, op_sql_fp)

    # Each line will be placed as a string on this list
    sql_op_lines = create_sql_lines_in_list(inp_df, inp_cfg)


def create_sql_lines_in_list(inp_df, inp_cfg):


    create_table_lines = add_create_table_statements(inp_df, inp_cfg)

    # TO OUTPUT CREATE TABLE STATEMENT
    with open("tmp/create_table.sql", 'w') as g:
        g.write("\n".join(create_table_lines))
        print("WROTE TO tmp/cre...")

    insert_to_table_lines = create_insert_row_statements(inp_df,inp_cfg)


    # TO OUTPUT INSERT INTO TABLE STATEMENT
    with open("tmp/insert_into_table.sql", 'w') as g:
        g.write("\n".join(insert_to_table_lines))
        print("WROTE TO tmp/insert...")


    sql_op_lines = []

    return sql_op_lines


def create_insert_row_statements(inp_df, inp_cfg):
    '''

    INSERT INTO tbl_nm (
        col1_nm,
        col2_nm,
        col3_nm,
        col4_nm
    )
    VALUES(col_1 val, col_2 val, col_3_val, etc.);

    '''
    spacer = "    "
    insert_into_tbl = [f"INSERT INTO {inp_cfg['tbl_nm']} ("]
    ordered_columns = []
    for col_nm in inp_df.columns:
        insert_into_tbl.append(spacer + '`' + col_nm + '`,')
        ordered_columns.append(col_nm)
    insert_into_tbl[-1] = insert_into_tbl[-1][:-1]
    insert_into_tbl.append(")")

    # max_rows = float('inf')
    crt_row = 1
    values = ['VALUES']
    for index, row in inp_df.iterrows():
        value_str = spacer + "("
        for col_nm in ordered_columns:
            addition = ''
            if col_nm in inp_cfg['col_nm2type_and_default']:
                if inp_cfg['col_nm2type_and_default'][col_nm]["base_type"] == "str":
                    addition = '"'
            value_str += f'{addition}{row[col_nm]}{addition}, '
        # Removing the comma and space
        value_str = value_str[:-2]
        value_str += "),"
        values.append(value_str)
        crt_row += 1
        if crt_row % 2000 == 0:
            print("Reached row #" + str(crt_row))
    values[-1] = values[-1][:-1] + ";"

    return insert_into_tbl + values


        




def add_create_table_statements(inp_df, inp_cfg):
    """
    inp_cfg (d):
        tbl_nm (str): The name of the table.
        col_nm2type_and_default (dict): col_nm -> {"type": str, 
                                                "default": str,
                                                "base_type": str}
        other_col_type (str): The type of the columns that aren't in 
                              col_nm2type e.g. 'varchar(256) or DECIMAL(25,20)'
        col_default (str): 'DEFAULT NULL' or 'NOT NULL'
        primary_key_name (str): Name of the column which holds the primary keys


    Example:
    CREATE TABLE `tbl_name` (
        `col_nm1` {type, e.g. int(11)} NOT NULL,
        `col_nm2` {type e.g. varchar(50) NOT NULL,
        `col_nm3` {type e,g, char(2) DEFAULT NULL,
        PRIMARY KEY (`col_nmX`) - where X is the key you want to be primary.
        ) ENGINE=InnoDB DEFAULT CHARSET=? COLLATE=?;
    """
    
    crt_lns = [f"CREATE TABLE `{inp_cfg['tbl_nm']}` ("]
    spacer = "    "
    for col_nm in inp_df.columns:
        if col_nm in inp_cfg["col_nm2type_and_default"]:
            res = inp_cfg["col_nm2type_and_default"][col_nm]
            add_col_str = f"`{col_nm}` {res['type']} {res['default']}"
        else:
            add_col_str = f"`{col_nm}` {inp_cfg['other_col_type']} {inp_cfg['col_default']}"
        crt_lns.append(spacer + add_col_str + ",")

    # primary key
    crt_lns.append(spacer + f"PRIMARY KEY ({inp_cfg['primary_key_name']})")

    # engine
    crt_lns.append(spacer + f") ENGINE=InnoDB;")

    return crt_lns



    



def check_inputs(inp_TSV_fp, cfg_json_fp, op_sql_fp):

    if os.path.exists(op_sql_fp):
        raise Exception(f"Output file already exists at {op_sql_fp}.")

    inp_df = pd.read_table(inp_TSV_fp)
    with open(cfg_json_fp, 'r') as f:
        inp_cfg = json.loads(f.read())

    return inp_df, inp_cfg

    



def main():

    args = sys.argv

    help_str = "Args must end in '1'. input file comes before that.\n" + \
                "python3 create_table_sql_script.py inp_tsv config_json op_sql_fp 1\n"
    if args[-1] != "1":
        print(help_str)
    else:
        inp_TSV_fp = args[1]
        cfg_json_fp = args[2]
        op_sql_fp = args[3]
        prepare_create_table_sql_script(inp_TSV_fp, cfg_json_fp, op_sql_fp)
        #splitFASTQ(inp_FQ)





if __name__ == "__main__":
    main()


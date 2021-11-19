#!python3

import os
import sys
import logging
import json
import shutil


def create_grid_dir(inp_tsv_fp, op_dir):
    """
    Desc:
        Path to html file is "html_templates/table_index.html"
        Within that file, the path to the javascript file which
        holds the data is 'table_data.js'
    """
    if os.path.exists(op_dir):
        raise Exception(f"Output directory already exists at op_dir")

    if "app.js" not in os.listdir() and "package.json" not in os.listdir():
        raise Exception("You aren't operating from the central directory of the app.")

    os.mkdir(op_dir)
    op_fp = os.path.join(op_dir, "table_data.js")
    shutil.copy("html_templates/table_index.html", op_dir + "/table_index.html")
    create_grid_file(inp_tsv_fp, op_fp)

    os.system(f"open {op_dir}/table_index.html")




def create_grid_file(inp_tsv_fp, op_fp):
    """
    Args: 
        inp_tsv_fp (str): Filepath to tsv file
        op_fp (str): Filepath to write output JS file
    """
    logging.basicConfig(level=logging.DEBUG)
    headers, list_of_rows = parse_tsv(inp_tsv_fp)
    headers_JS_str = create_headers_JS_string(headers)
    rowData_JS_str = create_rowData_JS_string(list_of_rows)
    end_of_JS_str = create_end_of_JS_file()

    with open(op_fp, 'w' ) as g:
        g.write(headers_JS_str + '\n')
        g.write(rowData_JS_str + '\n')
        g.write(end_of_JS_str + '\n')
    
    logging.info("Wrote JS table file to loc " + op_fp)



def create_headers_JS_string(headers, 
                             sortable=True, 
                             filterable=True ):

    op_str = "const columnDefs = [\n"
    for header_str in headers:
      op_str += '   { field: ' + f'"{header_str}"'
      if sortable:
          op_str += f', sortable: true'
      if filterable:
        op_str += ', filter: true'
      op_str += ' },\n'
    op_str += "];\n"

    return op_str


def create_rowData_JS_string(list_of_rows):
    """
    Args:
        list_of_rows list<row_d>: List of each row in tsv file
                                besides the header row. 
                                Each row is represented as a
                                dictionary pointing the 
                                column name to its value.
    """


    op_str = "const rowData = [\n"
    num_keys = len(list(list_of_rows[0].keys()))
    for row_d in list_of_rows:
        op_str += '   { '
        num_writ = 0
        for k, v in row_d.items():
            if num_writ > 0:
              op_str += ', '
            if not isfloat(v): 
                op_str += f'{k}: "{v}"'
            else:
                # it is a float 
                op_str += f'{k}: {v}'
            num_writ += 1
        op_str += " },\n"

    op_str += "];\n"

    return op_str

def create_end_of_JS_file():
    eof_str = """// let the grid know which columns and what data to use
const gridOptions = {
  columnDefs: columnDefs,
  rowData: rowData
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);
});"""
    return eof_str

def isfloat(value):
  try:
    float(value)
    return True
  except ValueError:
    return False

def parse_tsv(inp_tsv_fp):
    """
    Args: 
        inp_tsv_fp (str): Filepath to tsv file
    Returns:
        headers list<str>: List of all headers in tsv file
        list_of_rows list<row_d>: List of each row in tsv file
                                besides the header row. 
                                Each row is represented as a
                                dictionary pointing the 
                                column name to its value.
    """

    tsv_fh = open(inp_tsv_fp, "r")

    headers = tsv_fh.readline().rstrip('\n').split('\t')
    headers = [x.replace(' ', '_') for x in headers]
    num_headers = len(headers)
    list_of_rows = []

    c_line = tsv_fh.readline()
    line_num = 1
    while c_line != "":
        c_line = c_line.rstrip('\n')
        split_line = c_line.split('\t')
        if len(split_line) != num_headers:
            raise Exception("Incorrect number of tab-separated values"
                            f" at line {line_num}. Num headers: " 
                            f" {num_headers}. Num values: {len(split_line)}")
        row_d = {}
        for i in range(num_headers):
            row_d[headers[i]] = split_line[i]
        list_of_rows.append(row_d)
        line_num += 1
        c_line = tsv_fh.readline()


    tsv_fh.close()

    return headers, list_of_rows




def test():

    return None


def main():
    
    args = sys.argv
    if args[-1] not in ["1", "2"]:
        print("Incorrect args. Use the following:\n")
        help_str = "python3 FileName.py tsv_fp op_fp 1\n"
        help_str += "or\n"
        help_str += "python3 FileName.py tsv_fp op_dir 2\n"
        print(help_str)
    elif args[-1] == "1":
        tsv_fp = args[1]
        op_fp = args[2]
        create_grid_file(tsv_fp, op_fp)
    elif args[-1] == "2":
        tsv_fp = args[1]
        op_dir = args[2]
        create_grid_dir(tsv_fp, op_dir)
    else:
        raise Exception("Incorrect argument usage (?)")

    #test()

    return None

if __name__ == "__main__":
    main()

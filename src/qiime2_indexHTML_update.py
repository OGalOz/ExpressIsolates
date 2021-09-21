# Within this file we update the output index HTML of qiime2
# The name of the directory says a lot about what the output file
# will look like.
# Run this python file from the central directory of the isolates web app,
# with the qzv file in a specific loc (where?)
# The HTML_NOW directory will be created by qiime2 in the current directory
# and then we take its pieces apart.

import os
import sys
import logging
import json
import shutil



def complete_preparation_for_isolates_website(qzv_fp):
    """

    Description:
        Take the .qzv file, create the HTML directory using
        qiime tools, take out the data from it and place it
        in the data's unique directory within the website's public
        HTML directory:
            
            public/data/QZVs/{data_set_name}
            e.g
            public/data/QZVs/{data_set_name}/level-x.jsonp

        then we replace the incorrect strings in the index.html 
        file and place that file in the dir public/data/QZVs/{data_set_name}.
        Optional: Delete old HTML directory
    """
    check_this_is_correct_directory()
    if ".qzv" != os.path.basename(qzv_fp)[-4:]:
        raise Exception("Input file to this script must end with '.qzv'")
    data_name = get_data_name(qzv_fp)
    HTML_dir = call_qiime_tools(qzv_fp, data_name)
    prepare_index_HTML_file_for_ExpressJS(HTML_dir)
    op_dir = move_files_to_correct_location(HTML_dir, data_name)
    logging.info("Moved files to " + op_dir)
    sys.exit(0)



def check_this_is_correct_directory():
    c_dir_files = os.listdir(".")
    if "app.js" not in c_dir_files:
        raise Exception("This is not the central directory in the isolates webapp.")
    if "public" not in c_dir_files:
        raise Exception("This is not the central directory in the isolates webapp.")

def move_files_to_correct_location(HTML_dir, data_name):
    """
    Description:
        The files we need to move are the JSONP file, 
        and the new_index.html file (what about CSV?)

    Returns:
        crt_data_dir (str): Path to data dir in which all files related
                            to this specific visualization reside.
    """
    all_data_dir = "public/data/QZVs"
    if data_name in os.listdir(all_data_dir):
        raise Exception(f"Directory with name {data_name} already in data dir {all_data_dir}")
    crt_data_dir = os.path.join(all_data_dir, data_name)
    os.mkdir(crt_data_dir)
    html_fs = os.listdir(HTML_dir)
    logging.debug("Files in Qiime2 Html directory pre move: ")
    logging.debug(html_fs)

    for f in html_fs:
        if f[-6:] == ".jsonp":
            shutil.copy(os.path.join(HTML_dir, f), os.path.join(crt_data_dir, f))
        elif f[-4:] == ".csv":
            shutil.copy(os.path.join(HTML_dir, f), os.path.join(crt_data_dir, f))

    # Now we move the index file to a good loc
    index_fp = os.path.join(HTML_dir, "new_index.html")
    shutil.move(index_fp, os.path.join(crt_data_dir, "index.html"))

    return crt_data_dir


def get_data_name(qzv_fp):
    data_name = os.path.basename(qzv_fp).split(".qzv")[0]
    return data_name

def call_qiime_tools(qzv_fp, data_name):
    """
    Args:
        qzv_fp (str): Path to qiime vis file.
        data_name (str): Name of data
    Returns:
        path_to_html (str): Path to outputted HTML directory.
    Description:
        Creates directory "HTML_NOW" with all the visualization
        files in it (from qiime2)
    """
   
    if "HTML_NOW" in os.listdir("."):
        raise Exception("There is already an HTML_NOW directory in current dir.")

    logging.info(f"Running qiime2 on file: {qzv_fp}; (extracted data name: {data_name}.)")
    os.system(f"qiime tools view {qzv_fp}")
    check_HTML_directory("HTML_NOW")
    logging.info("Succesfully ran qiime tools.")
    return os.path.join(os.getcwd(), "HTML_NOW")



def prepare_index_HTML_file_for_ExpressJS(HTML_dir, server_type=1):
    """
    Args:
        server_type (int) : 1 or 2. 1 means localhost:3000, 2 means
                            some specific location
    Description:
        Replaces links within directory to point to
        files within the system.
    """
    if server_type == 1:
        base_url = "http://localhost:3000/"
    else:
        raise Exception("We don't have a url for a server other than localhost.")

    # Example dirname: Spring2019-20190615-taxa-bar-plots-rename_HTML
    logging.debug("Input dir: " + HTML_dir)
    data_name = os.path.basename(HTML_dir)
    logging.debug("Acquired data name: " + data_name)
    index_fp = os.path.join(HTML_dir, "index.html")

    op_HTML_list = []
    HTML_list = open(index_fp, "r").read().split("\n")
    for line in HTML_list:

        if '<link rel="stylesheet"' in line:
            new_line = line.replace('./q2templateassets/css', f'{base_url}stylesheets')
            op_HTML_list.append(new_line)
        elif "<script src='dist/vendor.bundle.js" in line:
            new_line = line.replace('dist', f'{base_url}javascripts')
            op_HTML_list.append(new_line)
        elif "<script src='dist/bundle.js" in line:
            new_line = line.replace('dist', f'{base_url}javascripts')
            op_HTML_list.append(new_line)
        elif "./q2templateassets/js" in line:
            new_line = line.replace('./q2templateassets/js', f'{base_url}javascripts')
            op_HTML_list.append(new_line)
        elif "q2templateassets/img" in line:
            new_line = line.replace('./q2templateassets/img', f'{base_url}images')
            op_HTML_list.append(new_line)
        elif "src='level-" in line:
            new_line = line.replace("src='level-", f"src='{base_url}data/QZVs/{data_name}/level-")
            op_HTML_list.append(new_line)
        elif '<meta http-equiv="X-UA-Compatible" content="IE=edge">' in line:
            # target blank:
            #op_HTML_list.append('    <base href="http://localhost:3000/" target="_blank">')
            pass
        else:
            op_HTML_list.append(line)

    
    new_index_fp = os.path.join(HTML_dir, "new_index.html")
    with open(new_index_fp, "w") as g:
        g.write("\n".join(op_HTML_list))

    return data_name

def check_HTML_directory(HTML_dir):
    """
    Args:
        HTML_dir (str): Path to HTML directory
    """
    dir_files = os.listdir(HTML_dir)
    for x in ["index.html", "dist", "q2templateassets"]:
        if x not in dir_files:
            raise Exception(f"Could not find {x} in HTML directory: {HTML_dir}")




def test():

    return None


def main():
    
    args = sys.argv
    logging.basicConfig(level=logging.DEBUG)
    if args[-1] not in ["1", "2"]:
        help_str = "Incorrect args. Use the following:\n"
        help_str += "python3 qiime2_indexHTML_update.py qzv_fp 1\n"
        help_str += "OR\n"
        help_str += "python3 qiime2_indexHTML_update.py HTML_dir 2\n"
        print(help_str)
    elif args[-1] == "1":
        qzv_fp = args[1]
        complete_preparation_for_isolates_website(qzv_fp)
    elif args[-1] == "2":
        Qiime2_HTML_dir = args[1]
        check_this_is_correct_directory()
        data_name = prepare_index_HTML_file_for_ExpressJS(Qiime2_HTML_dir)
        op_dir = move_files_to_correct_location(Qiime2_HTML_dir, data_name)
        logging.info("Moved files to " + op_dir)
        sys.exit(0)
    else:
        raise Exception("How")

    test()

    return None

if __name__ == "__main__":
    main()





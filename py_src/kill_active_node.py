

import os
from typing import List
import psutil
import sys

def find_process_ids(inp_str) -> List[str]:
    pids = []
    for proc in psutil.process_iter():
        cmd_list = proc.cmdline()
        cmd_line = " ".join(cmd_list)
        if inp_str == cmd_line:
            pids.append(str(proc.pid))
    return pids





def commit_murder(kill=False):
    ps_string: str = "node ./bin/www"

    pids: List[str] = find_process_ids(ps_string)
    if kill:
        if len(pids) > 1:
            raise RuntimeError("Multiple process ids matched: " + ', '.join(pids))
        elif len(pids) == 1:
            print("Killing process: " + pids[0] + ".")
            prcs = psutil.Process(pid=int(pids[0]))
            prcs.kill()
            check_prcs = psutil.Process(pid=int(pids[0]))
            if check_prcs is not None:
                print("Process not dead?")
        else:
            print("No matching processes found.")


    return None


if __name__ == "__main__":
    if sys.argv[-1] == "1":
        commit_murder(kill=True)
    else:
        commit_murder()


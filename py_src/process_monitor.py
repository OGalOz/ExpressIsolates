'''
This file monitors processes
'''

import sys
import time
import psutil
import json
import logging
from reports_mod import send_emails


def monitor_process(process_num, delay=30, debug=False):
    '''
    Args:
        process_num int process number to check.
        delay int: Number of seconds between each check
    Description:
        Every {delay (int)} we check if the process is running
        or not. If it is no longer running, we
        send a report to emails on the email_list
    '''
    if delay < 2:
        raise Exception("Delay should be at least 2.")

    run = True
    num_runs = 0
    while run:
        if debug:
            print(f"Process probably running, nR={num_runs}")
            print(f"sleeping for {delay} seconds.")
        time.sleep(delay)
        try:
            ps = psutil.Process(process_num)
        except Exception as inst:
            run = False
            logging.critical(inst)
        num_runs += 1

    num_runs -= 1

    send_report(process_num, ["omreeg@gmail.com"], num_runs, delay)

    return None


def send_report(broken_process, email_list, num_runs, delay):
    '''
    Args:
        int, list<str>
    Description:
    '''
    message_str = f"Process with id {broken_process} stopped running."
    message_str += f"Number of runs: {num_runs}, with delay {delay}."
    send_emails(message_str=message_str, address_list=email_list,
                prog_type="Process Monitor", user_id="admin")

    return None

def run_file(prc_num, delay_str, debug=False):
    prc_num, delay = check_inputs(prc_num, delay_str)
    monitor_process(prc_num, delay=delay, debug=debug)

def check_inputs(process_num, delay_str):


    try:
        prc_num = int(process_num)
    except Exception as inst:
        print("Input process number string failed. Should be integer.")
        raise Exception(inst)

    try:
        delay = int(delay_str)
    except Exception as inst:
        print("Input delay string failed. Should be integer.")
        raise Exception(inst)


    return prc_num, delay


def get_help_str():
    help_str = "python3 process_monitor.py process_num delay 1"
    help_str += ""
    return help_str

def main():
    args = sys.argv
    help_str = get_help_str()
    # 2 is debug
    opt = ["1", "2"]
    if args[-1] not in opt:
        print(help_str)
        sys.exit(0)
    elif args[-1] == "1":
        fn, process_num, delay_str, indic = args
        run_file(process_num, delay_str)
        return None
    else:
        fn, process_num, delay_str, indic = args
        run_file(process_num, delay_str, debug=True)
        return None

    return None



if __name__ == "__main__":
    main()

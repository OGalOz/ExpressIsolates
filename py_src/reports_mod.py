#python
import smtplib, ssl
import logging


"""
The main email function here is SendMyselfEmailFromBobby
The main text design is portfolio
"""

def send_emails(message_str="No message", address_list=[], prog_type="IsolatesNode", user_id=None):
    for email_address in address_list:
        send_email_from_bobby(message_str, email_address, prog_type=prog_type, user_id=user_id)




def send_email_from_bobby(message, destination_address, subject=None, prog_type=None,
                          user_id=None):
    """Send an email to the address in 'destination_address' from bobmoses289@gmail.com

    Args:
        message: (str)
    """

    if prog_type is None:
        prog_type = "Python"

    if user_id is None:
        user_id = "not provided."
    elif not isinstance(user_id, str):
        user_id = "not provided*."

    port = 465  # For SSL

    # Create a secure SSL context
    context = ssl.create_default_context()

    if subject is None:
        new_message="""\
        Subject: Message from Server



        This message is sent using
        """
        new_message += prog_type + ".\n"
        new_message += "for user " + user_id + "\n"
        new_message += message

    with smtplib.SMTP_SSL("smtp.gmail.com", port, context=context) as server:
        server.login("bobmoses289@gmail.com", "RedSeaPedestrian321!")
        server.sendmail("bobmoses289@gmail.com", destination_address, new_message)

    logging.info("Sent email from {} to {}".format("bobmoses289@gmail.com", destination_address))





def SendEmail(message, receiver_email, sender_email):
    """Send an email

    Args
        message: (str)
        receiver_email: (str)
        sender_email: (str)

    """
    port = 465  # For SSL
    password = input("Enter password for: " + sender_email)
    #password = GetPassword(my_hash_pw)

    # Create a secure SSL context
    context = ssl.create_default_context()

    with smtplib.SMTP_SSL("smtp.gmail.com", port, context=context) as server:
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, message)

    logging.info("Sent email to {} from {}".format(receiver_email, sender_email))


def honda_create_end_of_day_report(data_dir):
    """
    Args:
        data_dir (str): Path to directory with the following files:
                    results.tsv
                    all_trades.tsv
                    existing_orders.json
    Description:
        We take info from a directory at the end of the day and
        create a report to return to the user at the end of the day.

    """
    return None


def create_account_report(account_info,
                          start_end_share_prices,
                          trades,
                          ):
    """
    Args:
        account_info (d):
            name (str):
            cash (float):
            shares_amts (d):
                tckr (str) -> num_shares (int)

        start_end_share_prices (d):
            tckr (str) -> start_end_d (d):
                'open' -> price in dollars (float) beginning of day
                'close' -> price in dollars (float) close of day


        trades (list<trade_d>): One of these per trade
            trade_d (d):
                tckr (str): Ticker symbol for share
                trade_amt (int): negative if sold, positive if buy.
                reason (str): Reason for buying or selling.

    Returns:
        account_report (str): A basic report to be sent to
                        account holder by email.

    Description:
        We give a text report that provides the following info:
        The person's name, their cash, their shares, their total
        balance.

    Goal:
        Give a text report that provides the following info:
        Which trades were made throughout the day.
        Why those trades were made (Reasoning).
        Current account: Total balance
        Amount in each share,
        Amount remaining in cash.
        For shares, daily start,
        daily end.
    """

    logging.info(f"Starting to create text report for {account_info['name']}.")

    text_str = f"Hi {account_info['name']}, " + \
                f" your remaining cash balance for the day is" + \
                f" {account_info['cash']}." + \
                " Your shares and holdings are: "

    # Float tracking all money computed
    total_balance = account_info['cash']
    for tckr, amount in shares_amts.iteritems():
        text_str += f"{tckr}: {amount}, " + \
                    f"giving a value of "
        crnt_value = amount*start_end_share_prices[tckr]['close']
        text_str += f"{crnt_value}." + \
                    " At the start of the day a share was valued at " + \
                    f" {start_end_share_prices[tckr]['open']}. "
        total_balance += crnt_value

    text_str += f"Your total holdings: {total_balance}. "

    trade_str = f"Trades that were made: "
    for trade_d in trades:
        trade_str += f"For company {trade_d['tckr']}, "
        if trade_d['trade_amt'] > 0:
            trade_str += f"We bought {trade_d['trade_amt']} because "
        else:
            trade_str += f"We sold {-1*(trade_d['trade_amt'])} because "
        trade_str += trade_d['reason'] + ". "

    # Adding the trade info to the original text string.
    account_report = text_str + trade_str

    logging.info(f"Finished creating account_report for {account_info['name']}.")

    return account_report












# Gives some kind of report on the account based on the dict that's given.
def print_account_report(filename, account_dict):

    return_value = 0
    file_str = ""
    for key in account_dict:
        file_str += key + " = "  + str(account_dict[key]) + ' \n'

    if os.path.exists(filename):
        filename = str(randint(1000,9999)) + "log.txt"

    f = open(filename, "w")
    f.write(file_str)
    f.close()

    return [return_value, filename]



def main():


    message = input("Enter message")

    SendMyselfEmailFromBobby(message)



if __name__ == "__main__":
    main()



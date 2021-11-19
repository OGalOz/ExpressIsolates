
import mysql.connector
import pandas as pd






def get_base_db_connection(host="localhost", user="root", pw="SQLpw123!"):
    mydb = mysql.connector.connect(
                  host=host,
                  user=user,
                  password=pw
            )

    return mydb


def print_database_list():
    mydb = get_base_db_connection()
    mycursor = mydb.cursor()
    mycursor.execute("SHOW DATABASES")
    for x in mycursor:
        print(x)
    return mycursor

def connect_to_database(db_name, host="localhost", user="root", pw="SQLpw123!"):
    """
        db_name (str)
    """
    cnx = mysql.connector.connect(
                  host=host,
                  user=user,
                  password=pw,
                  database=db_name
            )

    return cnx

def create_new_table_from_tsv(inp_tsv, db_name, cnx):

    df = pd.read_table(inp_tsv)

    table

    '''
    (
 "CREATE TABLE `salaries` ("
 " `emp_no` int(11) NOT NULL,"
 " `salary` int(11) NOT NULL,"
 " `from_date` date NOT NULL,"
 " `to_date` date NOT NULL,"
 " PRIMARY KEY (`emp_no`,`from_date`), KEY `emp_no` (`emp_no`),"
 " CONSTRAINT `salaries_ibfk_1` FOREIGN KEY (`emp_no`) "
 " REFERENCES `employees` (`emp_no`) ON DELETE CASCADE"
 ") ENGINE=InnoDB")
    '''

    



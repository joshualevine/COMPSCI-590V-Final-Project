#!/usr/bin/python3

import pandas as pd
import numpy as np
import os

##############################################################################
################################### GLOBAL ###################################
##############################################################################

INFILE = 'data.xls'
OUTDIR = 'out/'
SHEET_NAMES = ['variables', 'county', 'state', 'access', 'stores', \
               'restaurants', 'assistance', 'insecurity', 'tax', 'local', \
               'health', 'socioeconimic']

##############################################################################
################################## METHODS ###################################
##############################################################################

def remove_trailing_whitespace(df):
    '''
    Clean up the input sheet by trimming whitespace, removing empty rows at
    the bottom of sheets, and removing commas from integer values
    '''
    df.columns = df.columns.str.strip()
    for col in list(df):
        df[col] = df[col].str.replace(',', '')
        df[col] = df[col].str.replace('--', '')
        df[col] = df[col].str.strip()
    while ''.join(df.values[-1]) == '':
        df.drop(df.tail(1).index, inplace=True)

def typify_dataframe(df):
    '''
    For each column, check if it's numeric (float or int). If so, then check
    if that column is an int or float column. Convert the series accordingly
    '''
    for col in list(df):
        is_numeric, items = True, []
        for item in list(df[col]):
            try:
                if item != '':
                    items.append(float(item))
                else:
                    items.append(-1) # any empty values / cells are now -1
            except:
                is_numeric = False
                break
        if not is_numeric: 
            continue
        is_int = True
        for item in items:
            if int(item) != item:
                is_int = False
                break
        if is_int:
            items = [int(item) for item in items]
            df[col] = pd.Series(items, dtype=int)
        else:
            df[col] = pd.Series(items, dtype=float)

##############################################################################
################################### MAIN #####################################
##############################################################################

if __name__ == '__main__':
    # make output directory if not exists
    cwd = os.getcwd()
    if not cwd.endswith('/'): 
        cwd += '/'
    if not OUTDIR.endswith('/'): 
        OUTDIR += '/'
    try:
        os.mkdir(OUTDIR)
        print('Output folder created: %s' % (cwd + OUTDIR))
    except:
        pass

    # iterate through each sheet and format / spit out CSV for D3
    for i in range(len(SHEET_NAMES)):
        print('\nWorking on %s sheet' % SHEET_NAMES[i])
        df = pd.read_excel(INFILE, sheet_name=i+1, dtype=str, na_filter=False)
        remove_trailing_whitespace(df)
        typify_dataframe(df)
        df.to_csv(OUTDIR + SHEET_NAMES[i] + '.csv', index=None)
        print('Saved to %s' % (cwd + OUTDIR + SHEET_NAMES[i] + '.csv'))

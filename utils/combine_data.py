#!/usr/bin/python3

import pandas as pd
import numpy as np
import os

##############################################################################
################################### GLOBAL ###################################
##############################################################################

INDIR = 'out/'
SHEETS = [ \
    ('county', ['FIPS', 'State', 'County']), \
    ('access', ['FIPS', 'LACCESS_POP15', 'LACCESS_LOWI15', 'LACCESS_HHNV15', \
                'LACCESS_SNAP15']), \
    ('stores', ['FIPS', 'SNAPSPTH16', 'WICSPTH12']), \
    ('restaurants', ['FIPS', 'FFRPTH14', 'FSRPTH14', 'PC_FFRSALES12', 'PC_FSRSALES12']),
    ('tax', ['FIPS', 'MILK_PRICE10', 'SODA_PRICE10', 'FOOD_TAX14']), \
    ('health', ['FIPS', 'PCT_DIABETES_ADULTS13', 'PCT_OBESE_ADULTS13', 'PCT_HSPA15', \
                'RECFACPTH14']), \
    ('socioeconimic', ['FIPS', 'MEDHHINC15', 'POVRATE15', 'CHILDPOVRATE15', \
                       'METRO13'])
]

##############################################################################
################################### MAIN #####################################
##############################################################################

if __name__ == '__main__':
    # iterate through each sheet, combine, and spit out csv for d3
    result = []
    for name, cols in SHEETS:
        df = pd.read_csv(INDIR + name + '.csv', dtype=str)[cols]
        if (type(result) == list):
            result = df
        else:
            result = result.merge(df, on='FIPS')
    result.to_csv(INDIR + 'final_dataset.csv', index=None)

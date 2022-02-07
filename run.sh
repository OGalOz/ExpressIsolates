echo "Running at 'https://isolates.genomics.lbl.gov/testingquery_asv'"
if [[ $1 -eq "1" ]]
then
    echo "Running with nohup"
    DEBUG=isolates_webapp:* nohup npm start &
elif [[ $1 -eq "2" ]]
then
    echo "Running without nohup"
    DEBUG=isolates_webapp:* npm start
else
    echo "Did not recognize last arg, should be 1 || 2."
fi

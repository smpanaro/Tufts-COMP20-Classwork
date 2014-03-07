## MBTA GIS Data Manipulation
See the included GeoJSON files. If you want to generate them yourself, keep reading. 

To generate more detailed polylines for T routes, first download the data from [here](http://www.mass.gov/anf/research-and-tech/it-serv-and-support/application-serv/office-of-geographic-information-massgis/datalayers/mbta.html).

Next install gdal.
```shell
$ brew install gdal
```
or download and manually install it from [here](http://www.kyngchaos.com/software:frameworks).

To convert the ESRI Shapefiles you downloaded from the MBTA to GeoJSON:
```shell
$ unzip mbta_rapid_transit.zip
$ ogr2ogr -f "GeoJSON" -t_srs crs:84 t_lines.json mbta_rapid_transit/MBTA_ARC.shp MBTA_ARC
$ ogr2ogr -f "GeoJSON" -t_srs crs:84 t_stations.json mbta_rapid_transit/MBTA_NODE.shp MBTA_NODE
```

Finally, to convert the GeoJSON files to polylines and coordinates that can be used with the Google Maps API:
```shell
$ python convert-mbta-data.py -l t_lines.json -s t_stations.json
``` 

### MBTA Data License
All detailed MBTA data comes from the "Office of Geographic and Environmental Information (MassGIS), Commonwealth of Massachusetts Executive Office of Environmental Affairs".
Per ["A Guide to the Massachusetts Public Records Law"](http://www.sec.state.ma.us/pre/prepdf/guide.pdf), this map data is in the public domain (for more detailed information additionally see [here](http://wiki.openstreetmap.org/wiki/MassGIS_Buildings_Import)). 

Specifically (emphasis added): 
>The Massachusetts Public Records Law provides that every person has a right of access to public information. This right of access includes the right to inspect, copy or have copies of records provided upon the payment of a reasonable fee.  

>The Massachusetts General Laws broadly define “public records” to include “all books, papers, ***maps***, photographs, recorded tapes, financial statements, statistical tabulations, or other documentary materials or data, regardless of physical form or characteristics, made or received by any officer or employee” of any Massachusetts governmental entity.


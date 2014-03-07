#!/usr/bin/env python

from __future__ import print_function

import argparse
import os
import sys
import json
from math import radians, cos, sin, asin, sqrt

DEBUG = True

def debug(msg):
    if not DEBUG: return
    print("DEBUG: {}".format(msg))

def parse_lines(path):
    if not os.path.exists(path):
        print("ERROR: T lines path not found: {}".format(path), file=sys.stderr)
        return
    with open(path, 'rb') as f:
        # Override parse float - float(num_str) loses a lot of precision.
        # Since we're not doing any calculations
        j = json.load(f, parse_float=lambda x:x)

    # line name mapped to list of lists of coordinates
    line_coords = {}
    for feat in j['features']:
        geometry = feat['geometry']
        props = feat['properties']

        line_name = props["LINE"]
        if line_name not in line_coords:
            debug("Found new line: {}".format(line_name))
            line_coords[line_name] = []

        coords = geometry['coordinates']

        if geometry['type'] == "MultiLineString":
            line_coords[line_name].append( multiline_list_to_pair_list(coords) )
        else: 
            line_coords[line_name].append(coords)

    for line_name in line_coords.keys():
        print_polyline_coords_list(line_coords[line_name], '{}LineCoordinates'.format(line_name.lower()), newlines=False)

def parse_stations(path):
    pass

# Print a JavaScript array containing google.maps.LatLng() objects for each latitude, longitude pair.
# newlines - print each coordinate pair on a newline
def print_polyline_coords(coords, newlines=True):
    line_end = "\n" if newlines else " "
    tab = "\t" if newlines else ""

    print("[new google.maps.LatLng({lat},{lon}),".format(lat=coords[-1][1], lon=coords[-1][0]), end=line_end)
    for c in coords[1:-1]:
        print("{tab}new google.maps.LatLng({lat},{lon}),".format(lat=c[1], lon=c[0], tab=tab), end=line_end)
    print("{tab}new google.maps.LatLng({lat},{lon})],".format(lat=coords[-1][1], lon=coords[-1][0], tab=tab))

def print_polyline_coords_list(coords_list, name, newlines=True):
    line_end = "\n" if newlines else " "
    tab = "\t" if newlines else ""

    print("var {} = [".format(name))
    for coords in coords_list:
        print_polyline_coords(coords, newlines)
    print("];")

# Helpers

# Recursively walk a list of lists to build a new list. 
# Each element in this new list is also a list, b. Each element
# of b is /not/ a list.
# e.g. 
# a = []
# a.append([1,2,3])
# a.append([[4,5],[6],[[7,8],[9,10]]])
# print(multiline_list_to_pair_list(a))
def multiline_list_to_pair_list(arr):
    if len(arr) == 0:
        return arr
    to_ret = []
    if type(arr[0]) is not list:
        to_ret.append(arr)
    else:
        for child in arr:
            to_ret.extend(multiline_list_to_pair_list(child))
    return to_ret

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-l', '--lines', help='GeoJSON file containing data for the subway lines, not stations.', dest='lines_path')
    parser.add_argument('-s', '--stations', help='GeoJSON file containing data for the subway stations.', dest='stations_path')
    args = parser.parse_args()

    if args.lines_path: parse_lines(args.lines_path)
    if args.stations_path: parse_stations(args.stations_path)

if __name__ == '__main__':
    main()
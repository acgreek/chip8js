#!/usr/bin/python 
from __future__ import print_function
import sys;

print("var pong =new Array(", end='');
try:
  byte = sys.stdin.read(1)
  first =True;
  while byte != "":
# Do stuff with byte.
    if False == first:
       print(",", end='');
    first = False  
    print("0x%02X" % ord(byte), end='');
    byte = sys.stdin.read(1)
finally:
  print(");")
	

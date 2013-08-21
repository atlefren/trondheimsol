#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json
from flask import Flask, render_template


app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/<int:venue_id>')
def api(venue_id):
    print venue_id

    filename = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.json')
    json_data = open(filename)
    json.load(json_data)
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json
import requests
from flask import Flask, render_template, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/<int:venue_id>')
def api(venue_id):
    url = "http://api.untappd.com/v4/venue/info/%s?client_id=%s&client_secret=%s" %(venue_id, os.environ['UT_CLIENT_ID'], os.environ['UT_CLIENT_SECRET'])
    r = requests.get(url)
    return jsonify(r.json())
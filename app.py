#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json
import requests
from flask import Flask, render_template, jsonify
from werkzeug.contrib.cache import RedisCache
import urlparse

redis_url = urlparse.urlparse(os.environ.get('REDISTOGO_URL', 'redis://localhost:6379'))

app = Flask(__name__)
app.debug = True
cache = RedisCache(host=redis_url.hostname, port=redis_url.port, password=redis_url.password, db=0, default_timeout=5 * 60, key_prefix="beer__")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/<int:venue_id>')
def api(venue_id):
    data = cache.get(str(venue_id))
    if data is None:
        url = "https://api.untappd.com/v4/venue/info/%s?client_id=%s&client_secret=%s" %(venue_id, os.environ['UT_CLIENT_ID'], os.environ['UT_CLIENT_SECRET'])
        r = requests.get(url)
        data = r.json()
        cache.set(str(venue_id), data)
    return jsonify(data)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

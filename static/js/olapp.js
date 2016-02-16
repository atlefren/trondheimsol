(function () {
    'use strict';

    var Venue = Backbone.Model.extend({
        url: function () {
            return '/api/' + this.get('venue_id');
        },

        defaults: {
            fetched: false
        },

        parse: function (response) {
            var venue = response.response.venue;
            venue.fetched = true;
            return venue;
        }
    });

    var VenueCollection = Backbone.Collection.extend({

        model: Venue,

        comparator: function (model) {
            if (model.has('stats')) {
                return -model.get('stats').total_count;
            }
            return 0;
        },

        getData: function (cb) {
            var fetched = _.after(this.length, _.bind(function () {
                this.once('sort', _.bind(function () {
                    cb(this);
                }, this));
                this.sort();
            }, this));

            this.each(function (venue) {
                venue.fetch({success: fetched});
            }, this);
        }
    });


    var Beer = Backbone.Model.extend();

    var Beers = Backbone.Collection.extend({
        model: Beer
    });

    var BeerView = Backbone.View.extend({

        tagName: 'li',

        className: 'media',

        template: $('#beer_template').html(),

        render: function () {

            var user = false;
            if (this.model.has('user')) {
                user = this.model.get('user').user_name;
            }
            var date = false;
            if (this.model.has('created_at')){
                date = moment(this.model.get('created_at')).format('HH.mm D.M.YYYY');
            }

            var checkins = false;
            if (this.model.has('total_count')){
                checkins = this.model.get('total_count');
            }

            var data = {
                'beer_name': this.model.get('beer').beer_name,
                'brewery_name': this.model.get('brewery').brewery_name,
                'beer_label': this.model.get('beer').beer_label,
                'user': user,
                'date': date,
                'checkins': checkins
            };

            this.$el.html(_.template(this.template, data));
            return this;
        }
    });

    var BeerListView = Backbone.View.extend({

        initialize: function () {
            this.collection.on('reset', this.render, this);
        },

        render: function () {
            this.$el.html('');
            var top10 = this.collection.first(10);
            _.each(top10, function (beer) {
                this.$el.append(new BeerView({'model': beer}).render().$el);
            }, this);
            return this;
        }
    });

    var VenueView = Backbone.View.extend({

        className: 'col-md-4',

        template: $('#venue_template').html(),

        initialize: function () {
            this.model.on('sync', this.render, this);
        },

        render: function () {
            if (!this.model.get('fetched')) {
                this.$el.html('Henter data');
                return this;
            }

            var image = this.model.get('media').items[0];
            var data = {
                'venue_name': this.model.get('venue_name'),
                'venue_address': this.model.get('location').venue_address,
                'primary_category': this.model.get('primary_category'),
                'total_user_count': this.model.get('stats').total_user_count,
                'total_count': this.model.get('stats').total_count,
                'user_count': this.model.get('stats').user_count,
                'beer_image': image.photo.photo_img_md,
                'map_url': 'https://maps.google.com/?q=' + this.model.get('location').lat + ',' + this.model.get('location').lng,
                'image_user': image.user.user_name,
                'image_date': moment(image.created_at).format('HH.mm D.M.YYYY')
            };

            this.$el.html(_.template(this.template, data));
            this.topbeerlist = new BeerListView({
                'el': this.$('#top_10_beers'),
                'collection': new Beers(this.model.get('top_beers').items)
            }).render();
            this.lastbeerlist = new BeerListView({
                'el': this.$('#last_checkins'),
                'collection': new Beers(this.model.get('checkins').items)
            }).render();
            return this;
        }
    });


    function createVenue(model) {
        var venueView = new VenueView({'model': model});
        return venueView.render().$el;
    }


    function drawCollection(collection) {
        $('#olliste').html('');
        var rows = _.chain(coll.models)
            .map(function (m) {
                return m;
            })
            .groupBy(function (element, index){
                return Math.floor(index / 3);
            })
            .map(function (row) {
                var rowElement = $('<div class="row"></div>');
                rowElement.append(_.map(row, createVenue));
                return rowElement;
            })
            .value();
        $('#olliste').append(rows);
    }

    //the venues
    var venues = [2786348, 198215, 2078603, 225403, 87730, 1772581];

    //create collection
    var coll = new VenueCollection(_.map(venues, function (venueId) {
        return {venue_id: venueId};
    }));


    //initial draw
    drawCollection(coll);

    //get data and redraw
    coll.getData(drawCollection);

}());

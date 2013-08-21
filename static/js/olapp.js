(function () {
    "use strict";

    var Venue = Backbone.Model.extend({
        url: function () {
            return "/api/" + this.get("venue_id");
        },

        parse: function (response) {
            return response.response.venue;
        }
    });

    var Beer = Backbone.Model.extend();

    var Beers = Backbone.Collection.extend({
        model: Beer
    });

    var BeerView = Backbone.View.extend({

        tagName: "li",

        className: "media",

        template: $("#beer_template").html(),

        render: function () {

            var user = false;
            if (this.model.has("user")) {
                user = this.model.get("user").user_name;
            }
            var date = false;
            if (this.model.has("created_at")){
                date = moment(this.model.get("created_at")).format("HH.mm D.M.YYYY");
            }

            var checkins = false;
            if (this.model.has("total_count")){
                checkins = this.model.get("total_count");
            }

            var data = {
                "beer_name": this.model.get("beer").beer_name,
                "brewery_name": this.model.get("brewery").brewery_name,
                "beer_label": this.model.get("beer").beer_label,
                "user": user,
                "date": date,
                "checkins": checkins
            };

            this.$el.html(_.template(this.template, data));
            return this;
        }
    });

    var BeerListView = Backbone.View.extend({

        initialize: function () {
            this.collection.on("reset", this.render, this);
        },

        render: function () {
            this.$el.html("");
            this.collection.each(function (beer) {
                this.$el.append(new BeerView({"model": beer}).render().$el);
            }, this);
            return this;
        }
    });

    var VenueView = Backbone.View.extend({

        className: "col-md-4",

        template: $("#venue_template").html(),

        initialize: function () {
            this.model.on("sync", this.render, this);
        },

        render: function () {

            var image = this.model.get("media").items[0];
            var data = {
                "venue_name": this.model.get("venue_name"),
                "venue_address": this.model.get("location").venue_address,
                "primary_category": this.model.get("primary_category"),
                "total_user_count": this.model.get("stats").total_user_count,
                "total_count": this.model.get("stats").total_count,
                "beer_image": image.photo.photo_img_md,
                "map_url": "https://maps.google.com/?q=" + this.model.get("location").lat + "," + this.model.get("location").lng,
                "image_user": image.user.user_name,
                "image_date": moment(image.created_at).format("HH.mm D.M.YYYY")
            };

            this.$el.html(_.template(this.template, data));
            this.topbeerlist = new BeerListView({"el": this.$("#top_10_beers"), "collection": new Beers(this.model.get("top_beers").items)}).render();
            this.lastbeerlist = new BeerListView({"el": this.$("#last_checkins"), "collection": new Beers(this.model.get("checkins").items)}).render();
            return this;
        }
    });


    _.each([66084, 225403, 87730], function (venue_id) {
        var venue = new Venue({"venue_id": venue_id});
        var venueView = new VenueView({"model": venue});
        $("#olliste").append(venueView.$el);
        venue.fetch();
    });
}());
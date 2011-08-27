/**
 * Our rel closure contains functions to show the relationships
 * between actors and the shows they're in.  It also handles the
 * drawing of all of our objects.  
 */
var rel = {

    /**
    * The first thing we do is set up the options and defaults for
    * our drawing.
    */
    hitOptions: {
        fill: true,
        tolerance: 5
    },

    currentItem: null,

    defaultColor: 'lightgray',
    defaultTextColor: 'black', 
    actorHighlight: '#66b95f',
    showHighlight: '#f57e20',
    actorSelect: '#bb2527',
    showSelect: '#30449d',
    selectedActors: [],
    selectedShows: [],
    font: 'ff-basic-gothic-web-pro, Verdana, sans',

    /**
    * This function clears out the selection indicators of the
    * actors and shows.
    */
    clearSelection: function() {
        rel.clearSelectionPaths();
        rel.selectedActors.length = 0;
        rel.selectedShows.length = 0;
    },
    
    /**
    * This function clears out the selection indicators of the
    * actors and shows.
    */
    clearSelectionPaths: function() {
        for (var i = 0; i < rel.selectedActors.length; i++) {
            rel.highlight(rel.selectedActors[i], rel.defaultColor, rel.defaultTextColor, 0.5, 1);
        }
        
        for (var i = 0; i < rel.selectedShows.length; i++) {
            rel.highlight(rel.selectedShows[i], rel.defaultColor, rel.defaultTextColor, 0.5, 1);
        }
    },
        
    /**
    * Toggle the selection of the specific actor
    */
    toggleSelected: function(isActor, /*closure*/ object) {
        
        var selectedItems = isActor ? rel.selectedActors : rel.selectedShows;
        rel.clearSelectionPaths();
        
        if ($.inArray(object, selectedItems) !== -1) {
            rel.removeItem(object, selectedItems);
        } else {
            selectedItems.push(object);
        }
        
        (isActor ? rel.selectedShows : rel.selectedActors).length = 0;
        
        rel.showIntersecting();
    },

    /**
    * Toggle the selection of the specific actor
    */
    toggleSelectedActor: function(/*closure*/ actor) {
        this.toggleSelected(true, actor);
    },
    
    /**
    * Toggle the selection of a specific show
    */
    toggleSelectedShow: function(/*closure*/ show) {
        this.toggleSelected(false, show);
    },
    
    /**
    * This is some specialized array handling.  We could use the
    * functions from underscore.js, but these are a little faster
    * since we know specifics about our objects.
    */
    removeItem: function(object, array) {
        var index = rel.indexOf(object, array);
        if (index > -1) {
            array.splice(index, 1);
        }
    },
    
    indexOf: function(object, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].name === object.name) {
                return i;
            }
        }
        
        return -1;
    },

    /**
    * Draw the intersection of all the items or shows.
    */
    showIntersecting: function() {
        showActors = rel.selectedActors.length > 0; 
        
        rel.clearSelectionPaths();
        var selectColor = showActors ? rel.actorSelect : rel.showSelect;
        var selectedItems = showActors ? rel.selectedActors : rel.selectedShows;
        var linkedItems = [];
        for (var i = 0; i < selectedItems.length; i++) {
            var selectedItem = selectedItems[i];
            linkedItems.push(selectedItem.linked);
            selectedItem.dot.fillColor = selectColor;
            selectedItem.text.fillColor = selectColor;
            project.activeLayer.addChild(selectedItem.dot);
        }

        var inter = _.intersection.apply(this, linkedItems);
        var relItems = showActors ? rel.selectedActors : rel.selectedShows;

        _.each(inter, function(linkedItem) {
            linkedItem.dot.fillColor = selectColor;
            project.activeLayer.addChild(linkedItem.dot);
            for (var i = 0; i < linkedItem.paths.length; i++) {
                var path = linkedItem.paths[i];
                if ($.inArray(path.linked, relItems) !== -1) {
                    path.path.strokeColor = selectColor;
                    path.path.strokeWidth = 2;
                    path.path.opacity = 1;
                }
            }
        });
    },

    /**
    * Highlight the specified actor or show, the connections, and all of
    * the shows this actor was in.
    */
    highlight: function(/*closure*/ object, /*string*/ color, /*string*/ textColor, /*int*/ opacity, /*int*/ strokeWidth) {
        for (var i = 0; i < object.paths.length; i++) {
            var path = object.paths[i].path;
            path.strokeColor = color;
            path.strokeWidth = strokeWidth;
            path.opacity = opacity;
            project.activeLayer.addChild(path);
        };
        _.each(object.linked, function (linkedObject) {
            linkedObject.dot.fillColor = color;
            linkedObject.text.fillColor = textColor;
            project.activeLayer.addChild(linkedObject.dot);
            project.activeLayer.addChild(linkedObject.text);
        });

        object.dot.fillColor = color;
        project.activeLayer.addChild(object.dot);
        object.text.fillColor = textColor;
    },
    create: function(isActor, name, point) {
        var highlightColor = isActor ? rel.actorHighlight : rel.showHighlight;
        return {
            linked: [],
            dictionary: {},
            name: name,
            isActor: isActor,
            
            paths: [],
        
            add: function(item) {
                if (isActor)
                    item.linked.push(this);
                this.linked.push(item);
            },
            
            point: point,

            /**
            * Create the dot and text items for this item
            */
            createItems: function() {
                if (this.hasDrawn) {
                    return;
                }
                if (isActor)
                    this.paths = this.createConnections();
                this.dot = new Path.Circle(point, isActor ? this.linked.length * 2 : this.linked.length + 2);
                this.dot.fillColor = rel.defaultColor;
                this.dot.strokeWidth = 0;
                this.dot.rel = this;

                this.text = new PointText(point + (isActor ? [-20, 5] : [35, 5]));
                var size = isActor ? new Size(-150, -10) : new Size(200, -10);
                var p = this.text.point + [isActor ? 30 : -40, 0];
                this.rect = new Path.Rectangle(p, size);
                this.rect.fillColor = new RGBColor(0, 0, 0, 0);
                this.rect.rel = this;
                // this.rect.selected = true;

                this.text.content = name;
                this.text.characterStyle =  {
                    fontSize: isActor ? 10 : 14,
                    fillColor: rel.defaultTextColor,
                    font: rel.font
                };
                if (isActor)
                    this.text.paragraphStyle.justification = 'right';
                this.text.rel = this;
                this.hasDrawn = true;
            },

            /**
            * Handle mouse over for the dot for this item
            */
            mouseover: function() {
                rel.highlight(this, highlightColor, highlightColor, 1, 2);
            },

            /**
            * Handle mouse out for the dot for this item
            */
            mouseout: function() {
                rel.highlight(this, rel.defaultColor, rel.defaultTextColor, 0.5, 1);
                rel.showIntersecting();
            },

            /**
            * Handle clicks onthe dot for this item
            */
            click: function() {
                rel.toggleSelected(isActor, this);
            },
            
            /**
            * Create the connections for this actor which is a line
            * connecting the actor to each show.
            */
            createConnections: function() {
            var item = this;
            var paths = []

            _.each(this.linked, function (linked) {
                //console.log('draw line: M' + item.x() + ' ' + item.y() + 'L' + linked.x() + ' ' + linked.y());

                var p = new Path(item.point, linked.point);
                p.strokeColor = rel.defaultColor;
                //p.strokeWidth = 1;
                //p.opacity = 0.5;

                //console.log('p: ' + p);
                paths.push({linked: linked, 'path': p});
                linked.paths.push({linked: item, 'path': p});
                linked.createItems();
            });

            return paths;
            }
        };
    },

    /**
    * Create an actor with the specified name at the specified
    * position.
    */
    createActor: function(/*string*/ name, /*point*/ point) {
        return this.create(true, name, point);
    },
    
    /**
    * Create a new show object with the specified name at the 
    * specified position. 
    */
    createShow: function(/*string*/ name, /*point*/ point) {
        return this.create(false, name, point);
    }
};

/**
 * This is our generic mouse move handler.  PaperJS doesn't give
 * us a simple mouse event for each object so we need to map the
 * generic events to our specific object.  This handles
 * mouseover and mouseout events.
 */
function onMouseMove(event) {

    var hitResult = project.hitTest(event.point, rel.hitOptions);
    
    if (hitResult && hitResult.item && hitResult.item.rel) {
        if (rel.currentItem === hitResult.item) {
            return;
        } else {
            if (rel.currentItem) {
            rel.currentItem.rel.mouseout();
            rel.currentItem = null;
            }
            rel.currentItem = hitResult.item;
            rel.currentItem.rel.mouseover();
        }
    } else {
        /*
        * This is mouse out
        */
        if (rel.currentItem) {
            rel.currentItem.rel.mouseout();
            rel.currentItem = null;
        }
    }
};

/**
 * Click events are easier.  We just find the item which was
 * under the mour when the button was released and call its
 * click function.
 */
function onMouseUp(event) {
    var hitResult = project.hitTest(event.point, rel.hitOptions);

    if (hitResult && hitResult.item && hitResult.item.rel) {
        hitResult.item.rel.click();
    }
}



jQuery(document).ready(function() {
    var point = new Point(250, 25);
    
    /*
    * Here's where we initialize our data.  We keep the mapping
    * of actors to shows in a JSON object in the data.json file.
    * 
    * The JSON is a set of actors with each show they've worked
    * on.  Like this:
    * 
    *    "AmyRyan": [
    *        "In Treatment",
    *        "The Wire"
    *    ]
    * 
    *  We iterate through the actors and build the show objects.
    */
    var actorNames = [];
    var showNames = [];
    
    for (var actor in DATA) {
        if (DATA.hasOwnProperty(actor)) {
            actorNames.push(actor);
            var shows = DATA[actor];
            _.each(shows, function (show) {
            showNames.push(show);
            });
        }
    }

    /*
    * Now we sort the show names alphabetically.  We have some
    * specialized handling to properly handle shows which start
    * with "The "
    */
    showNames = _.sortBy(showNames, function(show) {
        if (show.indexOf('The') === 0) {
            return show.substring(4);
        } else {
            return show;
        }
    });

    /*
    * Then we prune out the duplicate names.
    */
    showNames = _.uniq(showNames, true);

    /*
    * Now we're ready to build the real objects.  
    */
    var actors = _.map(actorNames, function (name) {
        var actor = rel.createActor(name, point.clone());
        point.y += 16;
        return actor;
    });

    var actorY = point.y;
    point = new Point(700, 25);

    var shows = _.map(showNames, function (name) {
        var show = rel.createShow(name, point.clone());
        point.y += 46;
        return show;
    });
    /*
    * Now we map each actor to the shows they are in.  
    */
    _.each(shows, function (show) {
        _.each(actors, function (actor) {
            if (_.indexOf(DATA[actor.name], show.name, false) > -1) {
            actor.add(show);
            }
        });
    });
    
    /*
    * Then we set the height of our view
    */
    view.viewSize = [1000, actorY + 25];

    /*
    * The last step is to draw each actor which draws the shows
    */
    _.each(actors, function (actor) {
        actor.createItems();
    });
    $('.actorLink').each(function() {
        var link = $(this);
        
        $(this).click(function(evt) {
            evt.preventDefault();
            rel.clearSelection();
            
            _.each(actors, function (actor) {
            if (actor.name === link.text()) {
                /*
                * Now we've found the actor from the link which was
                * clicked.  Next we need to iterate over each show
                * that actor was is and select it.
                */
                _.each(actor.linked, function (show) {
                    rel.toggleSelectedShow(show);
                });
                view.draw();
            }
            });
            
        });
    });
    $('#deadwoodjohn').click(function(evt) {
        evt.preventDefault();
        rel.clearSelection();
    
        _.each(shows, function (show) {
            if (show.name === 'Deadwood' ||
            show.name === 'John from Cincinnati') {
            rel.toggleSelectedShow(show);
            
            }
        });
    
        paper.view.draw();
    
    });
});


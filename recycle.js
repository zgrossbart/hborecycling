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
        segments: true,
        stroke: true,
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
            rel.highlightActor(rel.selectedActors[i], rel.defaultColor, rel.defaultTextColor, 0.5, 1);
        }
        
        for (var i = 0; i < rel.selectedShows.length; i++) {
            rel.highlightShow(rel.selectedShows[i], rel.defaultColor, rel.defaultTextColor, 0.5, 1);
        }
    },
        
    /**
     * Toggle the selection of the specific actor
     */
    toggleSelectedActor: function(/*closure*/ actor) {
        rel.clearSelectionPaths();
        
        if ($.inArray(actor, rel.selectedActors) !== -1) {
            rel.removeItem(actor, rel.selectedActors);
        } else {
            rel.selectedActors.push(actor);
        }
        
        rel.selectedShows.length = 0;
        
        rel.drawIntersectionActors();
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
             if (array[i].getName() === object.getName()) {
                 return i;
             }
         }
         
         return -1;
    },

    /**
     * Draw the intersection of all the actors.  This function
     * highlights all the selected actors and the shows all of them
     * have worked on.
     */
    drawIntersectionActors: function() {
         var shows = [];
         //console.log("rel.selectedActors.length: " + rel.selectedActors.length);
         
         for (var i = 0; i < rel.selectedActors.length; i++) {
             for (var j = 0; j < rel.selectedActors[i].shows.length; j++) {
                 rel.highlightShow(rel.selectedActors[i].shows[j], rel.defaultColor, rel.defaultTextColor, 0.5, 1);
             }
         }
         
         for (var i = 0; i < rel.selectedActors.length; i++) {
             //console.log("rel.selectedActors[i].getName(): " + rel.selectedActors[i].getName());
             shows.push(rel.selectedActors[i].shows);
             
             rel.selectedActors[i].getDot().fillColor = rel.actorSelect;
             rel.selectedActors[i].text.fillColor = rel.actorSelect;
             project.activeLayer.addChild(rel.selectedActors[i].getDot());
         }
         
         var inter = _.intersection.apply(this, shows);
         //console.log('inter: ' + inter.length);
             
         _.each(inter, function(show) {
             show.getDot().fillColor = rel.actorSelect;
             project.activeLayer.addChild(show.getDot());
             
             for (var i = 0; i < show.paths.length; i++) {
                 if ($.inArray(show.paths[i].actor, rel.selectedActors) !== -1) {
                     show.paths[i].path.strokeColor = rel.actorSelect;
                     show.paths[i].path.strokeWidth = 2;
                     show.paths[i].path.opacity = 1;
                 }
             }
         });
    },

    /**
     * Toggle the selection of a specific show
     */
    toggleSelectedShow: function(/*closure*/ show) {
        rel.clearSelectionPaths();
        if ($.inArray(show, rel.selectedShows) !== -1) {
            rel.removeItem(show, rel.selectedShows);
        } else {
            rel.selectedShows.push(show);
        }
        
        rel.selectedActors.length = 0;
        
        rel.drawIntersectionShows();
    },
    
    /**
     * Draw the intersection of all the selected shows.  This
     * highlights all of the selected shows and all of the actors
     * which have worked on all of the shows.
     */
    drawIntersectionShows: function() {
         var actors = [];
         //console.log("rel.selectedShows.length: " + rel.selectedShows.length);
         
         for (var i = 0; i < rel.selectedShows.length; i++) {
             for (var j = 0; j < rel.selectedShows[i].actors.length; j++) {
                 rel.highlightActor(rel.selectedShows[i].actors[j], rel.defaultColor, rel.defaultTextColor, 0.5, 1);
             }
         }
         
         for (var i = 0; i < rel.selectedShows.length; i++) {
             actors.push(rel.selectedShows[i].actors);
             
             rel.selectedShows[i].getDot().fillColor = rel.showSelect;
             project.activeLayer.addChild(rel.selectedShows[i].getDot());
             rel.selectedShows[i].text.fillColor = rel.showSelect;//});
             project.activeLayer.addChild(rel.selectedShows[i].text);
         }
         
         var inter = _.intersection.apply(this, actors);
         
         _.each(inter, function(actor) {
             actor.getDot().fillColor = rel.showSelect;
             project.activeLayer.addChild(actor.getDot());
             
             for (var i = 0; i < actor.paths.length; i++) {
                 if ($.inArray(actor.paths[i].show, rel.selectedShows) !== -1) {
                     actor.paths[i].path.strokeColor = rel.showSelect;
                     actor.paths[i].path.strokeWidth = 2;
                     actor.paths[i].path.opacity = 1;
                     project.activeLayer.addChild(actor.paths[i].path);
                 }
             }
         });
    },
    
    /**
     * Highlight the specified actor, the connections, and all of
     * the shows this actor was in.
     */
    highlightActor: function(/*closure*/ actor, /*string*/ color, /*string*/ textColor, /*int*/ opacity, /*int*/ strokeWidth) {
               
        if (actor.selected) {
            return;
        }
        
        for (var i = 0; i < actor.paths.length; i++) {
            actor.paths[i].path.strokeColor = color;
            actor.paths[i].path.strokeWidth = strokeWidth;
            actor.paths[i].path.opacity = opacity;
            project.activeLayer.addChild(actor.paths[i].path);
        };

        _.each(actor.shows, function (show) {
            show.dot.fillColor = color;
            show.text.fillColor = textColor;

            project.activeLayer.addChild(show.dot);
            project.activeLayer.addChild(show.text);
        });
        
        actor.getDot().fillColor = color;
        actor.text.fillColor = textColor;

        project.activeLayer.addChild(actor.getDot());
    },
    
    /**
     * Highlight the specified show, the connections, and all of
     * the actors who worked on this show.
     */
    highlightShow: function(/*closure*/ show, /*string*/ color, /*string*/ textColor, /*int*/ opacity, /*int*/ strokeWidth) {

        if (show.selected) {
            return;
        }
        
        for (var i = 0; i < show.paths.length; i++) {
            show.paths[i].path.strokeColor = color;
            show.paths[i].path.strokeWidth = strokeWidth;
            show.paths[i].path.opacity = opacity;
            project.activeLayer.addChild(show.paths[i].path);
        };

        _.each(show.actors, function (actor) {
            actor.dot.fillColor = color;
            project.activeLayer.addChild(actor.dot);
            actor.text.fillColor = textColor;
            project.activeLayer.addChild(actor.text);
        });
        
        show.getDot().fillColor = color;
        project.activeLayer.addChild(show.getDot());
        show.text.fillColor = textColor;
    },
    
    /**
     * Create an actor with the specified name at the specified
     * position.
     */
    createActor: function(/*string*/ name, /*int*/ x, /*int*/ y) {
        return {
            shows: [],
                
            getName: function() {
                return name;
            },
            
            addShow: function(show) {
                 show.addActor(this);
                 this.shows.push(show);
            },
            
            getShows: function() {
                 return this.shows;
            },
            
            x: function() {
                 return x;
            },

            y: function() {
                 return y;
            },
            
            getDot: function() {
                 return this.dot;
            },

            /**
             * Draw the dot and text for this actor
             */
            draw: function() {
                this.paths = this.drawConnections();
                
                this.dot = new Path.Circle(x, y, this.shows.length * 2);
                this.dot.fillColor = rel.defaultColor;
                this.dot.strokeWidth = 0;
                this.dot.rel = this;
                
                this.text = new PointText(new Point(x - 20, y + 5));
                this.text.content = name;
                this.text.characterStyle =  {
                    fontSize: 10,
                    fillColor: rel.defaultTextColor,
                    font: rel.font
                };
                this.text.paragraphStyle.justification = 'right';
                this.text.rel = this;
            },

            /**
             * Handle mouse over for the dot for this actor
             */
            mouseover: function() {
                rel.highlightActor(this, rel.actorHighlight, rel.actorHighlight, 1, 2);
            },

            /**
             * Handle mouse out for the dot for this actor
             */
            mouseout: function() {
                rel.highlightActor(this, rel.defaultColor, rel.defaultTextColor, 0.5, 1);
                rel.drawIntersectionActors();
                rel.drawIntersectionShows();
            },

            /**
             * Handle clicks onthe dot for this actor
             */
            click: function() {
                 rel.toggleSelectedActor(this);
            },
            
            /**
             * Draw the connections for this actor which is a line
             * connecting the actor to each show.
             */
            drawConnections: function() {
                var actor = this;
                var paths = []
                
                _.each(this.shows, function (show) {
                    //console.log('draw line: M' + actor.x() + ' ' + actor.y() + 'L' + show.x() + ' ' + show.y());

                    var p = new Path.Line(new Point(actor.x(), actor.y()), new Point(show.x(), show.y()));
                    p.strokeColor = rel.defaultColor;
                    //p.strokeWidth = 1;
                    //p.opacity = 0.5;

                    //console.log('p: ' + p);
                    paths.push({'show': show, 'path': p});
                    show.paths.push({'actor': actor, 'path': p});
                    
                    show.draw();
                });
                
                return paths;
            }
        };
    },
    
    /**
     * Create a new show object with the specified name at the 
     * specified position. 
     */
    createShow: function(/*string*/ name, /*int*/ x, /*int*/ y) {
        return {
            actors: [],
            paths: [],
            hasDrawn: false,
                
            getName: function() {
                return name;
            },
            
            addActor: function(actor) {
                 this.actors.push(actor);
            },
            
            getActors: function() {
                 return this.actors;
            },
            
            x: function() {
                 return x;
            },
            
            y: function() {
                 return y;
            },
            
            /**
             * Draw the dot and text for this actor.  This function checks
             * to make sure it only draws once since we call it for each
             * actor which worked on this show.
             */
            draw: function() {
                if (this.hasDrawn) {
                    return;
                }

                this.dot = new Path.Circle(x, y, this.actors.length + 2);
                this.dot.fillColor = rel.defaultColor;
                this.dot.strokeWidth = 0;
                this.dot.rel = this;
                
                this.text = new PointText(new Point(x + 35, y + 5));
                this.text.content = name;
                this.text.characterStyle =  {
                    fontSize: 14,
                    fillColor: rel.defaultTextColor,
                    font: rel.font
                };
                this.text.rel = this;

                this.hasDrawn = true;
            },

            mouseover: function() {
                rel.highlightShow(this, rel.showHighlight, rel.showHighlight, 1, 2);
            },

            mouseout: function() {
                rel.highlightShow(this, rel.defaultColor, rel.defaultTextColor, 0.5, 1);
                rel.drawIntersectionShows();
                rel.drawIntersectionActors();
            },

            click: function() {
                rel.toggleSelectedShow(this);
            },

            getDot: function() {
                 return this.dot;
            }
            
        };
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
    var x = 250;
    var y = 25;
    
    /*
     * Here's where we initialize our data.  We keep the mapping
     * of actors to shows in a JSON object in the data.json file.
     * 
     * The JSON is a set of actors with each show they've worked
     * on.  Like this:
     * 
     *      "AmyRyan": [
     *          "In Treatment",
     *          "The Wire"
     *      ]
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
        var actor = rel.createActor(name, x, y);
        y += 16;
        return actor;
    });

    var actorY = y;

    x = 700;
    y = 25;

    var shows = _.map(showNames, function (name) {
        var show = rel.createShow(name, x, y);
        y += 46;
        
        return show;
    });
    
    /*
     * Now we map each actor to the shows they are in.  
     */
    _.each(shows, function (show) {
        _.each(actors, function (actor) {
            if (_.indexOf(DATA[actor.getName()], show.getName(), false) > -1) {
                actor.addShow(show);
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
        actor.draw();
    });
    
    $('.actorLink').each(function() {
        var link = $(this);
        
        $(this).click(function(evt) {
            evt.preventDefault();
            rel.clearSelection();
            
            _.each(actors, function (actor) {
                if (actor.getName() === link.text()) {
                    /*
                     * Now we've found the actor from the link which was
                     * clicked.  Next we need to iterate over each show
                     * that actor was is and select it.
                     */
                    _.each(actor.shows, function (show) {
                        rel.toggleSelectedShow(show);
                    });
                    View._focused.draw();
                }
            });
            
        });
    });
    
    $('#deadwoodjohn').each(function() {
        var link = $(this);
        
        $(this).click(function(evt) {
            evt.preventDefault();
            rel.clearSelection();
            
            _.each(shows, function (show) {
                if (show.getName() === 'Deadwood' ||
                    show.getName() === 'John from Cincinnati') {
                    rel.toggleSelectedShow(show);
                    
                }
            });
            
            View._focused.draw();
            
        });
        
    });
});

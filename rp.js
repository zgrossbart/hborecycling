var rel = {

    hitOptions: {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 5
    },

    currentItem: null,

    defaultcolor: 'lightgray',
    actorHighlight: 'orange',
    showHighlight: 'lightblue',
    actorSelect: 'pink',
    showSelect: 'purple',
    selectedActors: [],
    selectedShows: [],

    clearSelection: function() {
        for (var i = 0; i < rel.selectedActors.length; i++) {
            rel.highlightActor(rel.selectedActors[i], rel.defaultcolor, 'black', 0.5, 1);
        }
        
        for (var i = 0; i < rel.selectedShows.length; i++) {
            rel.highlightShow(rel.selectedShows[i], rel.defaultcolor, 'black', 0.5, 1);
        }
    },
        
    toggleSelectedActor: function(actor) {
        rel.clearSelection();
        
        if ($.inArray(actor, rel.selectedActors) !== -1) {
            rel.removeItem(actor, rel.selectedActors);
        } else {
            rel.selectedActors.push(actor);
        }
        
        rel.selectedShows.length = 0;
        
        rel.drawIntersectionActors();
    },
    
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

    drawIntersectionActors: function() {
         var shows = [];
         //console.log("rel.selectedActors.length: " + rel.selectedActors.length);
         
         for (var i = 0; i < rel.selectedActors.length; i++) {
             for (var j = 0; j < rel.selectedActors[i].shows.length; j++) {
                 rel.highlightShow(rel.selectedActors[i].shows[j], rel.defaultcolor, 'black', 0.5, 1);
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

    toggleSelectedShow: function(show) {
        rel.clearSelection();
        if ($.inArray(show, rel.selectedShows) !== -1) {
            rel.removeItem(show, rel.selectedShows);
        } else {
            rel.selectedShows.push(show);
        }
        
        rel.selectedActors.length = 0;
        
        rel.drawIntersectionShows();
    },
    
    drawIntersectionShows: function() {
         var actors = [];
         //console.log("rel.selectedShows.length: " + rel.selectedShows.length);
         
         for (var i = 0; i < rel.selectedShows.length; i++) {
             for (var j = 0; j < rel.selectedShows[i].actors.length; j++) {
                 rel.highlightActor(rel.selectedShows[i].actors[j], rel.defaultcolor, 'black', 0.5, 1);
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
    
    highlightActor: function(actor, color, textColor, opacity, strokeWidth) {
               
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
    
    highlightShow: function(show, color, textColor, opacity, strokeWidth) {

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
    
    createActor: function(name, x, y) {
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

            draw: function() {
                this.paths = this.drawConnections();
                
                this.dot = new Path.Circle(x, y, this.shows.length * 2);
                this.dot.fillColor = rel.defaultcolor;
                this.dot.strokeWidth = 0;
                this.dot.rel = this;
                
                this.text = new PointText(new Point(x - 20, y + 5));
                this.text.content = name;
                this.text.characterStyle =  {
                    fontSize: 10,
                    fillColor: 'black'
                };
                this.text.paragraphStyle.justification = 'right';
                this.text.rel = this;
            },

            mouseover: function() {
                rel.highlightActor(this, rel.actorHighlight, rel.actorHighlight, 1, 2);
            },

            mouseout: function() {
                rel.highlightActor(this, rel.defaultcolor, 'black', 0.5, 1);
                rel.drawIntersectionActors();
                rel.drawIntersectionShows();
            },

            click: function() {
                 console.log(this.getName() + '.clicked');
                 rel.toggleSelectedActor(this);
            },
            
            drawConnections: function() {
                var actor = this;
                var paths = []
                
                _.each(this.shows, function (show) {
                    //console.log('draw line: M' + actor.x() + ' ' + actor.y() + 'L' + show.x() + ' ' + show.y());

                    var p = new Path.Line(new Point(actor.x(), actor.y()), new Point(show.x(), show.y()));
                    p.strokeColor = rel.defaultcolor;
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
    
    createShow: function(name, x, y) {
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
            
            draw: function() {
                if (this.hasDrawn) {
                    return;
                }

                this.dot = new Path.Circle(x, y, this.actors.length);
                this.dot.fillColor = rel.defaultcolor;
                this.dot.strokeWidth = 0;
                this.dot.rel = this;
                
                this.text = new PointText(new Point(x + 20, y + 5));
                this.text.content = name;
                this.text.characterStyle =  {
                    fontSize: 14,
                    fillColor: 'black'
                };
                this.text.rel = this;

                this.hasDrawn = true;
            },

            mouseover: function() {
                rel.highlightShow(this, rel.showHighlight, rel.showHighlight, 1, 2);
            },

            mouseout: function() {
                rel.highlightShow(this, rel.defaultcolor, 'black', 0.5, 1);
                rel.drawIntersectionShows();
                rel.drawIntersectionActors();
            },

            click: function() {
                console.log(this.getName() + '.clicked');
                rel.toggleSelectedShow(this);
            },

            getDot: function() {
                 return this.dot;
            }
            
        };
    }
};

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

function onMouseUp(event) {
    var hitResult = project.hitTest(event.point, rel.hitOptions);

    //console.log('hitResult: ' + hitResult);
    
    if (hitResult && hitResult.item && hitResult.item.rel) {
        hitResult.item.rel.click();
    }
}



jQuery(document).ready(function() {
    var x = 250;
    var y = 50;
    
    
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

    showNames = _.sortBy(showNames, function(show) {
        if (show.indexOf('The') === 0) {
            return show.substring(4);
        } else {
            return show;
        }
    });

    showNames = _.uniq(showNames, true);

    var actors = _.map(actorNames, function (name) {
        var actor = rel.createActor(name, x, y);
        y += 14;
        return actor;
    });

    var actorY = y;

    x = 700;
    y = 50;

    var shows = _.map(showNames, function (name) {
        var show = rel.createShow(name, x, y);
        y += 40;
        
        return show;
    });
    
    _.each(shows, function (show) {
        _.each(actors, function (actor) {
            if (_.indexOf(DATA[actor.getName()], show.getName(), false) > -1) {
                actor.addShow(show);
            }
        });
    });
    
    $('#canvas').css({
        'background-color': '#E9E9E9'
    });

    $('#canvas').attr('height', (actorY + 100) + 'px');
    $('#canvas').attr('width', '1200px');

    _.each(actors, function (actor) {
        actor.draw();
    });
});

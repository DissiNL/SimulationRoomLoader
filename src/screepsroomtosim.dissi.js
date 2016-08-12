// ==UserScript==
// @name         Auto-room loader for screeps
// @namespace    https://screeps.com/a/#!/sim/custom
// @version      1.3
// @description  try to take over the world!
// @author       Mark Bertels
// @match        https://screeps.com/a/#!/sim/custom
// @grant        none
// @run-at       context-menu
// ==/UserScript==
function getOffset(el) {
    el = el.getBoundingClientRect();
    return {
        left: el.left + window.scrollX,
        top: el.top + window.scrollY
    };
}

function simulateClickAtLocation(theX, theY, element, includeMouseDownMouseUp) {

    var offset = getOffset(element);
    var offsetPerElement = element.offsetHeight / 50;      // middle of square click.
    var xToFireFromClient = (offsetPerElement * theX) + (offsetPerElement/2);
    var yToFireFromClient = (offsetPerElement * theY) + (offsetPerElement/2);

    var xToFireFromScreen = Math.round(offset.left + xToFireFromClient);
    var yToFireFromScreen = Math.round(offset.top + yToFireFromClient);
    var eventData = {"clientX" : xToFireFromScreen, "clientY" :yToFireFromScreen , "button" : 0, "buttons" : 1};
    var evtDataBtnDown = {"clientX" : xToFireFromScreen+1, "clientY" :yToFireFromScreen +1, "button" : 0, "buttons" : 1};
    var evtDataBtnDownMv = {"clientX" : xToFireFromScreen, "clientY" :yToFireFromScreen , "button" : 0, "buttons" : 1};
    var evtDataBtnDownMvPx = {"clientX" : xToFireFromScreen+1, "clientY" :yToFireFromScreen +1, "button" : 0, "buttons" : 1};
    var evtDataBtnUp = {"clientX" : xToFireFromScreen+1, "clientY" :yToFireFromScreen +1, "button" : 0, "buttons" : 0};
    element.dispatchEvent(new MouseEvent("mousedown", evtDataBtnDown)); // somehow we need a click 
    element.dispatchEvent(new MouseEvent("mousemove", evtDataBtnDownMv)); // Move mouse to same x/y 
    element.dispatchEvent(new MouseEvent("mousemove", evtDataBtnDownMvPx)); // Move mouse to x/y with 1 pixel offset
    element.dispatchEvent(new MouseEvent("mouseup", eventData)); // we need a mouse up  
}

function loadData(theData)
{
    var createButtons = {};
    var element = $('.cursor-layer')[0];
    var allButtons = $('*').find(":button");
    for(var btn = 0; btn < allButtons.length; btn++)
    {
        var button = $(allButtons[btn]);
        var attr = button.attr('ng:class');
        if(attr == "{'md-primary': Room.selectedAction.action == 'customize'}")
        {
            button.click();
            break;
        }
    }

    var results = $('.aside-content');
    for(var i = 0 ; i < results.length; i++)
    {
        var buttons = $(results[i]).find(':button');
        for(var b = 0; b < buttons.length; b++)
        {
            var toCheck = $(buttons[b]);

            var clz = toCheck.attr('ng:class');
            if(clz && clz.indexOf('Room.selectedAction.customize.type') !== -1)
            {
                var start = clz.lastIndexOf(".type == '");
                var toCutOff = clz.lastIndexOf("'");
                var type = clz.substring( (start + 10) , toCutOff);
                createButtons[type] = toCheck;
            }
            else if(clz == "{'md-raised': Room.selectedAction.customize == 'erase'}")
            {
                createButtons['erase'] = toCheck;
                console.log('Found erase button: '  + toCheck);
            }
        }
    }

    var toolNow;
    var toErase = [];
    console.log('Loading floorplan... ' + theData.terrain[0].room);
    
    for(var t = 0 ; t < theData.terrain[0].terrain.length; t++)
    {
        var terrainNow = Number(theData.terrain[0].terrain[t]);
        var y = Math.floor(t/50);
        var x = (t%50);
        if(terrainNow == 0)
        {
            // if(toolNow != 'erase')
            {
                createButtons.erase.click();
                toolNow = 'erase';
            }
            simulateClickAtLocation(x,y,element);
        }
        else if((terrainNow & 1) == 1)
        {
            // if(toolNow != 'wall')
            {
                createButtons.wall.click();
                toolNow = 'wall';
            }
            simulateClickAtLocation(x,y,element);
        }
        else if( (terrainNow & 2) == 2)
        {
            // if(toolNow != 'swamp')
            {
                createButtons.swamp.click();
                toolNow = 'swamp';
            }
            simulateClickAtLocation(x,y,element);
        }
    }
    createButtons.controller.click();
    var endTime = new Date().getTime();
    var totalTime = endTime -startLoad;
    alert("Done loading room in " + totalTime + 'ms');
}
var startLoad;
(function() {

    var roomToLoad = prompt("Please enter your room name", "W12N12");
    if(roomToLoad !== null)
    {
        startLoad = new Date().getTime();
        $.ajax({
            url: "https://screeps.com/api/game/room-terrain?room="+roomToLoad+"&encoded=true",
            success: loadData,
            dataType: "json"
        });
    }

})();   
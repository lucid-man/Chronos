function printClock(canvas, hours, minutes, seconds) {
    
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0,0, width, height);

    // Drawing the outer circle of the clock
    const radius = width/2 - 5;
    // Coordinates of the center of the circle
    const x = width/2;
    const y = height/2;
    
    ctx.lineWidth = width / 25;
    ctx.beginPath();
    ctx.arc(width/2, height/2, width/2 - 5, 0, Math.PI * 2, false);
    ctx.moveTo(0, 0);
    ctx.stroke();
    ctx.closePath();

    //Drawing lines with numbers on the clock
    for (var degree = 1; degree < 13; degree++) {
        // The coordinates of a point on a circle
        // a point on a circle with center (x,y), radius r and at an angle of a, has the coordinates
        // (r cos(a) + x, r sin(a) + y)

        const angle = (degree - 3) / 12 * 2 * Math.PI;



        var coordinates = [
            radius * Math.cos(angle) + x, radius * Math.sin(angle) + y, 
            (radius - radius/10) * Math.cos(angle) + x, (radius - radius/10) * Math.sin(angle) + y,
            (radius - radius/5) * Math.cos(angle) + x, (radius - radius /5) * Math.sin(angle) + y
        ]
        
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(coordinates[0], coordinates[1]);
        ctx.lineTo(coordinates[2], coordinates[3]);
        ctx.stroke();
        ctx.closePath();

        const numbersFontSize = width / 12;
        ctx.font = numbersFontSize + "px Arial";
        ctx.fillText(degree, coordinates[4] - width / 30, coordinates[5] + width / 30);
        
        
    }

    // Drawing the seconds pointer
    const secondsPointerLength = (width/2) / 1.3;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(x, y);

    const secondsAngle = (seconds -15) / 60 * 2 * Math.PI;
    coordinates = [secondsPointerLength * Math.cos(secondsAngle) + x, secondsPointerLength * Math.sin(secondsAngle) + y];

    ctx.lineTo(coordinates[0], coordinates[1]);
    ctx.stroke();
    ctx.closePath();


    // Drawing the minutes pointer 
    const minutesPointerLength = (width/2) / 1.2;
    ctx.lineWidth = 1 + (width/100);
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(x,y);

    const minutesAngle = (minutes - 15 + (seconds / 60)) / 60 * 2 * Math.PI;
    coordinates = [minutesPointerLength * Math.cos(minutesAngle) + x, minutesPointerLength * Math.sin(minutesAngle) + y];

    ctx.lineTo(coordinates[0], coordinates[1]);
    ctx.stroke();
    ctx.closePath();


    // Drawing the hours pointer
    const hoursPointerLenght = (width / 2) / 1.6;
    

    ctx.beginPath();
    ctx.lineWidth = 4 + width / 100;
    ctx.moveTo(x,y);

    if (hours > 12) hours -= 12;
    const hoursAngle = (hours - 3 + (minutes / 60)) / 12 * 2 * Math.PI;
    coordinates = [hoursPointerLenght * Math.cos(hoursAngle) + x, hoursPointerLenght * Math.sin(hoursAngle) + y];

    ctx.lineTo(coordinates[0], coordinates[1]);
    ctx.stroke();
    ctx.closePath();

}

function printTimeText(index) {
    var date = changeTimeZone(new Date(), timezones[index]);
    $("#clockcontainer-" + index +" h5").text(date.toTimeString().split(" ")[0]);
}

function cloneAndSetupClockContainer(timeZone) {
    const clockContainerDiv = $('div[id^="clockcontainer-"]:last');

    var num = parseInt( clockContainerDiv.prop("id").split("-")[1] ) + 1;
    console.log("BTN PRESSED! num = " + num);

    const newId = 'clockcontainer-' + num;

    var clone = clockContainerDiv.clone().prop('id', newId);

    clockContainerDiv.after(clone);

    clocks.push(document.querySelector("#" + newId +" canvas"));
    timezones.push(timeZone);

    intervalIdList.push(window.setInterval(function () {
        clone.children("h4").text(timeZone);
        var date = changeTimeZone(new Date(), timezones[num]);
        printTimeText(num);
        printClock(clocks[num], date.getHours(), date.getMinutes(), date.getSeconds());
    }, 1000))
}

function changeTimeZone(date, timeZone) {
    return new Date(date.toLocaleString('en-US', {timeZone}));
}

function removeClock(index) {
    clearInterval(intervalIdList[index]);
    intervalIdList.splice(index, 1);
    clocks.splice(index, 1);
    timezones.splice(index, 1);

}

const current_time_canvas = document.querySelector("#canvas_current_time_clock");

var clocks = [];
var timezones = [];
clocks.push(current_time_canvas);
timezones.push(Intl.DateTimeFormat().resolvedOptions().timeZone)

$("#clockcontainer-0 h4").text(timezones[0]);

var intervalIdList = [];
intervalIdList.push(window.setInterval(function() {
    printClock(current_time_canvas, new Date().getHours(), new Date().getMinutes(), new Date().getSeconds());
    printTimeText(0);
}, 1000));



$("#add-clock-btn").click(function (e) {

    const city = $("#city-name-input").val();
    if (city === "") {
        alert("Please enter the name of a city which time you want to see.");
        return;
    }

    $(".overlay-container").css("display", "block");

    $.ajax({
        method: 'GET',
        url: 'https://api.api-ninjas.com/v1/timezone?city=' + city,
        headers: { 'X-Api-Key': 'STe70kdIHE6Q8OyTnNNAmQ==iYYjPQotKZo5HG5Z'},
        contentType: 'application/json',
        success: function(result) {
            console.log(result);
            cloneAndSetupClockContainer(result.timezone);
            $(".overlay-container").css("display", "none");
        },
        error: function ajaxError(jqXHR) {
            alert("Invalid data. Make sure you are writing an english name of the city, and that it is not a city which is too small!");
            $(".overlay-container").css("display", "none");
            console.error('Error: ', jqXHR.responseText);
        }
    });
});
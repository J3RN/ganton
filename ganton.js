var config = {
	channels: ["#cwdg", "#osuosc"],
	server: "chat.freenode.net",
	botName: "ganton-test"
};

var irc = require("irc");
var http = require("http");
var request = require("request");

var base_url = "https://directory.osu.edu/fpjson.php?";

var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
});

function stalkPerson(params, bot, to) {
    var url = base_url;

    for (var ident in params) {
        url = url.concat(ident + "=");
        url = url.concat(encodeURIComponent(params[ident]));
        url = url.concat("&")
    }

    // Debugging
    console.log(url);

    // OK, this is a little weird
    var person = request({
        url: url,
        headers: {
            'User-Agent': 'Ganton by J3RN'
        }
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var json_response = JSON.parse(body);
            // console.log(JSON.stringify(json_response));
            if (json_response.length > 0) {
                var person = json_response[0];
                sendReply(bot, to, person);
            } else {
                sendReply(bot, to, undefined);
            }
        } else if (error) {
            console.log(error);
        } else {
            console.log(response.statusCode);
        }
    });
}

function sendReply(bot, to, person) {
    if (person) {
        var message = person.display_name + " has the email " + person.username;
        for (var i in person.majors) {
            message += ", majors in " + person.majors[i].major;
        }
				for (var i in person.appointments) {
					message += ", works as a " + person.appointments[i].job_title + " at " + person.appointments[i].organization;
				}
        bot.say(to, message);
    } else {
        bot.say(to, "No data found");
    }
}

bot.addListener("message", function(from, to, text, message) {
    params = {};

    if (text.match(/\<find-dot-number (.*)/)) {
        params["name_n"] = text.match(/\<find-dot-number (\w+)/)[1];
    }

    if (text.match(/\<find-fname (.*)/)) {
        params["firstname"] = text.match(/\<find-fname (\w+)/)[1];
    }

    if (text.match(/\<find-lname (.*)/)) {
        params["lastname"] = text.match(/\<find-lname (\w+)/)[1];
    }

    if (Object.keys(params)) {
        stalkPerson(params, bot, to);
    }
});

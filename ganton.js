var config = {
	channels: ["#cwdg"],
	server: "irc.freenode.net",
	botName: "ganton"
};

var irc = require("irc");
var http = require("http");
var request = require("request");

var base_url = "http://directory.osu.edu/fpjson.php?";

var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
});

function replyPerson(param, value) {
    var url = base_url;
    url = url.concat(param + "=").concat(encodeURIComponent(value));

    // Debugging
    console.log(url);

    request({
        url: url,
        headers: {
            'User-Agent': 'Ganton by J3RN'
        }
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var json_response = JSON.parse(body);
            console.log(JSON.stringify(json_response));
            if (json_response.length > 0) {
                var person= json_response[0];
                message = person.display_name + " has the email " + person.username;
                for (var i in person.majors) {
                    message += ", majors in " + person.majors[i].major;
                }
                bot.say(to, message);
            } else {
                bot.say(to, "No data found");
            }
        }
        else if (error) {
            console.log(error);
        } else {
            console.log(response.statusCode);
        }
    });
}

bot.addListener("message", function(from, to, text, message) {
	if (text.indexOf("<find-dot-number") == 0) {
		var dotnumber= text.substring("<find-dot-number".length + 1);
		console.log(dotnumber);
        replyPerson("name_n", dotnumber);
    } else (text.substring(0, 11) == "<find-fname") {
        var fname = text.match(/\<find-fname (.*)/)[1];
        replyPerson("firstname", fname);
    } else (text.substring(0, 11) == "<find-lname") {
        var lname = text.match(/\<find-lname (.*)/)[1];
        replyPerson("lastname", lname);
    }
});

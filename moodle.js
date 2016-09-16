var request = require('request');
var iconv 	= require('iconv-lite');
var cheerio = require('cheerio');
var moment	= require('moment');
var j = request.jar();

var usr = 'isu10303118a';
var pass = '';

moodleLoginURL = 'http://moodle.isu.edu.tw/login/index.php';
moodleMyPageURL= 'http://moodle.isu.edu.tw/my/index.php?mynumber=0';

var login = function( usr, pass, callback) {

	request({
			url: moodleLoginURL,
			method: 'POST',
			encoding: 'utf-8',
			followAllRedirects: true,
			jar: j,
			form: {
				username: usr, 
				password: pass
			}
		}, function (e, r, b) {
			callback(/logout\.php/.test(b));
		});
} 

var analyzerMoodle = function( source, callback ) {
    $ = cheerio.load(source);

	$("div[class='box coursebox']").each(
		function(i, elemi) {

			var className = $(elemi).find(".title").text().split('_')[1];
			var classLink = $(elemi).find("a").attr('href');
			var classActivity = $(elemi).find(".activity_info");

			console.log('***\t\t%s\t\t***', className);
			classActivity.find("div[class='assign overview']").each( 
				function(j, elemj) 
				{
					var hwName = $(elemj).find("a").text();
					var hwInfo = $(elemj).find(".info").text();
					var hwLink = $(elemj).find("a").attr('href');
					var hwDetl = $(elemj).find(".details").text();

					var m = moment(hwInfo,'YYYYMMDD');  
					var today = moment().startOf('day');
					var days = Math.round(moment.duration(m - today).asDays());

					console.log('*\thome work:\t\t%s\n' +
								'*\tinfo:\t\t%s\n' +
								'*\tdetail:\t\t%s\n' +
								'*\tlink:\t\t%s\n' +
								'*\tExpired:\t\t%s',  
								hwName, 
								hwInfo, 
								hwDetl, 
								hwLink,
								(days < 0) ? (-days + ' days ago') : ('after' + days + ' days'));
				});

			classActivity.find("div[class='overview forum']").each( 
				function(j, elemj) 
				{
					var alertName = $(elemj).find("a").text();
					var alertInfo = $(elemj).find(".info").text();
					var alertLink = $(elemj).find("a").attr('href');

					console.log('*\talert:\t\t%s\n' +
								'*\tinfo:\t\t%s\n' +
								'*\tlink:\t\t%s\n',
								alertName, 
								alertInfo, 
								alertLink);

				});

			console.log('***\t\tend\t\t***\n\n')
		});


}


var displyNowClass = function() {

	request.get({
				url: moodleMyPageURL,
				encoding: 'utf-8',
				jar: j,
			}, 	function(e ,r ,b) {
					console.log('got source code from moodle');
					analyzerMoodle(b);
				}
			);
}

console.log('try to login %s...', usr);
login( usr, pass, function( sucess ) {
	if (!sucess) {
		console.log('login fail!');
		return;
	}
	console.log('try to get moodle page');
	displyNowClass();
});

/*
Rdio
API Key: c6rv7hex6jacaeujwhyesd3k
Shared Secret: KKDtQNQKBE

Last.fm
API Key: 0cc6c91b6bf535eddc5fd9526eec1bb6
Secret: 8a1487b224d940518bcc9f17aae1d5b5

Tinysong
API Key: b4385955bd9dd410287d0b3c7ffee5c8
*/

$.ajax({
	url: 'http://tinysong.com/b/Beethoven?format=json&key=b4385955bd9dd410287d0b3c7ffee5c8',
	success: function(data){
		console.log(data);
	}
});

$.getJSON('http://tinysong.com/b/Beethoven?format=json&key=b4385955bd9dd410287d0b3c7ffee5c8&callback=?', function(data){
    console.log(data);
});